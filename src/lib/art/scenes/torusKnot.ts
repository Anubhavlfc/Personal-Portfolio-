import { Camera, KEY_LIGHT, LineBatch, TAU, clamp, damp, makeSprite, mix, rotation } from '../core'
import { torusKnot, type KnotFrame } from '../geometry/torusKnot'
import { Orbit } from '../orbit'
import type { Input, Scene, SceneEnv } from '../scene'

/**
 * Fig. 5 — Torus knot, (2, 5): the cinquefoil.
 *
 * Temperament: fluid. It follows the pointer on an under-damped spring, so
 * it overshoots a little and settles, and it turns on more than one axis.
 * The tube is a double helix wound tightly along the knot, with a specular
 * sheen so it reads as one polished coil; hover sets a slow
 * swell travelling along it, click sends a sharper pulse. A light runs the
 * knot's centre line.
 */
const P = 2
const Q = 5
const STRANDS = 2

export default function createTorusKnot(env: SceneEnv): Scene {
  const { palette } = env
  // Whole turns of the coil, so it closes on itself; ~18 samples per turn keeps it smooth.
  let turns = env.coarse ? 60 : 104
  let knot: KnotFrame = torusKnot(P, Q, turns * (env.coarse ? 15 : 18))
  const batch = new LineBatch(palette, { weight: 1, ceiling: 0.92 })
  const cam = new Camera()
  const orbit = new Orbit(
    {
      idleYaw: 0.13,
      basePitch: 0.5,
      wobble: 0.22,
      tiltYaw: 0.5,
      tiltPitch: 0.35,
      follow: 2,
      spring: { stiffness: 16, damping: 3.2 },
      dragGain: 1.4,
      coast: 0.9,
    },
    0.2,
  )
  const m = new Float32Array(9)
  let ring = new Float32Array(STRANDS * 4) // previous sample's strand point: screen x/y, depth, light
  const spriteInk = makeSprite(palette.ink)
  const spriteWarm = makeSprite(mix(palette.ink, palette.accent, 0.55))
  const sa = new Float32Array(2)

  let width = 0
  let height = 0
  let time = env.reduced ? 3.1 : 0
  let swell = 0
  let pluck = 0
  let pluckAt = 0
  let runner = 0

  // Half-vector for a viewer looking down −z: the sheen.
  const hx0 = KEY_LIGHT[0], hy0 = KEY_LIGHT[1], hz0 = KEY_LIGHT[2] + 1
  const hl = Math.hypot(hx0, hy0, hz0)
  const HX = hx0 / hl, HY = hy0 / hl, HZ = hz0 / hl

  const scene: Scene = {
    resize(w, h) {
      width = w
      height = h
      cam.fit(Math.min(w, h) * 0.47, w / 2, h / 2, 3.6)
      batch.haloWidth = clamp(Math.min(w, h) / 120, 2.2, 3.4)
    },

    update(dt, input: Input) {
      time += dt
      orbit.update(dt, input, Math.min(width, height))
      rotation(m, orbit.yaw, orbit.pitch, 0.35 * Math.sin(time * 0.09))
      swell = damp(swell, input.over ? 1 : 0, 2.2, dt)
      pluck = damp(pluck, 0, 1.6, dt)
      if (input.click) {
        pluck = 1
        pluckAt = time
      }
      runner += dt * 0.045
      scene.cursor = input.dragging ? 'grabbing' : input.over ? 'grab' : ''
    },

    draw(ctx) {
      const { samples, center: C, normal: Nn, binormal: B } = knot
      const r0 = 0.062
      const [lx, ly, lz] = KEY_LIGHT
      const spin = time * 0.25

      for (let i = 0; i <= samples; i++) {
        const s = i % samples
        const phi = (s / samples) * TAU
        // Swell: a slow wave along the knot. Pluck: one sharp travelling bump.
        let radius = r0 * (1 + 0.45 * swell * Math.sin(phi * 12 - time * 2.4))
        if (pluck > 0.01) {
          const front = ((time - pluckAt) * 0.9) % 1
          let d = Math.abs(s / samples - front)
          d = Math.min(d, 1 - d)
          radius *= 1 + 1.4 * pluck * Math.exp(-((d / 0.03) ** 2))
        }
        const cx = C[s * 3], cy = C[s * 3 + 1], cz = C[s * 3 + 2]
        for (let k = 0; k < STRANDS; k++) {
          const a = (k / STRANDS) * TAU + (s / samples) * TAU * turns + spin
          const ca = Math.cos(a)
          const sn = Math.sin(a)
          const ox = Nn[s * 3] * ca + B[s * 3] * sn
          const oy = Nn[s * 3 + 1] * ca + B[s * 3 + 1] * sn
          const oz = Nn[s * 3 + 2] * ca + B[s * 3 + 2] * sn
          const x = cx + ox * radius
          const y = cy + oy * radius
          const z = cz + oz * radius
          const X = m[0] * x + m[1] * y + m[2] * z
          const Y = m[3] * x + m[4] * y + m[5] * z
          const Z = m[6] * x + m[7] * y + m[8] * z
          const NX = m[0] * ox + m[1] * oy + m[2] * oz
          const NY = m[3] * ox + m[4] * oy + m[5] * oz
          const NZ = m[6] * ox + m[7] * oy + m[8] * oz
          cam.project(X, Y, Z, sa, 0)
          const lambert = Math.max(0, NX * lx + NY * ly + NZ * lz)
          const spec = Math.pow(Math.max(0, NX * HX + NY * HY + NZ * HZ), 22)
          const facing = 0.4 + 0.6 * Math.max(0, NZ)
          const light = clamp((0.18 + 0.5 * lambert) * facing + 0.75 * spec, 0, 1)
          const o = k * 4
          if (i > 0) {
            const depth = cam.depth((Z + ring[o + 2]) / 2)
            const intensity = (0.2 + 0.8 * depth) * ((light + ring[o + 3]) / 2)
            batch.line(ring[o], ring[o + 1], sa[0], sa[1], intensity, 0)
          }
          ring[o] = sa[0]
          ring[o + 1] = sa[1]
          ring[o + 2] = Z
          ring[o + 3] = light
        }
      }

      // The runner: a light along the centre line with a fading tail.
      const head = (runner % 1) * samples
      const TAIL = Math.round(samples * 0.09)
      let px = 0, py = 0, pz = 0
      for (let t = 0; t <= TAIL; t++) {
        const s = Math.floor(head - TAIL + t + samples) % samples
        const x = C[s * 3], y = C[s * 3 + 1], z = C[s * 3 + 2]
        const X = m[0] * x + m[1] * y + m[2] * z
        const Y = m[3] * x + m[4] * y + m[5] * z
        const Z = m[6] * x + m[7] * y + m[8] * z
        cam.project(X, Y, Z, sa, 0)
        if (t > 0) {
          const f = t / TAIL
          batch.line(px, py, sa[0], sa[1], 0, f * f * (0.4 + 0.6 * cam.depth(Z)))
        }
        px = sa[0]
        py = sa[1]
        pz = Z
      }
      batch.flush(ctx)

      const size = clamp(Math.min(width, height) / 28, 7, 13) * (0.7 + 0.3 * cam.depth(pz))
      ctx.globalCompositeOperation = 'lighter'
      ctx.drawImage(spriteWarm, px - size, py - size, size * 2, size * 2)
      ctx.drawImage(spriteInk, px - size / 2, py - size / 2, size, size)
      ctx.globalCompositeOperation = 'source-over'
    },

    degrade() {
      turns = 60
      knot = torusKnot(P, Q, turns * 14)
      ring = new Float32Array(STRANDS * 4)
    },
  }
  return scene
}
