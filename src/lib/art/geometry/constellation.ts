import { seeded } from '../core'

/**
 * A skill-provenance graph laid out in 3D. Nodes are skills and the places
 * they came from (internships, projects, courses); an edge means the site's
 * own content links the two. Layout is a deterministic force-directed pass,
 * so the picture is the same on every visit and only changes when the
 * content does.
 */
export type NodeKind = 'skill' | 'experience' | 'project' | 'coursework'

export type GraphNode = {
  key: string
  label: string
  kind: NodeKind
  detail: string
  x: number
  y: number
  z: number
}

export type SkillGraph = {
  nodes: GraphNode[]
  edges: Uint16Array // pairs
  neighbors: number[][]
}

export type SourceLike = { kind: Exclude<NodeKind, 'skill'>; title: string; context: string }

export function buildSkillGraph(skills: string[], sourcesOf: (skill: string) => SourceLike[]): SkillGraph {
  const nodes: GraphNode[] = []
  const index = new Map<string, number>()
  const edges: number[] = []

  const add = (key: string, label: string, kind: NodeKind, detail: string) => {
    const hit = index.get(key)
    if (hit !== undefined) return hit
    nodes.push({ key, label, kind, detail, x: 0, y: 0, z: 0 })
    index.set(key, nodes.length - 1)
    return nodes.length - 1
  }

  for (const skill of skills) {
    const s = add(`skill:${skill}`, skill, 'skill', '')
    for (const src of sourcesOf(skill)) {
      const h = add(`${src.kind}:${src.title}`, src.title, src.kind, src.context)
      edges.push(s, h)
    }
  }

  const neighbors: number[][] = nodes.map(() => [])
  for (let e = 0; e < edges.length; e += 2) {
    neighbors[edges[e]].push(edges[e + 1])
    neighbors[edges[e + 1]].push(edges[e])
  }

  layout(nodes, edges, neighbors)
  return { nodes, edges: Uint16Array.from(edges), neighbors }
}

function layout(nodes: GraphNode[], edges: number[], neighbors: number[][]) {
  const rand = seeded(42)
  const n = nodes.length
  // Seed sources on an outer shell and skills inside it.
  for (const node of nodes) {
    const r = node.kind === 'skill' ? 0.45 : 0.85
    const u = rand() * 2 - 1
    const t = rand() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    node.x = r * s * Math.cos(t)
    node.y = r * u
    node.z = r * s * Math.sin(t)
  }

  const fx = new Float64Array(n)
  const fy = new Float64Array(n)
  const fz = new Float64Array(n)
  for (let iter = 0; iter < 420; iter++) {
    const cool = 1 - iter / 420
    fx.fill(0)
    fy.fill(0)
    fz.fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const d2 = dx * dx + dy * dy + dz * dz + 1e-4
        const f = 0.012 / d2
        fx[i] += dx * f; fy[i] += dy * f; fz[i] += dz * f
        fx[j] -= dx * f; fy[j] -= dy * f; fz[j] -= dz * f
      }
    }
    for (let e = 0; e < edges.length; e += 2) {
      const a = nodes[edges[e]]
      const b = nodes[edges[e + 1]]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const d = Math.hypot(dx, dy, dz) || 1e-3
      const f = (d - 0.38) * 0.08
      fx[edges[e]] += (dx / d) * f; fy[edges[e]] += (dy / d) * f; fz[edges[e]] += (dz / d) * f
      fx[edges[e + 1]] -= (dx / d) * f; fy[edges[e + 1]] -= (dy / d) * f; fz[edges[e + 1]] -= (dz / d) * f
    }
    for (let i = 0; i < n; i++) {
      const node = nodes[i]
      const r = Math.hypot(node.x, node.y, node.z) || 1e-3
      // Unlinked skills drift to the outer shell, honestly apart from the rest.
      const shell = neighbors[i].length === 0 ? 0.9 : 0
      const pull = shell ? (r - shell) * 0.1 : r * 0.02
      fx[i] -= (node.x / r) * pull
      fy[i] -= (node.y / r) * pull
      fz[i] -= (node.z / r) * pull
      const step = 0.6 * cool + 0.05
      node.x += clampStep(fx[i] * step)
      node.y += clampStep(fy[i] * step)
      node.z += clampStep(fz[i] * step)
    }
  }

  let max = 0
  for (const node of nodes) max = Math.max(max, Math.hypot(node.x, node.y, node.z))
  const k = 0.92 / (max || 1)
  for (const node of nodes) {
    node.x *= k
    node.y *= k
    node.z *= k
  }
}

function clampStep(v: number) {
  return v > 0.05 ? 0.05 : v < -0.05 ? -0.05 : v
}
