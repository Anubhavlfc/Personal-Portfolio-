import { Camera, KEY_LIGHT, LineBatch, TAU, clamp, damp, makeSprite, mix, rotation, seeded } from '../core'
import { MOBIUS_HALF_WIDTH, mobiusMesh, mobiusPoint, type MobiusMesh } from '../geometry/mobius'
import { Orbit } from '../orbit'
import type { Input, Scene, SceneEnv } from '../scene'

/**
 * Fig. 3 — Möbius strip.
 *
 * Temperament: calm and continuous. A light runs the single edge (it takes
 * two laps to come home); motes drift along the surface and come back on
 * the "other" side. Hover warms the band under the cursor; click sends a
 * wave both ways around — the fronts meet on the far side of the twist.
 */
type Mote = { u: number; v: number; speed: number }
type Wave = { u: number; age: number }

export default function createMobius(env: SceneEnv): Scene {
  const { palette } = env
  const rand = seeded(7)
  let mesh: MobiusMesh = mobiusMesh(env.coarse ? 110 : 168, env.coarse ? 4 : 6)
  const RUNG_EVERY = 4
  const batch = new LineBatch(palette, { weight: 1 })
  const cam = new Camera()
  const orbit = new Orbit(
    { idleYaw: 0.11, basePitch: 0.62, wobble: 0.12, tiltYaw: 0.4, tiltPitch: 0.22, follow: 2, dragGain: 1.3, coast: 1.3 },
    0.4,
  )
  const m = new Float32Array(9)
  let view = new Float32Array(0)
  let scr = new Float32Array(0)
  let shade = new Float32Array(0)
  let rungGlow = new Float32Array(0)
  const tmp = new Float32Array(3)
  const tmpS = new Float32Array(2)
  const spriteInk = makeSprite(palette.ink)
  const spriteWarm = makeSprite(mix(palette.ink, palette.accent, 0.55))

  const motes: Mote[] = Array.from({ length: env.coarse ? 6 : 11 }, () => ({
    u: rand() * TAU * 2,
    v: (rand() * 2 - 1) * MOBIUS_HALF_WIDTH * 0.8,
    speed: 0.18 + rand() * 0.22,
  }))
  const waves: Wave[] = []

  let width = 0
  let height = 0
  let time = env.reduced ? 7.3 : 0
  let tracer = 0
  let hoverU = -1
  let hoverAmt = 0

  const alloc = () => {
    const n = mesh.around * (mesh.across + 1)
    view = new Float32Array(n * 3)
    scr = new Float32Array(n * 2)
    shade = new Float32Array(n)
    rungGlow = new Float32Array(mesh.around)
  }
  alloc()

  const idx = (i: number, j: number) => i * (mesh.across + 1) + j

  const scene: Scene = {
    resize(w, h) {
      width = w
      height = h
      cam.fit(Math.min(w, h) * 0.47, w / 2, h / 2, 3.8)
      batch.haloWidth = clamp(Math.min(w, h) / 120, 2.2, 3.4)
    },

    update(dt, input: Input) {
      time += dt
      orbit.update(dt, input, Math.min(width, height))
      rotation(m, orbit.yaw, orbit.pitch, 0.1 * Math.sin(time * 0.13))
      tracer += dt * 0.55
      hoverAmt = damp(hoverAmt, input.over && !input.dragging ? 1 : 0, 5, dt)
      for (const mo of motes) mo.u += mo.speed * dt
      for (const wv of waves) wv.age += dt
      while (waves.length && waves[0].age > 3.2) waves.shift()

      const P = mesh.positions
      const N = mesh.normals
      const n = mesh.around * (mesh.across + 1)
      const [lx, ly, lz] = KEY_LIGHT
      for (let k = 0; k < n; k++) {
        const x = P[k * 3], y = P[k * 3 + 1], z = P[k * 3 + 2]
        const X = m[0] * x + m[1] * y + m[2] * z
        const Y = m[3] * x + m[4] * y + m[5] * z
        const Z = m[6] * x + m[7] * y + m[8] * z
        view[k * 3] = X
        view[k * 3 + 1] = Y
        view[k * 3 + 2] = Z
        cam.project(X, Y, Z, scr, k * 2)
        const nx = N[k * 3], ny = N[k * 3 + 1], nz = N[k * 3 + 2]
        const NX = m[0] * nx + m[1] * ny + m[2] * nz
        const NY = m[3] * nx + m[4] * ny + m[5] * nz
        const NZ = m[6] * nx + m[7] * ny + m[8] * nz
        // A thin band is lit from either face; the twist shows as light rolling across it.
        shade[k] = Math.abs(NX * lx + NY * ly + NZ * lz)
      }

      // Nearest rung to the pointer, by its projected midpoint.
      hoverU = -1
      if (input.over) {
        let best = 26 * 26
        const mid = mesh.across >> 1
        for (let i = 0; i < mesh.around; i++) {
          const k = idx(i, mid) * 2
          const dx = scr[k] - input.x
          const dy = scr[k + 1] - input.y
          const d = dx * dx + dy * dy
          if (d < best) {
            best = d
            hoverU = i
          }
        }
      }
      if (input.click && hoverU >= 0) {
        waves.push({ u: (hoverU / mesh.around) * TAU, age: 0 })
        if (waves.length > 3) waves.shift()
      }

      for (let i = 0; i < mesh.around; i++) {
        const u = (i / mesh.around) * TAU
        let g = 0
        if (hoverU >= 0) {
          let du = Math.abs(i - hoverU)
          du = Math.min(du, mesh.around - du) / mesh.around
          g = Math.exp(-((du / 0.045) ** 2)) * hoverAmt * 0.8
        }
        for (const wv of waves) {
          let du = Math.abs(u - wv.u)
          du = Math.min(du, TAU - du)
          const front = wv.age * 1.4
          g += Math.exp(-(((du - front) / 0.16) ** 2)) * (1 - wv.age / 3.2) * 0.9
        }
        rungGlow[i] = Math.min(1, g)
      }
      scene.cursor = input.dragging ? 'grabbing' : input.over ? 'grab' : ''
    },

    draw(ctx) {
      const A = mesh.around
      const C = mesh.across
      // Long lines around the band. The last sample joins the first with v mirrored.
      for (let j = 0; j <= C; j++) {
        const isEdge = j === 0 || j === C
        for (let i = 0; i < A; i++) {
          const a = idx(i, j)
          const b = i + 1 < A ? idx(i + 1, j) : idx(0, C - j)
          const depth = cam.depth((view[a * 3 + 2] + view[b * 3 + 2]) / 2)
          const light = (shade[a] + shade[b]) / 2
          let intensity = (0.22 + 0.78 * depth) * (0.35 + 0.65 * light)
          if (isEdge) intensity = Math.min(1, intensity * 1.25 + 0.05)
          const g = Math.max(rungGlow[i], i + 1 < A ? rungGlow[i + 1] : rungGlow[0]) * 0.6
          batch.line(scr[a * 2], scr[a * 2 + 1], scr[b * 2], scr[b * 2 + 1], intensity, g * depth)
        }
      }
      // Rungs across the band.
      for (let i = 0; i < A; i += RUNG_EVERY) {
        for (let j = 0; j < C; j++) {
          const a = idx(i, j)
          const b = idx(i, j + 1)
          const depth = cam.depth((view[a * 3 + 2] + view[b * 3 + 2]) / 2)
          const light = (shade[a] + shade[b]) / 2
          const intensity = (0.15 + 0.6 * depth) * (0.35 + 0.65 * light)
          batch.line(scr[a * 2], scr[a * 2 + 1], scr[b * 2], scr[b * 2 + 1], intensity, rungGlow[i] * (0.4 + 0.6 * depth))
        }
      }

      // The single edge, traced: two laps of u at v = +w.
      const lapLength = TAU * 2
      const head = (tracer % 1) * lapLength
      const SEG = 46
      const span = 1.5
      let px = 0, py = 0
      for (let s = 0; s <= SEG; s++) {
        const u = head - span + (s / SEG) * span
        mobiusPoint(u, MOBIUS_HALF_WIDTH, tmp, 0)
        const X = m[0] * tmp[0] + m[1] * tmp[1] + m[2] * tmp[2]
        const Y = m[3] * tmp[0] + m[4] * tmp[1] + m[5] * tmp[2]
        const Z = m[6] * tmp[0] + m[7] * tmp[1] + m[8] * tmp[2]
        cam.project(X, Y, Z, tmpS, 0)
        if (s > 0) {
          const f = s / SEG
          batch.line(px, py, tmpS[0], tmpS[1], 0, f * f * (0.45 + 0.55 * cam.depth(Z)))
        }
        px = tmpS[0]
        py = tmpS[1]
      }
      batch.flush(ctx)

      ctx.globalCompositeOperation = 'lighter'
      const headSize = clamp(Math.min(width, height) / 30, 7, 12)
      ctx.globalAlpha = 0.9
      ctx.drawImage(spriteWarm, px - headSize, py - headSize, headSize * 2, headSize * 2)
      ctx.drawImage(spriteInk, px - headSize / 2, py - headSize / 2, headSize, headSize)

      // Motes riding the surface.
      for (const mo of motes) {
        mobiusPoint(mo.u, mo.v, tmp, 0)
        const X = m[0] * tmp[0] + m[1] * tmp[1] + m[2] * tmp[2]
        const Y = m[3] * tmp[0] + m[4] * tmp[1] + m[5] * tmp[2]
        const Z = m[6] * tmp[0] + m[7] * tmp[1] + m[8] * tmp[2]
        cam.project(X, Y, Z, tmpS, 0)
        const depth = cam.depth(Z)
        const s = 3 + 5 * depth
        ctx.globalAlpha = 0.25 + 0.6 * depth
        ctx.drawImage(spriteInk, tmpS[0] - s / 2, tmpS[1] - s / 2, s, s)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    },

    degrade() {
      mesh = mobiusMesh(96, 4)
      alloc()
    },
  }
  return scene
}
