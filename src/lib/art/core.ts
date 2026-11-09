/**
 * Shared toolkit for the site's mathematical figures.
 *
 * Every figure is drawn the way the hero's geodesic sphere is: Canvas 2D,
 * a small perspective camera, and wireframes whose brightness and weight
 * follow depth. Sharing these pieces is what makes seven different
 * structures read as one collection — same hairline, same light, same
 * amber for anything that is "live".
 */

export type RGB = readonly [number, number, number]
export type Palette = { ink: RGB; accent: RGB; bg: RGB; faint: RGB }

// Fallbacks mirror the @theme tokens in index.css.
const FALLBACK: Palette = { ink: [243, 240, 234], accent: [212, 166, 87], bg: [11, 10, 9], faint: [111, 107, 99] }

export function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: RGB): RGB => {
    const hex = style.getPropertyValue(name).trim().match(/^#([0-9a-f]{6})/i)?.[1]
    return hex ? [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)] : fallback
  }
  return {
    ink: read('--color-ink', FALLBACK.ink),
    accent: read('--color-accent', FALLBACK.accent),
    bg: read('--color-bg', FALLBACK.bg),
    faint: read('--color-ink-faint', FALLBACK.faint),
  }
}

export function readMonoFont() {
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim()
  return mono || 'ui-monospace, Menlo, monospace'
}

// ── Scalar helpers ──────────────────────────────────────────────────────────

export const TAU = Math.PI * 2

export function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

export function smooth(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Frame-rate independent exponential approach. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function rgba([r, g, b]: RGB, a: number) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp(a, 0, 1).toFixed(3)})`
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Deterministic PRNG so layouts are identical on every visit. */
export function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── 3D ──────────────────────────────────────────────────────────────────────

/** Row-major 3×3 rotation R = Rz(roll) · Rx(pitch) · Ry(yaw) — same convention as the sphere. */
export function rotation(out: Float32Array, yaw: number, pitch: number, roll = 0) {
  const ca = Math.cos(yaw)
  const sa = Math.sin(yaw)
  const cb = Math.cos(pitch)
  const sb = Math.sin(pitch)
  const cc = Math.cos(roll)
  const sc = Math.sin(roll)
  const r3 = sb * sa
  const r5 = -sb * ca
  out[0] = cc * ca - sc * r3
  out[1] = -sc * cb
  out[2] = cc * sa - sc * r5
  out[3] = sc * ca + cc * r3
  out[4] = cc * cb
  out[5] = sc * sa + cc * r5
  out[6] = -cb * sa
  out[7] = sb
  out[8] = cb * ca
  return out
}

/** Light used by every figure: upper left, slightly in front. View space. */
export const KEY_LIGHT: readonly [number, number, number] = (() => {
  const l = Math.hypot(-0.52, 0.6, 0.6)
  return [-0.52 / l, 0.6 / l, 0.6 / l] as const
})()

/**
 * Pinhole camera looking down −z at a unit-radius subject. `fit` chooses the
 * focal length so the subject's bounding sphere lands exactly on `radius` px.
 */
export class Camera {
  dist = 3.6
  focal = 1
  cx = 0
  cy = 0
  radius = 1

  fit(radius: number, cx: number, cy: number, dist = this.dist) {
    this.dist = dist
    this.radius = radius
    this.cx = cx
    this.cy = cy
    this.focal = radius * Math.sqrt(dist * dist - 1)
  }

  /** Writes screen x/y into out[o], out[o+1]; returns the perspective scale. */
  project(x: number, y: number, z: number, out: Float32Array, o: number) {
    const w = this.focal / (this.dist - z)
    out[o] = this.cx + x * w
    out[o + 1] = this.cy - y * w
    return w
  }

  /** 0 at the back of the bounding sphere, 1 at the front. */
  depth(z: number) {
    return clamp((z + 1) * 0.5, 0, 1)
  }
}

// ── Drawing ─────────────────────────────────────────────────────────────────

export function makeSprite(color: RGB, size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g) return c
  const h = size / 2
  const grad = g.createRadialGradient(h, h, 0, h, h, h)
  grad.addColorStop(0, rgba(color, 1))
  grad.addColorStop(0.1, rgba(color, 0.95))
  grad.addColorStop(0.24, rgba(color, 0.32))
  grad.addColorStop(0.55, rgba(color, 0.07))
  grad.addColorStop(1, rgba(color, 0))
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

/**
 * Batches thousands of line segments into a few stroke calls. Each segment
 * carries an intensity (0–1) for the white wireframe and optionally a glow
 * (0–1) that repaints it as an amber filament with a soft additive halo —
 * the same treatment the sphere uses for its pulses.
 */
export class LineBatch {
  private readonly buckets: number
  private readonly glowBuckets: number
  private base: Float32Array[]
  private baseLen: Int32Array
  private glow: Float32Array[]
  private glowLen: Int32Array
  private baseStyle: string[] = []
  private baseWidth: number[] = []
  private glowStyle: string[] = []
  private glowWidth: number[] = []
  private haloStyle: string[] = []
  haloWidth = 3

  constructor(palette: Palette, opts: { buckets?: number; glowBuckets?: number; weight?: number; ceiling?: number } = {}) {
    this.buckets = opts.buckets ?? 14
    this.glowBuckets = opts.glowBuckets ?? 8
    const weight = opts.weight ?? 1
    const ceiling = opts.ceiling ?? 0.9
    const amber = mix(palette.accent, palette.ink, 0.28)
    for (let k = 0; k < this.buckets; k++) {
      const f = (k + 0.5) / this.buckets
      this.baseStyle.push(rgba(palette.ink, 0.04 + f * (ceiling - 0.04)))
      this.baseWidth.push((0.45 + f * 0.65) * weight)
    }
    for (let k = 0; k < this.glowBuckets; k++) {
      const f = (k + 0.5) / this.glowBuckets
      this.glowStyle.push(rgba(amber, 0.2 + f * 0.8))
      this.glowWidth.push((0.75 + f * 0.7) * weight)
      this.haloStyle.push(rgba(palette.accent, f * 0.2))
    }
    this.base = Array.from({ length: this.buckets }, () => new Float32Array(1024))
    this.glow = Array.from({ length: this.glowBuckets }, () => new Float32Array(256))
    this.baseLen = new Int32Array(this.buckets)
    this.glowLen = new Int32Array(this.glowBuckets)
  }

  reset() {
    this.baseLen.fill(0)
    this.glowLen.fill(0)
  }

  line(ax: number, ay: number, bx: number, by: number, intensity: number, glow = 0) {
    if (intensity > 0.004) {
      const k = Math.min(this.buckets - 1, (intensity * this.buckets) | 0)
      this.base[k] = push(this.base[k], this.baseLen, k, ax, ay, bx, by)
    }
    if (glow > 0.035) {
      const k = Math.min(this.glowBuckets - 1, (glow * this.glowBuckets) | 0)
      this.glow[k] = push(this.glow[k], this.glowLen, k, ax, ay, bx, by)
    }
  }

  flush(ctx: CanvasRenderingContext2D) {
    ctx.lineCap = 'round'
    for (let k = 0; k < this.buckets; k++) {
      if (this.baseLen[k]) stroke(ctx, this.base[k], this.baseLen[k], this.baseStyle[k], this.baseWidth[k])
    }
    ctx.globalCompositeOperation = 'lighter'
    for (let k = 0; k < this.glowBuckets; k++) {
      if (this.glowLen[k]) stroke(ctx, this.glow[k], this.glowLen[k], this.haloStyle[k], this.haloWidth)
    }
    ctx.globalCompositeOperation = 'source-over'
    for (let k = 0; k < this.glowBuckets; k++) {
      if (this.glowLen[k]) stroke(ctx, this.glow[k], this.glowLen[k], this.glowStyle[k], this.glowWidth[k])
    }
    this.reset()
  }
}

function push(buf: Float32Array, lens: Int32Array, k: number, ax: number, ay: number, bx: number, by: number) {
  let i = lens[k]
  if (i + 4 > buf.length) {
    const grown = new Float32Array(buf.length * 2)
    grown.set(buf)
    buf = grown
  }
  buf[i++] = ax
  buf[i++] = ay
  buf[i++] = bx
  buf[i++] = by
  lens[k] = i
  return buf
}

function stroke(ctx: CanvasRenderingContext2D, buf: Float32Array, len: number, style: string, width: number) {
  ctx.beginPath()
  for (let i = 0; i < len; i += 4) {
    ctx.moveTo(buf[i], buf[i + 1])
    ctx.lineTo(buf[i + 2], buf[i + 3])
  }
  ctx.strokeStyle = style
  ctx.lineWidth = width
  ctx.stroke()
}

/**
 * Small mono caption drawn inside a figure — coordinates, parameters, names.
 * `halo` outlines the text in the background colour so it stays legible over lines.
 */
export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, font: string, align: CanvasTextAlign = 'left', halo?: string) {
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  if (halo) {
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3.5
    ctx.strokeStyle = halo
    ctx.strokeText(text, x, y)
  }
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}
