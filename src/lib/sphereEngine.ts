import { buildGeodesic, type Geodesic } from './geodesic'

/**
 * Imperative renderer for the hero's geodesic sphere.
 *
 * Canvas 2D with a small hand-written 3D pipeline rather than WebGL: the
 * scene is a few thousand line segments, which Canvas strokes with true
 * sub-pixel, anti-aliased hairlines (WebGL lines are 1px and aliased), it
 * needs no dependency, and it works on every browser without a fallback path.
 *
 * Per frame: rotate + project every vertex once, cull edges against the
 * camera's horizon, then batch edges into a handful of brightness buckets so
 * thousands of lines cost ~25 stroke calls.
 */

export type RGB = readonly [number, number, number]
export type SpherePalette = { ink: RGB; accent: RGB; bg: RGB }

export type SphereLayout = {
  /** Sphere radius as a fraction of min(width, height). */
  radius: number
  /** Vertical offset of the centre as a fraction of height (negative = up). */
  offsetY: number
}

// ── Camera ──────────────────────────────────────────────────────────────────
/** Camera distance in sphere radii. Lower = stronger perspective. */
const CAM = 3.4
/** Points on the unit sphere with rotated z above this face the camera. */
const ZH = 1 / CAM
const RH = Math.sqrt(1 - ZH * ZH)

// ── Look ────────────────────────────────────────────────────────────────────
const BASE_BUCKETS = 16
const GLOW_BUCKETS = 8
const ALPHA_FLOOR = 0.05
const ALPHA_CEIL = 0.92
/** Target on-screen edge length in CSS px; mesh frequency follows from it. */
const TARGET_EDGE_PX = 34
const MIN_FREQUENCY = 6
const MAX_FREQUENCY = 14
/** Key light, view space: upper left, slightly in front. */
const LIGHT = normalize(-0.52, 0.6, 0.6)
const HOVER_COS = Math.cos(0.3)

// ── Motion ──────────────────────────────────────────────────────────────────
const IDLE_YAW_SPEED = 0.075 // rad/s — one turn in ~84s
const INTRO_SECONDS = 2.6
const RIPPLE_SPEED = 1.35 // rad/s across the surface
const RIPPLE_BAND = 0.15

type Traveller = {
  from: number
  to: number
  /** Up to two vertices already passed, for the comet tail. -1 when empty. */
  back1: number
  back2: number
  t: number
  speed: number
  age: number
  life: number
}

type Ripple = { x: number; y: number; z: number; age: number }

export class SphereEngine {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly reduced: boolean
  private readonly layout: SphereLayout
  private readonly palette: SpherePalette

  private geo!: Geodesic
  private rot = new Float32Array(0)
  private scr = new Float32Array(0)
  private glow = new Float32Array(0)
  private lit = new Float32Array(0)
  private baseBuf: Float32Array[] = []
  private baseLen = new Int32Array(BASE_BUCKETS)
  private glowBuf: Float32Array[] = []
  private glowLen = new Int32Array(GLOW_BUCKETS)

  private baseStyles: string[] = []
  private baseWidths: number[] = []
  private glowStyles: string[] = []
  private glowWidths: number[] = []
  private haloStyles: string[] = []
  private bodyFill: CanvasGradient | null = null
  private rimStroke: CanvasGradient | null = null
  private spriteWarm: HTMLCanvasElement
  private spriteInk: HTMLCanvasElement
  private trailSoft: RGB = [0, 0, 0]
  private trailCore: RGB = [0, 0, 0]

  private width = 0
  private height = 0
  private dpr = 1
  private cx = 0
  private cy = 0
  private radius = 0
  private focal = 0
  private frequencyCap = MAX_FREQUENCY

  private readonly m = new Float32Array(9)
  private raf = 0
  private lastNow = 0
  private time = 0
  private intro = 0
  private onScreen = true
  private destroyed = false

  // Orientation is a sum of independent layers, each with its own easing.
  private idleYaw = 0.9
  private tiltYaw = 0
  private tiltPitch = 0
  private targetTiltYaw = 0
  private targetTiltPitch = 0
  private dragYaw = 0
  private dragPitch = 0
  private velYaw = 0
  private velPitch = 0
  private scroll = 0
  private scrollEased = 0

  private dragging = false
  private dragId = -1
  private dragStartX = 0
  private dragStartY = 0
  private dragLastX = 0
  private dragLastY = 0
  private dragLastT = 0
  private dragTravel = 0

  private pointerInside = false
  private pointerX = 0
  private pointerY = 0
  private hover = 0
  private readonly hoverObj = new Float32Array([0, 0, 1])
  private ripples: Ripple[] = []
  private travellers: Traveller[] = []
  private travellerTarget = 12
  private twinkleIn = 0.4
  private clusterIn = 5

  private workEma = 0
  private frames = 0

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, palette: SpherePalette, opts: { reducedMotion: boolean; layout: SphereLayout }) {
    this.canvas = canvas
    this.ctx = ctx
    this.reduced = opts.reducedMotion
    this.layout = opts.layout

    const warm = mix(palette.ink, palette.accent, 0.55)
    this.spriteWarm = makeSprite(warm)
    this.spriteInk = makeSprite(palette.ink)
    this.trailSoft = palette.accent
    this.trailCore = mix(palette.ink, palette.accent, 0.12)

    for (let k = 0; k < BASE_BUCKETS; k++) {
      const f = (k + 0.5) / BASE_BUCKETS
      this.baseStyles.push(rgba(palette.ink, ALPHA_FLOOR + f * (ALPHA_CEIL - ALPHA_FLOOR)))
      this.baseWidths.push(0.48 + f * 0.7)
    }
    // Highlights are amber cores painted over the white line they replace,
    // plus a wide additive halo. (Additive alone would just saturate to white.)
    const amber = mix(palette.accent, palette.ink, 0.28)
    for (let k = 0; k < GLOW_BUCKETS; k++) {
      const f = (k + 0.5) / GLOW_BUCKETS
      this.glowStyles.push(rgba(amber, 0.2 + f * 0.8))
      this.glowWidths.push(0.75 + f * 0.7)
      this.haloStyles.push(rgba(palette.accent, f * 0.2))
    }

    this.palette = palette

    if (this.reduced) {
      this.intro = 1
      this.idleYaw = 1.15
    } else {
      window.addEventListener('pointermove', this.onWindowMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', this.onWindowLeave)
      canvas.addEventListener('pointermove', this.onCanvasMove)
      canvas.addEventListener('pointerdown', this.onDown)
      canvas.addEventListener('pointerup', this.onUp)
      canvas.addEventListener('pointercancel', this.onCancel)
      canvas.addEventListener('pointerleave', this.onCanvasLeave)
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  resize(width: number, height: number) {
    if (this.destroyed) return
    this.width = width
    this.height = height
    this.dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.75 : 2)
    this.canvas.width = Math.max(1, Math.round(width * this.dpr))
    this.canvas.height = Math.max(1, Math.round(height * this.dpr))

    this.radius = Math.min(width, height) * this.layout.radius
    this.cx = width / 2
    this.cy = height / 2 + height * this.layout.offsetY
    // Choose focal so the projected silhouette lands exactly on `radius`.
    this.focal = (this.radius * (CAM - ZH)) / RH

    const ideal = Math.round((this.radius * 1.107) / TARGET_EDGE_PX)
    const frequency = clamp(ideal, MIN_FREQUENCY, this.frequencyCap)
    if (!this.geo || this.geo.frequency !== frequency) this.setGeometry(frequency)

    this.travellerTarget = this.radius < 220 ? 7 : 12
    this.buildGradients()

    if (this.reduced || !this.raf) this.draw()
    this.sync()
  }

  /** 0 at rest, 1 once the hero has scrolled away. */
  setScroll(progress: number) {
    this.scroll = clamp(progress, 0, 1)
  }

  setOnScreen(onScreen: boolean) {
    this.onScreen = onScreen
    this.sync()
  }

  destroy() {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
    this.raf = 0
    window.removeEventListener('pointermove', this.onWindowMove)
    document.documentElement.removeEventListener('pointerleave', this.onWindowLeave)
    const c = this.canvas
    c.removeEventListener('pointermove', this.onCanvasMove)
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onCancel)
    c.removeEventListener('pointerleave', this.onCanvasLeave)
  }

  // ── Loop ──────────────────────────────────────────────────────────────────

  private sync() {
    const shouldRun = !this.destroyed && !this.reduced && this.onScreen && this.width > 0
    if (shouldRun && !this.raf) {
      this.lastNow = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    } else if (!shouldRun && this.raf) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
    }
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    // Clamp so a resumed tab or a long GC pause never makes the sphere lurch.
    const dt = Math.min(0.05, Math.max(0, (now - this.lastNow) / 1000))
    this.lastNow = now

    const t0 = performance.now()
    this.step(dt)
    this.draw()
    this.adapt(performance.now() - t0)
  }

  /**
   * If the draw itself (not the frame interval, which throttling inflates) is
   * consistently slow, drop to a coarser mesh. Ratchets down only.
   */
  private adapt(ms: number) {
    this.frames++
    this.workEma = this.frames < 10 ? ms : this.workEma * 0.94 + ms * 0.06
    if (this.frames > 120 && this.workEma > 9 && this.geo.frequency > MIN_FREQUENCY) {
      this.frequencyCap = Math.max(MIN_FREQUENCY, this.geo.frequency - 2)
      this.frames = 0
      this.resize(this.width, this.height)
    }
  }

  private step(dt: number) {
    this.time += dt
    if (this.intro < 1) this.intro = Math.min(1, this.intro + dt / INTRO_SECONDS)

    this.idleYaw += dt * IDLE_YAW_SPEED

    // Hovering the sphere tightens the follow; leaving lets it drift back.
    const follow = this.pointerInside ? 4.2 : 1.8
    this.tiltYaw = damp(this.tiltYaw, this.targetTiltYaw, follow, dt)
    this.tiltPitch = damp(this.tiltPitch, this.targetTiltPitch, follow, dt)
    this.hover = damp(this.hover, this.pointerInside && !this.dragging ? 1 : 0, this.pointerInside ? 7 : 3, dt)
    this.scrollEased = damp(this.scrollEased, this.scroll, 6, dt)

    if (!this.dragging) {
      // Released spins coast, then hand back to the idle drift.
      this.dragYaw += this.velYaw * dt
      this.dragPitch += this.velPitch * dt
      this.velYaw = damp(this.velYaw, 0, 1.5, dt)
      this.velPitch = damp(this.velPitch, 0, 2.2, dt)
      // Yaw keeps wherever it was flung; pitch settles so it never rests upside down.
      this.dragPitch = damp(this.dragPitch, 0, 0.7, dt)
    }

    for (let i = 0; i < this.glow.length; i++) this.glow[i] *= Math.exp(-dt * 1.7)

    for (const r of this.ripples) r.age += dt
    this.ripples = this.ripples.filter((r) => r.age * RIPPLE_SPEED < Math.PI * 0.85)

    this.updateTravellers(dt)
    this.updateTwinkles(dt)
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  private draw() {
    const { ctx, geo, rot, scr, glow, lit, m } = this
    if (!geo || this.width === 0) return

    const introEase = 1 - Math.pow(1 - this.intro, 3)
    const s = this.reduced ? 1 : 0.9 + 0.1 * introEase - this.scrollEased * 0.06

    // Orientation: yaw, then pitch, then a slow roll. R = Rz · Rx · Ry.
    const spin = (1 - introEase) * -1.2
    const yaw = this.idleYaw + this.tiltYaw + this.dragYaw + this.scrollEased * 0.9 + spin
    const pitch = 0.2 + 0.12 * Math.sin(this.time * 0.19) + this.tiltPitch + this.dragPitch + this.scrollEased * 0.3
    const roll = 0.06 * Math.sin(this.time * 0.11 + 1.3)
    rotation(m, yaw, pitch, roll)
    // Keep the hover light pinned under a still cursor while the surface turns.
    if (this.pointerInside && !this.dragging) this.pick(this.pointerX, this.pointerY)

    const P = geo.positions
    const n = geo.vertexCount
    const focal = this.focal
    const hoverAmt = this.hover
    const hx = this.hoverObj[0]
    const hy = this.hoverObj[1]
    const hz = this.hoverObj[2]

    for (let i = 0, i3 = 0, i2 = 0; i < n; i++, i3 += 3, i2 += 2) {
      const x = P[i3]
      const y = P[i3 + 1]
      const z = P[i3 + 2]
      const X = m[0] * x + m[1] * y + m[2] * z
      const Y = m[3] * x + m[4] * y + m[5] * z
      const Z = m[6] * x + m[7] * y + m[8] * z
      rot[i3] = X
      rot[i3 + 1] = Y
      rot[i3 + 2] = Z
      if (Z > ZH - 0.15) {
        const w = focal / (CAM - Z)
        scr[i2] = X * w
        scr[i2 + 1] = -Y * w
      }
      let h = glow[i]
      if (hoverAmt > 0.01) {
        const d = x * hx + y * hy + z * hz
        if (d > HOVER_COS) {
          const near = smooth(HOVER_COS, 1, d)
          h = Math.max(h, hoverAmt * near * near * 0.62)
        }
      }
      lit[i] = h
    }

    this.collectEdges(introEase)

    // ── paint ──
    const dpr = this.dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(dpr * s, 0, 0, dpr * s, this.cx * dpr, this.cy * dpr)
    ctx.lineCap = 'round'

    const r = this.radius
    ctx.globalAlpha = introEase
    ctx.fillStyle = this.bodyFill!
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1
    for (let k = 0; k < BASE_BUCKETS; k++) {
      const len = this.baseLen[k]
      if (!len) continue
      strokeSegments(ctx, this.baseBuf[k], len, this.baseStyles[k], this.baseWidths[k])
    }

    const haloWidth = clamp(this.radius / 110, 2.4, 4)
    ctx.globalCompositeOperation = 'lighter'
    for (let k = 0; k < GLOW_BUCKETS; k++) {
      const len = this.glowLen[k]
      if (len) strokeSegments(ctx, this.glowBuf[k], len, this.haloStyles[k], haloWidth)
    }
    ctx.globalCompositeOperation = 'source-over'
    for (let k = 0; k < GLOW_BUCKETS; k++) {
      const len = this.glowLen[k]
      if (len) strokeSegments(ctx, this.glowBuf[k], len, this.glowStyles[k], this.glowWidths[k])
    }

    this.drawTravellers(introEase)
    ctx.globalCompositeOperation = 'lighter'
    this.drawNodes(introEase)
    ctx.globalCompositeOperation = 'source-over'

    // Rim light: a lit arc on the key-light side, gone by the far side.
    ctx.globalAlpha = introEase
    ctx.strokeStyle = this.rimStroke!
    ctx.lineWidth = 1.1
    ctx.beginPath()
    ctx.arc(0, 0, r - 0.4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  private collectEdges(introEase: number) {
    const { geo, rot, scr, lit, m } = this
    const E = geo.edges
    const M = geo.midpoints
    const focal = this.focal
    const baseLen = this.baseLen
    const glowLen = this.glowLen
    baseLen.fill(0)
    glowLen.fill(0)

    const revealing = introEase < 1
    const reveal = introEase * 1.45
    const ripples = this.ripples
    const lx = LIGHT[0]
    const ly = LIGHT[1]
    const lz = LIGHT[2]

    for (let e = 0, e2 = 0, e3 = 0; e < geo.edgeCount; e++, e2 += 2, e3 += 3) {
      const ox = M[e3]
      const oy = M[e3 + 1]
      const oz = M[e3 + 2]
      const MZ = m[6] * ox + m[7] * oy + m[8] * oz
      if (MZ < ZH - 0.1) continue

      const a = E[e2]
      const b = E[e2 + 1]
      const za = rot[a * 3 + 2]
      const zb = rot[b * 3 + 2]
      const aIn = za > ZH
      const bIn = zb > ZH
      if (!aIn && !bIn) continue

      let ax: number, ay: number, bx: number, by: number
      if (aIn) {
        ax = scr[a * 2]
        ay = scr[a * 2 + 1]
      } else {
        const p = clipPoint(rot, b, a, focal)
        ax = p[0]
        ay = p[1]
      }
      if (bIn) {
        bx = scr[b * 2]
        by = scr[b * 2 + 1]
      } else {
        const p = clipPoint(rot, a, b, focal)
        bx = p[0]
        by = p[1]
      }

      const MX = m[0] * ox + m[1] * oy + m[2] * oz
      const MY = m[3] * ox + m[4] * oy + m[5] * oz
      const depth = clamp((MZ - ZH) / (1 - ZH), 0, 1)
      const lambert = Math.max(0, MX * lx + MY * ly + MZ * lz)
      const limb = 1 - depth

      let fade = smooth(ZH - 0.02, ZH + 0.06, MZ)
      // Intro: the network blooms out from the point nearest the viewer.
      if (revealing) fade *= smooth(0, 1, (reveal - (1 - depth)) / 0.38)
      if (fade <= 0.001) continue

      let intensity = (0.36 + 0.64 * Math.pow(depth, 0.7)) * (0.5 + 0.5 * lambert) + 0.2 * limb * limb * limb * limb
      intensity *= fade
      const kb = Math.min(BASE_BUCKETS - 1, (intensity * BASE_BUCKETS) | 0)
      pushSegment(this.baseBuf[kb], baseLen, kb, ax, ay, bx, by)

      let h = lit[a] > lit[b] ? lit[a] : lit[b]
      for (let i = 0; i < ripples.length; i++) {
        const rp = ripples[i]
        const front = rp.age * RIPPLE_SPEED
        const ang = Math.acos(clamp(ox * rp.x + oy * rp.y + oz * rp.z, -1, 1))
        const dx = (ang - front) / RIPPLE_BAND
        if (dx > -3 && dx < 3) h += Math.exp(-dx * dx) * (1 - front / Math.PI) * 0.95
      }
      h *= (0.4 + 0.6 * depth) * fade
      if (h > 0.035) {
        const kg = Math.min(GLOW_BUCKETS - 1, (h * GLOW_BUCKETS) | 0)
        pushSegment(this.glowBuf[kg], glowLen, kg, ax, ay, bx, by)
      }
    }
  }

  private drawNodes(introEase: number) {
    const { ctx, geo, rot, scr, lit } = this
    const size = clamp(this.radius / 28, 6, 13)
    for (let i = 0; i < geo.vertexCount; i++) {
      const h = lit[i]
      if (h < 0.06) continue
      const z = rot[i * 3 + 2]
      if (z < ZH + 0.02) continue
      const depth = (z - ZH) / (1 - ZH)
      const a = Math.min(1, h) * (0.45 + 0.55 * depth) * introEase
      const d = size * (0.55 + 0.6 * h)
      ctx.globalAlpha = a
      ctx.drawImage(this.spriteWarm, scr[i * 2] - d / 2, scr[i * 2 + 1] - d / 2, d, d)
    }
    ctx.globalAlpha = 1
  }

  // ── Light travelling through the network ────────────────────────────────

  private updateTravellers(dt: number) {
    const geo = this.geo
    if (!geo) return
    while (this.travellers.length < this.travellerTarget) {
      const v = this.frontVertex()
      if (v < 0) break
      this.travellers.push(this.spawn(v, Math.random() * 1.5))
    }
    if (this.travellers.length > this.travellerTarget) this.travellers.length = this.travellerTarget

    for (let i = 0; i < this.travellers.length; i++) {
      const tr = this.travellers[i]
      tr.age += dt
      if (tr.age < 0) continue
      if (tr.age > tr.life) {
        const v = this.frontVertex()
        if (v >= 0) this.travellers[i] = this.spawn(v, 0.4 + Math.random() * 2.2)
        continue
      }
      tr.t += dt * tr.speed
      while (tr.t >= 1) {
        tr.t -= 1
        // Arriving at a node makes it fire briefly.
        this.glow[tr.to] = Math.max(this.glow[tr.to], 0.42)
        const next = this.nextVertex(tr.from, tr.to)
        tr.back2 = tr.back1
        tr.back1 = tr.from
        tr.from = tr.to
        tr.to = next
      }
    }
  }

  private spawn(v: number, delay: number): Traveller {
    const geo = this.geo
    const start = geo.neighborOffsets[v]
    const degree = geo.neighborOffsets[v + 1] - start
    const to = geo.neighborVertices[start + ((Math.random() * degree) | 0)]
    // Speed in edges/s, scaled so the angular speed is the same at any mesh density.
    const speed = (1.6 + Math.random() * 1.6) * (geo.frequency / 12)
    return { from: v, to, back1: -1, back2: -1, t: 0, speed, age: -delay, life: 2.6 + Math.random() * 3.4 }
  }

  /**
   * Prefer the neighbour that continues straight on, with some randomness, so
   * signals run along the mesh's long geodesic lines instead of jittering.
   */
  private nextVertex(from: number, at: number) {
    const { positions: P, neighborOffsets: off, neighborVertices: nb } = this.geo
    const dx = P[at * 3] - P[from * 3]
    const dy = P[at * 3 + 1] - P[from * 3 + 1]
    const dz = P[at * 3 + 2] - P[from * 3 + 2]
    let best = nb[off[at]]
    let bestScore = -Infinity
    for (let k = off[at]; k < off[at + 1]; k++) {
      const v = nb[k]
      if (v === from) continue
      const ex = P[v * 3] - P[at * 3]
      const ey = P[v * 3 + 1] - P[at * 3 + 1]
      const ez = P[v * 3 + 2] - P[at * 3 + 2]
      const score = (dx * ex + dy * ey + dz * ez) / (Math.hypot(dx, dy, dz) * Math.hypot(ex, ey, ez) || 1) + Math.random() * 0.9
      if (score > bestScore) {
        bestScore = score
        best = v
      }
    }
    return best
  }

  private drawTravellers(introEase: number) {
    const { ctx, rot, focal } = this
    if (introEase < 0.6) return
    const fadeIn = smooth(0.6, 1, introEase)
    const head = clamp(this.radius / 34, 5, 10)

    for (const tr of this.travellers) {
      if (tr.age < 0) continue
      const env = smooth(0, 0.5, tr.age) * smooth(tr.life, tr.life - 0.8, tr.age) * fadeIn
      if (env < 0.01) continue

      const fx = rot[tr.from * 3]
      const fy = rot[tr.from * 3 + 1]
      const fz = rot[tr.from * 3 + 2]
      const hx = fx + (rot[tr.to * 3] - fx) * tr.t
      const hy = fy + (rot[tr.to * 3 + 1] - fy) * tr.t
      const hz = fz + (rot[tr.to * 3 + 2] - fz) * tr.t
      if (hz < ZH + 0.03 || fz < ZH + 0.03) continue

      const hw = focal / (CAM - hz)
      const px = hx * hw
      const py = -hy * hw
      const depth = clamp((hz - ZH) / (1 - ZH), 0, 1)
      const a = env * (0.35 + 0.65 * depth)

      // Comet: head → last node → up to two nodes back, fading to nothing.
      ctx.beginPath()
      ctx.moveTo(px, py)
      let ex = this.scr[tr.from * 2]
      let ey = this.scr[tr.from * 2 + 1]
      ctx.lineTo(ex, ey)
      if (tr.back1 >= 0 && rot[tr.back1 * 3 + 2] > ZH + 0.03) {
        ex = this.scr[tr.back1 * 2]
        ey = this.scr[tr.back1 * 2 + 1]
        ctx.lineTo(ex, ey)
        if (tr.back2 >= 0 && rot[tr.back2 * 3 + 2] > ZH + 0.03) {
          ex = this.scr[tr.back2 * 2]
          ey = this.scr[tr.back2 * 2 + 1]
          ctx.lineTo(ex, ey)
        }
      }
      ctx.lineJoin = 'round'
      ctx.globalAlpha = a

      const soft = ctx.createLinearGradient(px, py, ex, ey)
      soft.addColorStop(0, rgba(this.trailSoft, 0.32))
      soft.addColorStop(1, rgba(this.trailSoft, 0))
      ctx.globalCompositeOperation = 'lighter'
      ctx.strokeStyle = soft
      ctx.lineWidth = 3.4
      ctx.stroke()

      const core = ctx.createLinearGradient(px, py, ex, ey)
      core.addColorStop(0, rgba(this.trailCore, 1))
      core.addColorStop(0.55, rgba(this.trailCore, 0.45))
      core.addColorStop(1, rgba(this.trailCore, 0))
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = core
      ctx.lineWidth = 1.15
      ctx.stroke()

      ctx.globalCompositeOperation = 'lighter'
      ctx.drawImage(this.spriteWarm, px - head, py - head, head * 2, head * 2)
      ctx.drawImage(this.spriteInk, px - head / 2, py - head / 2, head, head)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.globalAlpha = 1
  }

  private updateTwinkles(dt: number) {
    this.twinkleIn -= dt
    if (this.twinkleIn <= 0) {
      this.twinkleIn = 0.22 + Math.random() * 0.5
      const v = this.frontVertex()
      if (v >= 0) this.glow[v] = Math.max(this.glow[v], 0.55 + Math.random() * 0.4)
    }
    // Every few seconds a whole neighbourhood lights at once.
    this.clusterIn -= dt
    if (this.clusterIn <= 0) {
      this.clusterIn = 5 + Math.random() * 5
      const v = this.frontVertex(0.45)
      if (v >= 0) this.igniteCluster(v, 0.75)
    }
  }

  private igniteCluster(v: number, strength: number) {
    const { neighborOffsets: off, neighborVertices: nb } = this.geo
    this.glow[v] = Math.max(this.glow[v], strength)
    for (let k = off[v]; k < off[v + 1]; k++) {
      const u = nb[k]
      this.glow[u] = Math.max(this.glow[u], strength * 0.6)
    }
  }

  /** A random vertex currently facing the viewer, or -1. */
  private frontVertex(minZ = 0.5) {
    const n = this.geo?.vertexCount ?? 0
    for (let tries = 0; tries < 24; tries++) {
      const v = (Math.random() * n) | 0
      if (this.rot[v * 3 + 2] > minZ) return v
    }
    return -1
  }

  // ── Pointer ─────────────────────────────────────────────────────────────

  private onWindowMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const nx = (e.clientX / window.innerWidth) * 2 - 1
    const ny = (e.clientY / window.innerHeight) * 2 - 1
    // Turn the near face toward the cursor.
    this.targetTiltYaw = nx * 0.42
    this.targetTiltPitch = ny * 0.26
  }

  private onWindowLeave = () => {
    this.targetTiltYaw = 0
    this.targetTiltPitch = 0
  }

  private local(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const s = 0.9 + 0.1 * (1 - Math.pow(1 - this.intro, 3)) - this.scrollEased * 0.06
    return { x: (e.clientX - rect.left - this.cx) / s, y: (e.clientY - rect.top - this.cy) / s }
  }

  /** Ray-cast the pointer onto the sphere; writes the object-space hit to hoverObj. */
  private pick(x: number, y: number) {
    const dx = x / this.focal
    const dy = -y / this.focal
    const len = Math.hypot(dx, dy, 1)
    const ux = dx / len
    const uy = dy / len
    const uz = -1 / len
    const b = CAM * uz
    const disc = b * b - (CAM * CAM - 1)
    if (disc < 0) return false
    const t = -b - Math.sqrt(disc)
    const px = ux * t
    const py = uy * t
    const pz = CAM + uz * t
    const m = this.m // world → object is the transpose
    this.hoverObj[0] = m[0] * px + m[3] * py + m[6] * pz
    this.hoverObj[1] = m[1] * px + m[4] * py + m[7] * pz
    this.hoverObj[2] = m[2] * px + m[5] * py + m[8] * pz
    return true
  }

  private onCanvasMove = (e: PointerEvent) => {
    const { x, y } = this.local(e)
    const inside = Math.hypot(x, y) < this.radius
    this.pointerX = x
    this.pointerY = y
    if (inside) this.pick(x, y)
    if (e.pointerType === 'mouse') this.pointerInside = inside

    if (this.dragging && e.pointerId === this.dragId) {
      const now = performance.now()
      const ddx = e.clientX - this.dragLastX
      const ddy = e.clientY - this.dragLastY
      this.dragTravel += Math.hypot(ddx, ddy)
      const k = 1 / Math.max(120, this.radius)
      this.dragYaw += ddx * k
      this.dragPitch = clamp(this.dragPitch + ddy * k, -1.1, 1.1)
      const dt = Math.max(1, now - this.dragLastT) / 1000
      this.velYaw = this.velYaw * 0.5 + ((ddx * k) / dt) * 0.5
      this.velPitch = this.velPitch * 0.5 + ((ddy * k) / dt) * 0.5
      this.dragLastX = e.clientX
      this.dragLastY = e.clientY
      this.dragLastT = now
    }

    this.canvas.style.cursor = this.dragging ? 'grabbing' : inside ? 'grab' : ''
  }

  private onCanvasLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && !this.dragging) {
      this.pointerInside = false
      this.canvas.style.cursor = ''
    }
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    const { x, y } = this.local(e)
    if (Math.hypot(x, y) > this.radius) return
    this.pick(x, y)
    this.dragging = true
    this.dragId = e.pointerId
    this.dragStartX = this.dragLastX = e.clientX
    this.dragStartY = this.dragLastY = e.clientY
    this.dragLastT = performance.now()
    this.dragTravel = 0
    this.velYaw = 0
    this.velPitch = 0
    this.canvas.setPointerCapture(e.pointerId)
    this.canvas.style.cursor = 'grabbing'
  }

  private onUp = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.dragId) return
    this.dragging = false
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId)
    // Slow releases shouldn't coast.
    if (performance.now() - this.dragLastT > 90) {
      this.velYaw = 0
      this.velPitch = 0
    }
    this.velYaw = clamp(this.velYaw, -4.5, 4.5)
    this.velPitch = clamp(this.velPitch, -3, 3)

    const moved = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY)
    if (moved < 6 && this.dragTravel < 10) this.pulse()
    const { x, y } = this.local(e)
    this.canvas.style.cursor = Math.hypot(x, y) < this.radius && e.pointerType === 'mouse' ? 'grab' : ''
    if (e.pointerType !== 'mouse') this.pointerInside = false
  }

  private onCancel = (e: PointerEvent) => {
    if (e.pointerId !== this.dragId) return
    this.dragging = false
    this.pointerInside = false
    this.canvas.style.cursor = ''
  }

  /** Click / tap: a wave rolls out across the surface and fires a burst of signals. */
  private pulse() {
    const [x, y, z] = this.hoverObj
    this.ripples.push({ x, y, z, age: 0 })
    if (this.ripples.length > 3) this.ripples.shift()

    const { positions: P, vertexCount: n } = this.geo
    let best = 0
    let bestDot = -2
    for (let i = 0; i < n; i++) {
      const d = P[i * 3] * x + P[i * 3 + 1] * y + P[i * 3 + 2] * z
      if (d > bestDot) {
        bestDot = d
        best = i
      }
    }
    this.igniteCluster(best, 1)
    for (let i = 0; i < 4; i++) {
      const tr = this.spawn(best, i * 0.04)
      tr.life = 2.2 + Math.random() * 1.5
      this.travellers.push(tr)
    }
  }

  // ── Setup ───────────────────────────────────────────────────────────────

  private setGeometry(frequency: number) {
    const geo = buildGeodesic(frequency)
    this.geo = geo
    this.rot = new Float32Array(geo.vertexCount * 3)
    this.scr = new Float32Array(geo.vertexCount * 2)
    this.glow = new Float32Array(geo.vertexCount)
    this.lit = new Float32Array(geo.vertexCount)
    this.baseBuf = Array.from({ length: BASE_BUCKETS }, () => new Float32Array(geo.edgeCount * 4))
    this.glowBuf = Array.from({ length: GLOW_BUCKETS }, () => new Float32Array(geo.edgeCount * 4))
    this.travellers = []
    // Seed rotation so frontVertex() has something to pick from on the first frame.
    rotation(this.m, this.idleYaw, 0.2, 0)
    const P = geo.positions
    for (let i = 0; i < geo.vertexCount; i++) {
      this.rot[i * 3 + 2] = this.m[6] * P[i * 3] + this.m[7] * P[i * 3 + 1] + this.m[8] * P[i * 3 + 2]
    }
  }

  private buildGradients() {
    const { ctx, radius: r, palette } = this
    const { bg, ink, accent } = palette

    // A matte black body, lifted toward the key light.
    const body = ctx.createRadialGradient(-r * 0.38, -r * 0.42, r * 0.04, 0, 0, r * 1.02)
    body.addColorStop(0, rgba(scale(bg, 2.1), 1))
    body.addColorStop(0.5, rgba(scale(bg, 0.95), 1))
    body.addColorStop(1, rgba(scale(bg, 0.35), 1))
    this.bodyFill = body

    const rim = ctx.createLinearGradient(-r * 0.75, -r * 0.85, r * 0.6, r * 0.75)
    rim.addColorStop(0, rgba(ink, 0.34))
    rim.addColorStop(0.32, rgba(accent, 0.12))
    rim.addColorStop(0.62, rgba(ink, 0))
    rim.addColorStop(1, rgba(ink, 0.03))
    this.rimStroke = rim
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function strokeSegments(ctx: CanvasRenderingContext2D, buf: Float32Array, len: number, style: string, width: number) {
  ctx.beginPath()
  for (let i = 0; i < len; i += 4) {
    ctx.moveTo(buf[i], buf[i + 1])
    ctx.lineTo(buf[i + 2], buf[i + 3])
  }
  ctx.strokeStyle = style
  ctx.lineWidth = width
  ctx.stroke()
}

function pushSegment(buf: Float32Array, lens: Int32Array, k: number, ax: number, ay: number, bx: number, by: number) {
  const i = lens[k]
  buf[i] = ax
  buf[i + 1] = ay
  buf[i + 2] = bx
  buf[i + 3] = by
  lens[k] = i + 4
}

const clipOut: [number, number] = [0, 0]
/** Point where the chord from visible vertex `a` to hidden vertex `b` crosses the horizon. */
function clipPoint(rot: Float32Array, a: number, b: number, focal: number) {
  const ax = rot[a * 3]
  const ay = rot[a * 3 + 1]
  const az = rot[a * 3 + 2]
  const t = (az - ZH) / (az - rot[b * 3 + 2])
  const x = ax + (rot[b * 3] - ax) * t
  const y = ay + (rot[b * 3 + 1] - ay) * t
  const w = focal / (CAM - ZH)
  clipOut[0] = x * w
  clipOut[1] = -y * w
  return clipOut
}

/** R = Rz(roll) · Rx(pitch) · Ry(yaw), row-major. */
function rotation(out: Float32Array, yaw: number, pitch: number, roll: number) {
  const ca = Math.cos(yaw)
  const sa = Math.sin(yaw)
  const cb = Math.cos(pitch)
  const sb = Math.sin(pitch)
  const cc = Math.cos(roll)
  const sc = Math.sin(roll)
  // Rx · Ry
  const r0 = ca, r1 = 0, r2 = sa
  const r3 = sb * sa, r4 = cb, r5 = -sb * ca
  const r6 = -cb * sa, r7 = sb, r8 = cb * ca
  // Rz · (Rx · Ry)
  out[0] = cc * r0 - sc * r3
  out[1] = cc * r1 - sc * r4
  out[2] = cc * r2 - sc * r5
  out[3] = sc * r0 + cc * r3
  out[4] = sc * r1 + cc * r4
  out[5] = sc * r2 + cc * r5
  out[6] = r6
  out[7] = r7
  out[8] = r8
}

function makeSprite(color: RGB) {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g) return c
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, rgba(color, 1))
  grad.addColorStop(0.1, rgba(color, 0.95))
  grad.addColorStop(0.24, rgba(color, 0.32))
  grad.addColorStop(0.55, rgba(color, 0.07))
  grad.addColorStop(1, rgba(color, 0))
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

function normalize(x: number, y: number, z: number): [number, number, number] {
  const l = Math.hypot(x, y, z)
  return [x / l, y / l, z / l]
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function smooth(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Frame-rate independent exponential approach. */
function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

function rgba([r, g, b]: RGB, a: number) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function scale([r, g, b]: RGB, k: number): RGB {
  return [Math.min(255, r * k), Math.min(255, g * k), Math.min(255, b * k)]
}
