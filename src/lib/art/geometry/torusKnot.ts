/**
 * Centre line of a (p, q) torus knot with a rotation-minimising frame.
 *
 *   C(φ) = ((R + r·cos qφ)·cos pφ, r·sin qφ, (R + r·cos qφ)·sin pφ)
 *
 * The curve winds p times around the symmetry axis and q times through the
 * hole. Frames are parallel-transported along it, then the small twist left
 * over at the seam (the curve's holonomy) is spread evenly along its length
 * so a tube built on these frames closes without a visible join.
 */
export type KnotFrame = {
  samples: number
  center: Float32Array // samples × 3
  normal: Float32Array
  binormal: Float32Array
}

export function torusKnot(p: number, q: number, samples: number, R = 1, r = 0.42): KnotFrame {
  const center = new Float32Array(samples * 3)
  const tangent = new Float32Array(samples * 3)
  const scale = 1 / (R + r + 0.14)
  const at = (phi: number, out: Float32Array, o: number) => {
    const rr = R + r * Math.cos(q * phi)
    out[o] = rr * Math.cos(p * phi) * scale
    out[o + 1] = r * Math.sin(q * phi) * scale
    out[o + 2] = rr * Math.sin(p * phi) * scale
  }
  for (let i = 0; i < samples; i++) at((i / samples) * Math.PI * 2, center, i * 3)
  for (let i = 0; i < samples; i++) {
    const a = ((i + 1) % samples) * 3
    const b = ((i - 1 + samples) % samples) * 3
    const tx = center[a] - center[b]
    const ty = center[a + 1] - center[b + 1]
    const tz = center[a + 2] - center[b + 2]
    const l = Math.hypot(tx, ty, tz) || 1
    tangent[i * 3] = tx / l
    tangent[i * 3 + 1] = ty / l
    tangent[i * 3 + 2] = tz / l
  }

  const normal = new Float32Array(samples * 3)
  const binormal = new Float32Array(samples * 3)
  // Any vector not parallel to the first tangent starts the frame.
  let nx = 0, ny = 1, nz = 0
  const project = (i: number) => {
    const tx = tangent[i * 3], ty = tangent[i * 3 + 1], tz = tangent[i * 3 + 2]
    const d = nx * tx + ny * ty + nz * tz
    nx -= d * tx
    ny -= d * ty
    nz -= d * tz
    const l = Math.hypot(nx, ny, nz) || 1
    nx /= l
    ny /= l
    nz /= l
  }
  for (let i = 0; i < samples; i++) {
    project(i)
    normal[i * 3] = nx
    normal[i * 3 + 1] = ny
    normal[i * 3 + 2] = nz
  }

  // Holonomy: the angle between the transported end frame and the start.
  project(0)
  const t0x = tangent[0], t0y = tangent[1], t0z = tangent[2]
  const s0x = normal[0], s0y = normal[1], s0z = normal[2]
  const cx = ny * s0z - nz * s0y
  const cy = nz * s0x - nx * s0z
  const cz = nx * s0y - ny * s0x
  const twist = Math.atan2(cx * t0x + cy * t0y + cz * t0z, nx * s0x + ny * s0y + nz * s0z)

  for (let i = 0; i < samples; i++) {
    const tx = tangent[i * 3], ty = tangent[i * 3 + 1], tz = tangent[i * 3 + 2]
    let ax = normal[i * 3], ay = normal[i * 3 + 1], az = normal[i * 3 + 2]
    const bx = ty * az - tz * ay
    const by = tz * ax - tx * az
    const bz = tx * ay - ty * ax
    const ang = (twist * i) / samples
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    ax = ax * c + bx * s
    ay = ay * c + by * s
    az = az * c + bz * s
    normal[i * 3] = ax
    normal[i * 3 + 1] = ay
    normal[i * 3 + 2] = az
    binormal[i * 3] = ty * az - tz * ay
    binormal[i * 3 + 1] = tz * ax - tx * az
    binormal[i * 3 + 2] = tx * ay - ty * ax
  }
  return { samples, center, normal, binormal }
}
