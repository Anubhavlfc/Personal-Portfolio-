/**
 * The tesseract: the 16 points of {±1}⁴ and the 32 edges joining points that
 * differ in exactly one coordinate. `edgeAxis` records which coordinate that
 * is (0–3 = x, y, z, w), so w-edges — the ones joining the "inner" and
 * "outer" cube of the usual picture — can be treated differently.
 */
export type Hypercube = {
  vertices: Float64Array // 16 × 4
  edges: Uint8Array // 32 × 2
  edgeAxis: Uint8Array // 32
}

export function hypercube(): Hypercube {
  const vertices = new Float64Array(16 * 4)
  for (let i = 0; i < 16; i++) {
    for (let a = 0; a < 4; a++) vertices[i * 4 + a] = (i >> a) & 1 ? 1 : -1
  }
  const edges: number[] = []
  const axis: number[] = []
  for (let i = 0; i < 16; i++) {
    for (let a = 0; a < 4; a++) {
      const j = i ^ (1 << a)
      if (j > i) {
        edges.push(i, j)
        axis.push(a)
      }
    }
  }
  return { vertices, edges: Uint8Array.from(edges), edgeAxis: Uint8Array.from(axis) }
}

/** 4×4 identity, row-major. */
export function identity4() {
  const m = new Float64Array(16)
  m[0] = m[5] = m[10] = m[15] = 1
  return m
}

/** out = R(plane a–b, θ) · m. Rotation acts in the plane of axes a and b only. */
export function rotatePlane(out: Float64Array, m: Float64Array, a: number, b: number, theta: number) {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  if (out !== m) out.set(m)
  for (let col = 0; col < 4; col++) {
    const ra = m[a * 4 + col]
    const rb = m[b * 4 + col]
    out[a * 4 + col] = c * ra - s * rb
    out[b * 4 + col] = s * ra + c * rb
  }
  return out
}

/** Quarter turns of the identity are signed permutations — snap away float drift. */
export function snap(m: Float64Array) {
  for (let i = 0; i < 16; i++) m[i] = Math.round(m[i])
}
