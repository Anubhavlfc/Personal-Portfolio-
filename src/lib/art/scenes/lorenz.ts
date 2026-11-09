import { Camera, LineBatch, clamp, damp, label, makeSprite, mix, rgba, rotation } from '../core'
import { FIXED_POINTS, lorenzStep, toFigure } from '../geometry/lorenz'
import type { Input, Scene, SceneEnv } from '../scene'

/**
 * Fig. 4 — Lorenz attractor.
 *
 * Temperament: precise, then chaotic. Two trajectories start 10⁻⁵ apart and
 * draw the same path — until they don't. Rotation is slow and level about
 * the attractor's own axis; the pointer only nudges the view. Click releases
 * another trajectory 10⁻⁵ from the lead, so the divergence can be watched
 * again from anywhere on the attractor.
 */

const H = 0.005 // RK4 step, in Lorenz time
const STEPS_PER_SECOND = 420
const MAX_TRAILS = 4

type Trail = {
  state: Float64Array
  pts: Float32Array // ring buffer of figure-space points
  head: number
  count: number
  lead: boolean
}

export default function createLorenz(env: SceneEnv): Scene {
  const { palette, mono } = env
  let capacity = env.coarse ? 1100 : 2400
  const batch = new LineBatch(palette, { weight: 0.95, ceiling: 0.86 })
  const cam = new Camera()
  const m = new Float32Array(9)
  const p = new Float32Array(3)
  const sa = new Float32Array(2)
  const sb = new Float32Array(2)
  const spriteInk = makeSprite(palette.ink)
  const spriteWarm = makeSprite(mix(palette.ink, palette.accent, 0.55))
  const faint = rgba(palette.faint, 0.95)
  const readout = rgba(palette.ink, 0.7)
  const font = `10px ${mono}`

  const makeTrail = (x: number, y: number, z: number, lead: boolean): Trail => ({
    state: Float64Array.from([x, y, z]),
    pts: new Float32Array(capacity * 3),
    head: 0,
    count: 0,
    lead,
  })

  // Integrate past the start-up transient first, so the figure opens on the
  // attractor itself rather than a long spiral out of the origin.
  const warm = Float64Array.from([1, 1, 1])
  for (let i = 0; i < 6000; i++) lorenzStep(warm, H)
  const trails: Trail[] = [makeTrail(warm[0], warm[1], warm[2], true), makeTrail(warm[0] + 1e-5, warm[1], warm[2], false)]
  let lorenzTime = 0
  let carry = 0

  const advance = (tr: Trail) => {
    lorenzStep(tr.state, H)
    toFigure(tr.state[0], tr.state[1], tr.state[2], tr.pts, tr.head * 3)
    tr.head = (tr.head + 1) % capacity
    tr.count = Math.min(capacity, tr.count + 1)
  }

  // Reduced motion: a settled, fully drawn attractor instead of a growing one.
  if (env.reduced) {
    for (let i = 0; i < 2600; i++) {
      for (const tr of trails) advance(tr)
      lorenzTime += H
    }
  }

  let width = 0
  let height = 0
  let time = 0
  let yaw = 0.5
  let tiltY = 0
  let tiltP = 0
  let dragYaw = 0
  let fling = 0
  let hoverAmt = 0

  const project = (X: number, Y: number, Z: number, out: Float32Array) => {
    const RX = m[0] * X + m[1] * Y + m[2] * Z
    const RY = m[3] * X + m[4] * Y + m[5] * Z
    const RZ = m[6] * X + m[7] * Y + m[8] * Z
    cam.project(RX, RY, RZ, out, 0)
    return RZ
  }

  const scene: Scene = {
    resize(w, h) {
      width = w
      height = h
      cam.fit(Math.min(w, h) * 0.47, w / 2, h / 2 + h * 0.02, 4)
      batch.haloWidth = clamp(Math.min(w, h) / 130, 2, 3)
    },

    update(dt, input: Input) {
      time += dt
      hoverAmt = damp(hoverAmt, input.over ? 1 : 0, 5, dt)

      // Level rotation about the vertical axis; the pointer nudges, never takes over.
      yaw += dt * 0.12
      tiltY = damp(tiltY, input.nx * 0.3, 1.6, dt)
      tiltP = damp(tiltP, input.ny * 0.14, 1.6, dt)
      if (input.dragging && dt > 0) {
        const d = (input.dx * 1.2) / Math.max(80, Math.min(width, height))
        dragYaw += d
        fling = fling * 0.4 + (d / dt) * 0.6
      } else {
        dragYaw += clamp(fling, -3, 3) * dt
        fling = damp(fling, 0, 1.8, dt)
      }
      rotation(m, yaw + tiltY + dragYaw, 0.16 + tiltP, 0)

      if (input.click) {
        const lead = trails[0].state
        trails.push(makeTrail(lead[0] + 1e-5, lead[1], lead[2], false))
        // Keep the lead and its first twin; retire the oldest released one.
        if (trails.length > MAX_TRAILS) trails.splice(2, 1)
      }

      carry += dt * STEPS_PER_SECOND
      let steps = Math.floor(carry)
      carry -= steps
      steps = Math.min(steps, 30)
      for (let i = 0; i < steps; i++) {
        for (const tr of trails) advance(tr)
        lorenzTime += H
      }
      scene.cursor = input.dragging ? 'grabbing' : input.over ? 'grab' : ''
    },

    draw(ctx) {
      for (let t = 0; t < trails.length; t++) {
        const tr = trails[t]
        const n = tr.count
        if (n < 2) continue
        const start = (tr.head - n + capacity) % capacity
        const weight = tr.lead ? 1 : 0.7
        let prevZ = 0
        for (let s = 0; s < n; s++) {
          const k = ((start + s) % capacity) * 3
          const Z = project(tr.pts[k], tr.pts[k + 1], tr.pts[k + 2], sb)
          if (s > 0) {
            const age = s / n // 0 oldest … 1 newest
            const depth = cam.depth((Z + prevZ) / 2)
            const intensity = (0.08 + 0.92 * age * age) * (0.35 + 0.65 * depth) * weight
            const glow = age > 0.965 ? ((age - 0.965) / 0.035) * (tr.lead ? 0.9 : 0.7) : 0
            batch.line(sa[0], sa[1], sb[0], sb[1], intensity, glow)
          }
          sa[0] = sb[0]
          sa[1] = sb[1]
          prevZ = Z
        }
      }
      batch.flush(ctx)

      // Heads.
      ctx.globalCompositeOperation = 'lighter'
      for (const tr of trails) {
        if (tr.count < 1) continue
        const k = ((tr.head - 1 + capacity) % capacity) * 3
        const Z = project(tr.pts[k], tr.pts[k + 1], tr.pts[k + 2], sa)
        const s = (tr.lead ? 14 : 10) * (0.7 + 0.3 * cam.depth(Z))
        ctx.globalAlpha = 0.95
        ctx.drawImage(spriteWarm, sa[0] - s, sa[1] - s, s * 2, s * 2)
        if (tr.lead) ctx.drawImage(spriteInk, sa[0] - s / 2, sa[1] - s / 2, s, s)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // The equilibria the lobes wind around.
      ctx.strokeStyle = faint
      ctx.lineWidth = 1
      FIXED_POINTS.forEach(([x, y, z], i) => {
        toFigure(x, y, z, p, 0)
        project(p[0], p[1], p[2], sa)
        ctx.beginPath()
        ctx.moveTo(sa[0] - 3.5, sa[1])
        ctx.lineTo(sa[0] + 3.5, sa[1])
        ctx.moveTo(sa[0], sa[1] - 3.5)
        ctx.lineTo(sa[0], sa[1] + 3.5)
        ctx.stroke()
        if (hoverAmt > 0.05) {
          ctx.globalAlpha = hoverAmt
          label(ctx, i === 0 ? 'C₊' : 'C₋', sa[0] + 7, sa[1] - 7, faint, font)
          ctx.globalAlpha = 1
        }
      })

      const [x, y, z] = trails[0].state
      const sep = trails.length > 1 ? Math.hypot(x - trails[1].state[0], y - trails[1].state[1], z - trails[1].state[2]) : 0
      const fmt = (v: number) => (v < 0 ? '−' : ' ') + Math.abs(v).toFixed(2).padStart(5, ' ')
      label(ctx, `t ${lorenzTime.toFixed(1).padStart(5, ' ')}   x${fmt(x)}  y${fmt(y)}  z${fmt(z)}`, 12, height - 26, readout, font)
      label(ctx, `separation ${sep < 0.01 ? sep.toExponential(1) : sep.toFixed(2)}`, 12, height - 12, faint, font)
    },

    degrade() {
      capacity = Math.round(capacity * 0.55)
      for (let i = 0; i < trails.length; i++) {
        const s = trails[i].state
        trails[i] = makeTrail(s[0], s[1], s[2], trails[i].lead)
      }
    },
  }
  return scene
}
