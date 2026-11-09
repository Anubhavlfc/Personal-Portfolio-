import { Camera, LineBatch, clamp, damp, easeInOutCubic, label, makeSprite, mix, rgba, rotation } from '../core'
import { hypercube, identity4, rotatePlane, snap } from '../geometry/hypercube'
import { Orbit } from '../orbit'
import type { Input, Scene, SceneEnv } from '../scene'

/**
 * Fig. 2 — Tesseract.
 *
 * Temperament: architectural. It moves in deliberate quarter turns through
 * the XW, YW and ZW planes — each one maps the hypercube onto itself, so the
 * inner cube flows outward and becomes the outer one — then holds still.
 * Hover holds it so the structure can be studied; click changes how 4D is
 * flattened into 3D.
 */

const PLANES: ReadonlyArray<readonly [number, number, string]> = [
  [0, 3, 'XW'],
  [1, 3, 'YW'],
  [2, 3, 'ZW'],
  [0, 3, 'XW'],
  [2, 3, 'ZW'],
  [1, 3, 'YW'],
]
const MOVE_SECONDS = 2.8
const HOLD_SECONDS = 1.5

/** Inverse 4D viewing distance: 1/3 strong perspective, 1/5 gentle, 0 orthographic. */
const PROJECTIONS = [
  { inv: 1 / 3, name: 'perspective · d = 3' },
  { inv: 1 / 5, name: 'perspective · d = 5' },
  { inv: 0, name: 'orthographic' },
]

export default function createTesseract(env: SceneEnv): Scene {
  const { palette, mono } = env
  const cube = hypercube()
  const batch = new LineBatch(palette, { weight: 1.15 })
  const cam = new Camera()
  const orbit = new Orbit(
    { idleYaw: 0.06, basePitch: 0.42, wobble: 0.05, tiltYaw: 0.35, tiltPitch: 0.2, follow: 3, dragGain: 1.2, coast: 2.4 },
    0.6,
  )
  const m3 = new Float32Array(9)
  const base = identity4()
  const live = identity4()
  const p3 = new Float64Array(16 * 3) // after 4D → 3D
  const wDepth = new Float64Array(16)
  const view = new Float32Array(16 * 3)
  const scr = new Float32Array(16 * 2)
  const spriteWarm = makeSprite(mix(palette.ink, palette.accent, 0.55))
  const dotColor = rgba(palette.ink, 0.85)
  const textColor = rgba(palette.faint, 0.9)
  const font = `10px ${mono}`

  let width = 0
  let height = 0
  let move = 0
  let phase: 'move' | 'hold' = 'hold'
  let clock = env.reduced ? 0 : HOLD_SECONDS * 0.5
  let motion = 0 // 0 at rest, 1 mid-turn — drives the glow
  let projIndex = 0
  let inv = PROJECTIONS[0].inv
  let hovered = -1
  let hoverAmt = 0

  // A pleasing still for reduced motion: a third of the way into a turn.
  if (env.reduced) rotatePlane(base, base, 0, 3, Math.PI / 6)

  const scene: Scene = {
    resize(w, h) {
      width = w
      height = h
      cam.fit(Math.min(w, h) * 0.44, w / 2, h / 2, 4)
      batch.haloWidth = clamp(Math.min(w, h) / 120, 2.2, 3.4)
    },

    update(dt, input: Input) {
      orbit.update(dt, input, Math.min(width, height))
      hoverAmt = damp(hoverAmt, input.over ? 1 : 0, 6, dt)

      if (input.click) {
        projIndex = (projIndex + 1) % PROJECTIONS.length
      }
      inv = damp(inv, PROJECTIONS[projIndex].inv, 3.2, dt)

      // Choreography: turn, then hold. Hover extends the hold to explore.
      clock += dt
      let theta = 0
      const [a, b] = PLANES[move % PLANES.length]
      if (phase === 'hold') {
        motion = damp(motion, 0, 4, dt)
        if (clock >= HOLD_SECONDS && !input.over && dt > 0) {
          phase = 'move'
          clock = 0
        }
      } else {
        const t = clamp(clock / MOVE_SECONDS, 0, 1)
        theta = easeInOutCubic(t) * (Math.PI / 2)
        motion = Math.sin(t * Math.PI)
        if (t >= 1) {
          rotatePlane(base, base, a, b, Math.PI / 2)
          snap(base)
          theta = 0
          move++
          phase = 'hold'
          clock = 0
        }
      }
      if (theta) rotatePlane(live, base, a, b, theta)
      else live.set(base)

      // 4D → 3D. Scale so the worst case of the current projection still fits.
      const fit = 1 / Math.max(Math.sqrt(3) / (1 - inv), Math.SQRT2 / (1 - Math.SQRT2 * inv))
      const V = cube.vertices
      for (let i = 0; i < 16; i++) {
        let r0 = 0, r1 = 0, r2 = 0, r3 = 0
        for (let c = 0; c < 4; c++) {
          const v = V[i * 4 + c]
          r0 += live[c] * v
          r1 += live[4 + c] * v
          r2 += live[8 + c] * v
          r3 += live[12 + c] * v
        }
        const f = (1 / (1 - r3 * inv)) * fit
        p3[i * 3] = r0 * f
        p3[i * 3 + 1] = r1 * f
        p3[i * 3 + 2] = r2 * f
        wDepth[i] = (r3 + 1.5) / 3 // 0 far in w … 1 near
      }

      rotation(m3, orbit.yaw, orbit.pitch, 0.08)
      let best = -1
      let bestD = 22 * 22
      for (let i = 0; i < 16; i++) {
        const x = p3[i * 3], y = p3[i * 3 + 1], z = p3[i * 3 + 2]
        const X = m3[0] * x + m3[1] * y + m3[2] * z
        const Y = m3[3] * x + m3[4] * y + m3[5] * z
        const Z = m3[6] * x + m3[7] * y + m3[8] * z
        view[i * 3] = X
        view[i * 3 + 1] = Y
        view[i * 3 + 2] = Z
        cam.project(X, Y, Z, scr, i * 2)
        if (input.over) {
          const dx = scr[i * 2] - input.x
          const dy = scr[i * 2 + 1] - input.y
          const d = dx * dx + dy * dy
          if (d < bestD) {
            bestD = d
            best = i
          }
        }
      }
      hovered = best
      scene.cursor = input.dragging ? 'grabbing' : input.over ? 'grab' : ''
    },

    draw(ctx) {
      const E = cube.edges
      const [pa, pb] = PLANES[move % PLANES.length]
      for (let e = 0; e < 32; e++) {
        const i = E[e * 2]
        const j = E[e * 2 + 1]
        const axis = cube.edgeAxis[e]
        const depth = cam.depth((view[i * 3 + 2] + view[j * 3 + 2]) / 2)
        const w4 = (wDepth[i] + wDepth[j]) / 2
        const intensity = (0.28 + 0.72 * depth) * (0.5 + 0.5 * w4)
        let glow = 0
        if (axis === 3) glow = 0.16 + 0.5 * motion // the edges that carry the fourth dimension
        if (phase === 'move' && (axis === pa || axis === pb)) glow = Math.max(glow, 0.35 * motion)
        if (hovered >= 0 && (i === hovered || j === hovered)) glow = Math.max(glow, 0.85 * hoverAmt)
        batch.line(scr[i * 2], scr[i * 2 + 1], scr[j * 2], scr[j * 2 + 1], intensity, glow * (0.5 + 0.5 * depth))
      }
      batch.flush(ctx)

      ctx.fillStyle = dotColor
      for (let i = 0; i < 16; i++) {
        const depth = cam.depth(view[i * 3 + 2])
        ctx.globalAlpha = 0.25 + 0.75 * depth * (0.55 + 0.45 * wDepth[i])
        ctx.beginPath()
        ctx.arc(scr[i * 2], scr[i * 2 + 1], 1.2 + 1.3 * depth, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (hovered >= 0 && hoverAmt > 0.05) {
        const x = scr[hovered * 2]
        const y = scr[hovered * 2 + 1]
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = hoverAmt
        ctx.drawImage(spriteWarm, x - 14, y - 14, 28, 28)
        ctx.globalCompositeOperation = 'source-over'
        const V = cube.vertices
        const coords = [0, 1, 2, 3].map((a) => (V[hovered * 4 + a] > 0 ? '+1' : '−1')).join(', ')
        const right = x < width * 0.62
        label(ctx, `(${coords})`, x + (right ? 12 : -12), y - 12, rgba(palette.ink, 0.85 * hoverAmt), font, right ? 'left' : 'right', rgba(palette.bg, 0.9))
        ctx.globalAlpha = 1
      }

      const status = phase === 'move' ? `rotating in ${PLANES[move % PLANES.length][2]}` : hoverAmt > 0.5 ? 'held' : 'at rest'
      label(ctx, `${PROJECTIONS[projIndex].name}  ·  ${status}`, 12, height - 12, textColor, font)
    },
  }
  return scene
}
