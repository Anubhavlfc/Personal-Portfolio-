import { clamp, damp, rgba, mix, seeded, smooth } from '../core'
import type { Input, Scene, SceneEnv } from '../scene'

/**
 * Fig. 6 — Particle field.
 *
 * Temperament: atmospheric. A slab of motes at different depths drifting on
 * a slow sine flow field, linking briefly with whatever is near. The
 * pointer gathers a loose ring of them and threads light to the closest; a
 * click or tap pushes a soft shock outward. On first arrival the field rises
 * into place from below — the end of the page settling.
 */

const LINK_PX = 92

export default function createParticleField(env: SceneEnv): Scene {
  const { palette } = env
  const rand = seeded(3)
  const MAX = 300
  const bx = new Float32Array(MAX) // base position, CSS px
  const by = new Float32Array(MAX)
  const z = new Float32Array(MAX) // 0 far … 1 near
  const ox = new Float32Array(MAX) // offset from pointer forces
  const oy = new Float32Array(MAX)
  const vx = new Float32Array(MAX)
  const vy = new Float32Array(MAX)
  const sx = new Float32Array(MAX) // screen position this frame
  const sy = new Float32Array(MAX)
  const seed = new Float32Array(MAX)
  for (let i = 0; i < MAX; i++) {
    z[i] = rand()
    seed[i] = rand() * 100
  }

  const linkStyles = Array.from({ length: 10 }, (_, k) => rgba(palette.ink, ((k + 0.5) / 10) * 0.42))
  const warm = mix(palette.ink, palette.accent, 0.5)
  const threadStyles = Array.from({ length: 10 }, (_, k) => rgba(warm, ((k + 0.5) / 10) * 0.55))
  const dot = rgba(palette.ink, 1)
  const buckets: number[][] = Array.from({ length: 10 }, () => [])
  const threads: number[][] = Array.from({ length: 10 }, () => [])

  let count = 0
  let width = 0
  let height = 0
  let time = env.reduced ? 12 : 0
  let rise = env.reduced ? 1 : 0
  let presence = 0
  let shock: { x: number; y: number; age: number } | null = null
  let px = 0
  let py = 0

  // Spatial hash for neighbour links.
  let cols = 0
  let rows = 0
  let cellHead = new Int32Array(0)
  const next = new Int32Array(MAX)

  const scene: Scene = {
    resize(w, h) {
      const first = width === 0
      width = w
      height = h
      const density = env.coarse ? 6000 : 3500
      count = clamp(Math.round((w * h) / density), 50, env.coarse ? 110 : MAX)
      if (first) {
        for (let i = 0; i < MAX; i++) {
          bx[i] = rand() * w
          by[i] = rand() * h
        }
      } else {
        for (let i = 0; i < MAX; i++) {
          bx[i] = ((bx[i] % w) + w) % w
          by[i] = ((by[i] % h) + h) % h
        }
      }
      cols = Math.max(1, Math.ceil(w / LINK_PX))
      rows = Math.max(1, Math.ceil(h / LINK_PX))
      cellHead = new Int32Array(cols * rows)
    },

    update(dt, input: Input) {
      time += dt
      if (rise < 1) rise = Math.min(1, rise + dt / 2.8)
      presence = damp(presence, input.over ? 1 : 0, 3, dt)
      if (input.over) {
        px = input.x
        py = input.y
      }
      if (input.click) shock = { x: input.click.x, y: input.click.y, age: 0 }
      if (shock) {
        shock.age += dt
        if (shock.age > 1.6) shock = null
      }

      const t = time
      const gather = Math.min(width, height) * 0.16
      for (let i = 0; i < count; i++) {
        const depth = 0.35 + 0.65 * z[i]
        // A slow, layered sine flow — closer motes drift a little faster.
        const fx = Math.sin(by[i] * 0.006 + t * 0.21 + seed[i]) * 0.6 + Math.sin((bx[i] + by[i]) * 0.0031 - t * 0.13)
        const fy = Math.cos(bx[i] * 0.005 - t * 0.17 + seed[i] * 0.5) * 0.5 - 0.18
        bx[i] = (bx[i] + fx * 7 * depth * dt + width) % width
        by[i] = (by[i] + fy * 6 * depth * dt + height) % height

        // Pointer: draw motes toward a loose ring around it.
        let ax = 0, ay = 0
        if (presence > 0.01) {
          const dx = px - (bx[i] + ox[i])
          const dy = py - (by[i] + oy[i])
          const d = Math.hypot(dx, dy) || 1
          if (d < gather * 2.2) {
            const pull = ((d - gather) / gather) * smooth(gather * 2.2, gather * 0.4, d) * 60 * presence * depth
            ax += (dx / d) * pull
            ay += (dy / d) * pull
          }
        }
        if (shock) {
          const dx = bx[i] + ox[i] - shock.x
          const dy = by[i] + oy[i] - shock.y
          const d = Math.hypot(dx, dy) || 1
          const front = shock.age * 420
          const k = Math.exp(-(((d - front) / 60) ** 2)) * (1 - shock.age / 1.6) * 900 * depth
          ax += (dx / d) * k
          ay += (dy / d) * k
        }
        // Spring back to the drifting base so nothing gets lost.
        ax -= ox[i] * 2.2
        ay -= oy[i] * 2.2
        vx[i] = (vx[i] + ax * dt) * Math.exp(-3 * dt)
        vy[i] = (vy[i] + ay * dt) * Math.exp(-3 * dt)
        ox[i] += vx[i] * dt
        oy[i] += vy[i] * dt

        // Arrival: the field rises into place, nearer layers a beat later.
        const lift = (1 - smooth(0, 1, rise * 1.3 - z[i] * 0.3)) * height * 0.35
        // Gentle swell, stronger in front.
        const wave = Math.sin(bx[i] * 0.012 + t * 0.6) * 6 * z[i]
        sx[i] = bx[i] + ox[i]
        sy[i] = by[i] + oy[i] + wave + lift
      }
    },

    draw(ctx) {
      const appear = smooth(0, 1, rise * 1.2)
      cellHead.fill(-1)
      for (let i = 0; i < count; i++) {
        const c = clamp((sx[i] / LINK_PX) | 0, 0, cols - 1) + clamp((sy[i] / LINK_PX) | 0, 0, rows - 1) * cols
        next[i] = cellHead[c]
        cellHead[c] = i
      }
      for (const b of buckets) b.length = 0
      for (const b of threads) b.length = 0

      for (let i = 0; i < count; i++) {
        const cx = clamp((sx[i] / LINK_PX) | 0, 0, cols - 1)
        const cy = clamp((sy[i] / LINK_PX) | 0, 0, rows - 1)
        for (let gy = cy - 1; gy <= cy + 1; gy++) {
          if (gy < 0 || gy >= rows) continue
          for (let gx = cx - 1; gx <= cx + 1; gx++) {
            if (gx < 0 || gx >= cols) continue
            for (let j = cellHead[gx + gy * cols]; j >= 0; j = next[j]) {
              if (j <= i) continue
              // Only motes at similar depth link — the layers stay legible.
              if (Math.abs(z[i] - z[j]) > 0.35) continue
              const dx = sx[j] - sx[i]
              const dy = sy[j] - sy[i]
              const reach = LINK_PX * (0.55 + 0.45 * (z[i] + z[j]) * 0.5)
              const d2 = dx * dx + dy * dy
              if (d2 > reach * reach) continue
              const f = 1 - Math.sqrt(d2) / reach
              const k = Math.min(9, (f * f * (0.4 + 0.6 * (z[i] + z[j]) * 0.5) * 10) | 0)
              buckets[k].push(sx[i], sy[i], sx[j], sy[j])
            }
          }
        }
        if (presence > 0.05) {
          const dx = px - sx[i]
          const dy = py - sy[i]
          const reach = LINK_PX * 1.5
          const d2 = dx * dx + dy * dy
          if (d2 < reach * reach) {
            const f = 1 - Math.sqrt(d2) / reach
            const k = Math.min(9, (f * f * presence * z[i] * 10) | 0)
            threads[k].push(px, py, sx[i], sy[i])
          }
        }
      }

      ctx.globalAlpha = appear
      ctx.lineWidth = 0.7
      buckets.forEach((b, k) => {
        if (!b.length) return
        ctx.beginPath()
        for (let i = 0; i < b.length; i += 4) {
          ctx.moveTo(b[i], b[i + 1])
          ctx.lineTo(b[i + 2], b[i + 3])
        }
        ctx.strokeStyle = linkStyles[k]
        ctx.stroke()
      })
      ctx.lineWidth = 0.8
      threads.forEach((b, k) => {
        if (!b.length) return
        ctx.beginPath()
        for (let i = 0; i < b.length; i += 4) {
          ctx.moveTo(b[i], b[i + 1])
          ctx.lineTo(b[i + 2], b[i + 3])
        }
        ctx.strokeStyle = threadStyles[k]
        ctx.stroke()
      })

      ctx.fillStyle = dot
      for (let i = 0; i < count; i++) {
        const r = 0.55 + z[i] * 1.2
        ctx.globalAlpha = appear * (0.22 + 0.68 * z[i])
        ctx.fillRect(sx[i] - r, sy[i] - r, r * 2, r * 2)
      }
      ctx.globalAlpha = 1
    },

    degrade() {
      count = Math.round(count * 0.6)
    },
  }
  return scene
}
