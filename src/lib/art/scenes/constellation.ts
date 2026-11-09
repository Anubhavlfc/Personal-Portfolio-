import { skillGroups } from '@/content/skills'
import { getSkillSources } from '@/lib/skillUsage'
import { Camera, LineBatch, clamp, damp, label, makeSprite, mix, rgba, rotation, seeded } from '../core'
import { buildSkillGraph, type GraphNode } from '../geometry/constellation'
import type { Input, Scene, SceneEnv } from '../scene'

/**
 * Fig. 5 — Constellation.
 *
 * Temperament: attentive. This is the site's own data — every skill linked
 * to the internship, project or course the content says it came from. It
 * answers the list beside it: pick a skill there and the graph turns to
 * bring it forward; hover a point here and the list's panel follows.
 * Now and then a query runs from a skill out to its sources.
 */

export type ConstellationProps = {
  active: string | null
  onHover?: (skill: string | null) => void
  onSelect?: (skill: string) => void
  onOpen?: (node: Pick<GraphNode, 'kind' | 'label'>) => void
}

type Pulse = { from: number; to: number; age: number }

const skills = skillGroups.flatMap((g) => g.items)

export default function createConstellation(env: SceneEnv): Scene<ConstellationProps> {
  const { palette, mono } = env
  const graph = buildSkillGraph(skills, getSkillSources)
  const N = graph.nodes.length
  const rand = seeded(11)
  let dustCount = env.coarse ? 46 : 104
  const dust = new Float32Array(140 * 3)
  const vel = new Float32Array(140 * 3)
  for (let i = 0; i < 140; i++) {
    const u = rand() * 2 - 1
    const t = rand() * Math.PI * 2
    const r = Math.cbrt(rand()) * 0.98
    const s = Math.sqrt(1 - u * u)
    dust[i * 3] = r * s * Math.cos(t)
    dust[i * 3 + 1] = r * u
    dust[i * 3 + 2] = r * s * Math.sin(t)
    vel[i * 3] = (rand() - 0.5) * 0.04
    vel[i * 3 + 1] = (rand() - 0.5) * 0.04
    vel[i * 3 + 2] = (rand() - 0.5) * 0.04
  }

  const batch = new LineBatch(palette, { weight: 0.95, ceiling: 0.8 })
  const cam = new Camera()
  const m = new Float32Array(9)
  const total = N + 140
  const view = new Float32Array(total * 3)
  const scr = new Float32Array(total * 2)
  const lit = new Float32Array(N)
  const spriteWarm = makeSprite(mix(palette.ink, palette.accent, 0.55))
  const ink = (a: number) => rgba(palette.ink, a)
  const font = `10px ${mono}`
  const fontSmall = `9px ${mono}`
  const halo = rgba(palette.bg, 0.92)

  let props: ConstellationProps = { active: null }
  let width = 0
  let height = 0
  let time = 0
  let yaw = 0.3
  let pitch = 0.18
  let tiltY = 0
  let tiltP = 0
  let dragYaw = 0
  let fling = 0
  let hovered = -1
  let lastReported: string | null = null
  let focus = -1
  const pulses: Pulse[] = []
  let pulseIn = 1.2

  const skillIndex = new Map(graph.nodes.map((n, i) => [n.kind === 'skill' ? n.label : `#${n.key}`, i]))
  const linkedSkills = graph.nodes.map((n, i) => (n.kind === 'skill' && graph.neighbors[i].length ? i : -1)).filter((i) => i >= 0)

  const scene: Scene<ConstellationProps> = {
    setProps(next) {
      props = next
      focus = next.active ? (skillIndex.get(next.active) ?? -1) : -1
    },

    resize(w, h) {
      width = w
      height = h
      cam.fit(Math.min(w, h) * 0.46, w / 2, h / 2, 3.6)
      batch.haloWidth = clamp(Math.min(w, h) / 130, 2, 3)
    },

    update(dt, input: Input) {
      time += dt
      // Drift; when a skill is in focus, turn to bring it toward the viewer.
      if (focus >= 0) {
        const nd = graph.nodes[focus]
        const target = Math.atan2(-nd.x, nd.z)
        let delta = target - (yaw + dragYaw)
        delta = Math.atan2(Math.sin(delta), Math.cos(delta))
        yaw += delta * (1 - Math.exp(-2.2 * dt))
      } else {
        yaw += dt * 0.07
      }
      tiltY = damp(tiltY, input.nx * 0.28, 2, dt)
      tiltP = damp(tiltP, input.ny * 0.18, 2, dt)
      if (input.dragging && dt > 0) {
        const d = (input.dx * 1.2) / Math.max(80, Math.min(width, height))
        dragYaw += d
        fling = fling * 0.4 + (d / dt) * 0.6
      } else {
        dragYaw += clamp(fling, -3, 3) * dt
        fling = damp(fling, 0, 2, dt)
      }
      pitch = 0.18 + 0.06 * Math.sin(time * 0.17)
      rotation(m, yaw + tiltY + dragYaw, pitch + tiltP, 0)

      for (let i = 0; i < dustCount; i++) {
        for (let a = 0; a < 3; a++) dust[i * 3 + a] += vel[i * 3 + a] * dt
        const r = Math.hypot(dust[i * 3], dust[i * 3 + 1], dust[i * 3 + 2])
        if (r > 1) for (let a = 0; a < 3; a++) vel[i * 3 + a] -= (dust[i * 3 + a] / r) * 0.02
      }

      const put = (k: number, x: number, y: number, z: number) => {
        const X = m[0] * x + m[1] * y + m[2] * z
        const Y = m[3] * x + m[4] * y + m[5] * z
        const Z = m[6] * x + m[7] * y + m[8] * z
        view[k * 3] = X
        view[k * 3 + 1] = Y
        view[k * 3 + 2] = Z
        cam.project(X, Y, Z, scr, k * 2)
      }
      graph.nodes.forEach((nd, i) => put(i, nd.x, nd.y, nd.z))
      for (let i = 0; i < dustCount; i++) put(N + i, dust[i * 3], dust[i * 3 + 1], dust[i * 3 + 2])

      hovered = -1
      if (input.over) {
        let best = 18 * 18
        for (let i = 0; i < N; i++) {
          const dx = scr[i * 2] - input.x
          const dy = scr[i * 2 + 1] - input.y
          const d = dx * dx + dy * dy
          if (d < best) {
            best = d
            hovered = i
          }
        }
      }
      const report = hovered >= 0 && graph.nodes[hovered].kind === 'skill' && graph.neighbors[hovered].length ? graph.nodes[hovered].label : null
      if (report !== lastReported) {
        lastReported = report
        props.onHover?.(report)
      }

      if (input.click && hovered >= 0) {
        const nd = graph.nodes[hovered]
        if (nd.kind === 'skill') {
          if (graph.neighbors[hovered].length) props.onSelect?.(nd.label)
        } else props.onOpen?.(nd)
      }

      // Highlight: focus or hover, plus everything one hop away.
      const centre = hovered >= 0 ? hovered : focus
      for (let i = 0; i < N; i++) lit[i] = damp(lit[i], 0, 4, dt)
      if (centre >= 0) {
        lit[centre] = 1
        for (const j of graph.neighbors[centre]) lit[j] = Math.max(lit[j], 0.75)
      }

      // Provenance queries: a skill sends a signal to each of its sources.
      pulseIn -= dt
      if (pulseIn <= 0 && linkedSkills.length && dt > 0) {
        pulseIn = 2 + rand() * 1.8
        const s = linkedSkills[(rand() * linkedSkills.length) | 0]
        for (const h of graph.neighbors[s]) pulses.push({ from: s, to: h, age: 0 })
      }
      for (const pl of pulses) pl.age += dt
      while (pulses.length && pulses[0].age > 1.6) pulses.shift()

      scene.cursor = hovered >= 0 ? 'pointer' : input.dragging ? 'grabbing' : input.over ? 'grab' : ''
    },

    draw(ctx) {
      // Ambient: nearby points link while they're close on screen.
      const reach = Math.min(width, height) * 0.1
      const reach2 = reach * reach
      const count = N + dustCount
      for (let i = 0; i < count; i++) {
        const ax = scr[i * 2], ay = scr[i * 2 + 1]
        for (let j = i + 1; j < count; j++) {
          if (i < N && j < N) continue // graph edges are drawn below
          const dx = scr[j * 2] - ax
          const dy = scr[j * 2 + 1] - ay
          const d2 = dx * dx + dy * dy
          if (d2 > reach2) continue
          const f = 1 - Math.sqrt(d2) / reach
          const depth = cam.depth((view[i * 3 + 2] + view[j * 3 + 2]) / 2)
          batch.line(ax, ay, scr[j * 2], scr[j * 2 + 1], f * f * 0.32 * (0.3 + 0.7 * depth))
        }
      }

      const E = graph.edges
      for (let e = 0; e < E.length; e += 2) {
        const a = E[e], b = E[e + 1]
        const depth = cam.depth((view[a * 3 + 2] + view[b * 3 + 2]) / 2)
        const glow = Math.min(lit[a], lit[b])
        batch.line(scr[a * 2], scr[a * 2 + 1], scr[b * 2], scr[b * 2 + 1], (0.25 + 0.5 * depth) * (1 - glow * 0.5), glow * (0.5 + 0.5 * depth))
      }

      for (const pl of pulses) {
        const t = clamp(pl.age / 1.1, 0, 1)
        const t0 = Math.max(0, t - 0.35)
        const ax = scr[pl.from * 2], ay = scr[pl.from * 2 + 1]
        const bx = scr[pl.to * 2], by = scr[pl.to * 2 + 1]
        const fade = 1 - clamp((pl.age - 1.1) / 0.5, 0, 1)
        batch.line(ax + (bx - ax) * t0, ay + (by - ay) * t0, ax + (bx - ax) * t, ay + (by - ay) * t, 0, 0.75 * fade)
      }
      batch.flush(ctx)

      // Dust.
      ctx.fillStyle = ink(1)
      for (let i = 0; i < dustCount; i++) {
        const k = N + i
        const depth = cam.depth(view[k * 3 + 2])
        ctx.globalAlpha = 0.12 + 0.4 * depth
        ctx.fillRect(scr[k * 2] - 0.6, scr[k * 2 + 1] - 0.6, 1.2, 1.2)
      }

      // Nodes: sources as rings, skills as points, unlinked skills faint.
      for (let i = 0; i < N; i++) {
        const nd = graph.nodes[i]
        const depth = cam.depth(view[i * 3 + 2])
        const x = scr[i * 2], y = scr[i * 2 + 1]
        const base = 0.3 + 0.7 * depth
        ctx.globalAlpha = Math.min(1, base + lit[i] * 0.5)
        if (nd.kind === 'skill') {
          const orphan = graph.neighbors[i].length === 0
          ctx.fillStyle = ink(orphan ? 0.4 : 1)
          ctx.beginPath()
          ctx.arc(x, y, (orphan ? 1 : 1.5) + depth * 1.2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.strokeStyle = ink(nd.kind === 'project' ? 0.95 : 0.7)
          ctx.lineWidth = nd.kind === 'project' ? 1.3 : 1
          ctx.beginPath()
          ctx.arc(x, y, (nd.kind === 'coursework' ? 2.6 : 3.6) + depth * 1.8, 0, Math.PI * 2)
          ctx.stroke()
        }
        if (lit[i] > 0.05) {
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = lit[i] * (0.5 + 0.5 * depth)
          const s = 16 + lit[i] * 8
          ctx.drawImage(spriteWarm, x - s / 2, y - s / 2, s, s)
          ctx.globalCompositeOperation = 'source-over'
        }
      }
      ctx.globalAlpha = 1

      // Names for the node in focus and its neighbours, laid out so none overlap.
      const centre = hovered >= 0 ? hovered : focus
      if (centre >= 0) {
        const items = [centre, ...graph.neighbors[centre].slice(0, 6)].map((i, n) => {
          const nd = graph.nodes[i]
          const text = n === 0 && nd.kind !== 'skill' ? `${nd.label} · ${nd.kind === 'coursework' ? 'course' : nd.kind}` : nd.label
          ctx.font = n === 0 ? font : fontSmall
          const w = ctx.measureText(text).width
          const x = scr[i * 2]
          // Point the label away from the nearer edge, and keep it inside the frame.
          const right = x + 9 + w < width - 4 && (x < width * 0.6 || x - 9 - w < 4)
          const left = right ? x + 9 : x - 9 - w
          return { i, n, text, w, left: clamp(left, 4, width - 4 - w), y: scr[i * 2 + 1] - 8 }
        })
        const placed = [...items].sort((a, b) => a.y - b.y)
        for (let a = 0; a < placed.length; a++) {
          for (let b = 0; b < a; b++) {
            const A = placed[a], B = placed[b]
            const overlapX = A.left < B.left + B.w + 6 && B.left < A.left + A.w + 6
            if (overlapX && A.y - B.y < 12) A.y = B.y + 12
          }
        }
        for (const it of placed) {
          const color = it.n === 0 ? ink(0.95) : rgba(palette.ink, 0.62 * lit[it.i])
          label(ctx, it.text, it.left, clamp(it.y, 8, height - 8), color, it.n === 0 ? font : fontSmall, 'left', halo)
        }
      }
    },

    degrade() {
      dustCount = Math.round(dustCount * 0.5)
    },
  }
  return scene
}
