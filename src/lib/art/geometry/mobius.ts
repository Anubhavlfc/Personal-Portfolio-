/**
 * Möbius strip: P(u, v) = ((1 + v·cos(u/2))·cos u, (1 + v·cos(u/2))·sin u, v·sin(u/2)),
 * u ∈ [0, 2π), v ∈ [−w, w]. Because P(u + 2π, v) = P(u, −v), walking once
 * around flips you to the "other side" — there is only one — and the two
 * long edges are a single closed curve of twice the length.
 *
 * Returned in the figure's unit-radius frame (z up becomes y up for display).
 */
export const MOBIUS_HALF_WIDTH = 0.44

const SCALE = 1 / (1 + MOBIUS_HALF_WIDTH)

/** Point on the strip for any real u (unwrapped is fine — the flip is built in). */
export function mobiusPoint(u: number, v: number, out: Float32Array, o: number) {
  const r = 1 + v * Math.cos(u / 2)
  out[o] = r * Math.cos(u) * SCALE
  out[o + 1] = v * Math.sin(u / 2) * SCALE
  out[o + 2] = r * Math.sin(u) * SCALE
}

export type MobiusMesh = {
  /** Samples around (u) and across (v). */
  around: number
  across: number
  positions: Float32Array // around × (across + 1) × 3
  normals: Float32Array
}

export function mobiusMesh(around: number, across: number): MobiusMesh {
  const n = around * (across + 1)
  const positions = new Float32Array(n * 3)
  const normals = new Float32Array(n * 3)
  const a = new Float32Array(3)
  const b = new Float32Array(3)
  const c = new Float32Array(3)
  const d = new Float32Array(3)
  const h = 1e-3
  for (let i = 0; i < around; i++) {
    const u = (i / around) * Math.PI * 2
    for (let j = 0; j <= across; j++) {
      const v = (j / across - 0.5) * 2 * MOBIUS_HALF_WIDTH
      const k = (i * (across + 1) + j) * 3
      mobiusPoint(u, v, positions, k)
      // Surface normal from central differences: ∂P/∂u × ∂P/∂v.
      mobiusPoint(u + h, v, a, 0)
      mobiusPoint(u - h, v, b, 0)
      mobiusPoint(u, v + h, c, 0)
      mobiusPoint(u, v - h, d, 0)
      const ux = a[0] - b[0], uy = a[1] - b[1], uz = a[2] - b[2]
      const vx = c[0] - d[0], vy = c[1] - d[1], vz = c[2] - d[2]
      const nx = uy * vz - uz * vy
      const ny = uz * vx - ux * vz
      const nz = ux * vy - uy * vx
      const len = Math.hypot(nx, ny, nz) || 1
      normals[k] = nx / len
      normals[k + 1] = ny / len
      normals[k + 2] = nz / len
    }
  }
  return { around, across, positions, normals }
}
