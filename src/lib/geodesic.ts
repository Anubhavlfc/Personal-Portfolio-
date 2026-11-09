/**
 * Geodesic sphere geometry, generated at runtime.
 *
 * A class-I geodesic polyhedron: each of the icosahedron's 20 faces is cut
 * into a triangular grid of `frequency` divisions per side, and every grid
 * point is pushed out onto the unit sphere. Unlike a lat/long sphere there is
 * no pole pinching — every triangle stays close to equilateral, which is what
 * gives the mesh its even, woven look.
 *
 * For frequency n:  20n² faces · 10n² + 2 vertices · 30n² edges.
 *   n = 6  →  1080 edges      n = 10 → 3000 edges
 *   n = 8  →  1920 edges      n = 12 → 4320 edges
 */

export type Geodesic = {
  frequency: number
  vertexCount: number
  edgeCount: number
  /** Unit-length vertex positions, xyz triples. */
  positions: Float32Array
  /** Vertex index pairs, two per edge. */
  edges: Uint32Array
  /** Unit-length edge midpoints, xyz triples — used for facing and lighting. */
  midpoints: Float32Array
  /** CSR adjacency. Vertex i's neighbours live in [offsets[i], offsets[i + 1]). */
  neighborOffsets: Uint32Array
  neighborVertices: Uint32Array
}

const PHI = (1 + Math.sqrt(5)) / 2

// The twelve corners of a regular icosahedron: three orthogonal golden rectangles.
const BASE_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
]

const BASE_FACES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
]

/**
 * A fixed off-axis tilt baked into the geometry. Without it the five-fold
 * vertices sit on the screen axes and the mesh reads as a globe with poles;
 * tilted, no single frame ever looks like a map.
 */
const TILT_X = 0.5532
const TILT_Z = 0.3271

function tilt(x: number, y: number, z: number): [number, number, number] {
  const cx = Math.cos(TILT_X)
  const sx = Math.sin(TILT_X)
  const cz = Math.cos(TILT_Z)
  const sz = Math.sin(TILT_Z)
  const y1 = y * cx - z * sx
  const z1 = y * sx + z * cx
  return [x * cz - y1 * sz, x * sz + y1 * cz, z1]
}

const cache = new Map<number, Geodesic>()

export function buildGeodesic(frequency: number): Geodesic {
  const n = Math.max(1, Math.round(frequency))
  let sphere = cache.get(n)
  if (!sphere) {
    sphere = generate(n)
    cache.set(n, sphere)
  }
  return sphere
}

function generate(n: number): Geodesic {
  const base = BASE_POSITIONS.map(([x, y, z]) => {
    const len = Math.hypot(x, y, z)
    return tilt(x / len, y / len, z / len)
  })

  const xs: number[] = []
  const ys: number[] = []
  const zs: number[] = []
  // Grid points on shared face edges are generated twice; weld them by position.
  const weld = new Map<string, number>()

  const vertexAt = (x: number, y: number, z: number) => {
    const len = Math.hypot(x, y, z) || 1
    const ux = x / len
    const uy = y / len
    const uz = z / len
    const key = `${Math.round(ux * 1e5)},${Math.round(uy * 1e5)},${Math.round(uz * 1e5)}`
    const hit = weld.get(key)
    if (hit !== undefined) return hit
    xs.push(ux)
    ys.push(uy)
    zs.push(uz)
    weld.set(key, xs.length - 1)
    return xs.length - 1
  }

  const seen = new Set<number>()
  const edgeList: number[] = []
  const addEdge = (a: number, b: number) => {
    const lo = a < b ? a : b
    const hi = a < b ? b : a
    const key = lo * 100_000 + hi
    if (seen.has(key)) return
    seen.add(key)
    edgeList.push(lo, hi)
  }

  for (const [ia, ib, ic] of BASE_FACES) {
    const A = base[ia]
    const B = base[ib]
    const C = base[ic]

    // grid[i][j] for i + j <= n, barycentric (n - i - j, i, j) / n.
    const grid: number[][] = []
    for (let i = 0; i <= n; i++) {
      const row: number[] = []
      for (let j = 0; j <= n - i; j++) {
        const wa = (n - i - j) / n
        const wb = i / n
        const wc = j / n
        row.push(
          vertexAt(
            A[0] * wa + B[0] * wb + C[0] * wc,
            A[1] * wa + B[1] * wb + C[1] * wc,
            A[2] * wa + B[2] * wb + C[2] * wc,
          ),
        )
      }
      grid.push(row)
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        const p = grid[i][j]
        const q = grid[i + 1][j]
        const r = grid[i][j + 1]
        addEdge(p, q)
        addEdge(p, r)
        addEdge(q, r)
      }
    }
  }

  const vertexCount = xs.length
  const positions = new Float32Array(vertexCount * 3)
  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3] = xs[i]
    positions[i * 3 + 1] = ys[i]
    positions[i * 3 + 2] = zs[i]
  }

  const edges = Uint32Array.from(edgeList)
  const edgeCount = edges.length / 2

  const midpoints = new Float32Array(edgeCount * 3)
  for (let e = 0; e < edgeCount; e++) {
    const a = edges[e * 2]
    const b = edges[e * 2 + 1]
    const mx = xs[a] + xs[b]
    const my = ys[a] + ys[b]
    const mz = zs[a] + zs[b]
    const len = Math.hypot(mx, my, mz) || 1
    midpoints[e * 3] = mx / len
    midpoints[e * 3 + 1] = my / len
    midpoints[e * 3 + 2] = mz / len
  }

  // CSR adjacency via counting sort, so light can walk the mesh.
  const neighborOffsets = new Uint32Array(vertexCount + 1)
  for (let e = 0; e < edgeCount * 2; e++) neighborOffsets[edges[e] + 1]++
  for (let i = 0; i < vertexCount; i++) neighborOffsets[i + 1] += neighborOffsets[i]

  const cursor = neighborOffsets.slice(0, vertexCount)
  const neighborVertices = new Uint32Array(edgeCount * 2)
  for (let e = 0; e < edgeCount; e++) {
    const a = edges[e * 2]
    const b = edges[e * 2 + 1]
    neighborVertices[cursor[a]++] = b
    neighborVertices[cursor[b]++] = a
  }

  return { frequency: n, vertexCount, edgeCount, positions, edges, midpoints, neighborOffsets, neighborVertices }
}
