import { useEffect, useRef, type CSSProperties } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { SphereEngine, type RGB, type SpherePalette, type SphereLayout } from '@/lib/sphereEngine'
import { cn } from '@/lib/utils'

type GeodesicSphereProps = {
  className?: string
  layout?: SphereLayout
}

const DEFAULT_LAYOUT: SphereLayout = { radius: 0.46, offsetY: 0 }

// Fallbacks mirror the @theme tokens in index.css.
const FALLBACK: SpherePalette = { ink: [243, 240, 234], accent: [212, 166, 87], bg: [11, 10, 9] }

function readPalette(): SpherePalette {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: RGB): RGB => {
    const hex = style.getPropertyValue(name).trim().match(/^#([0-9a-f]{6})/i)?.[1]
    return hex ? [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)] : fallback
  }
  return { ink: read('--color-ink', FALLBACK.ink), accent: read('--color-accent', FALLBACK.accent), bg: read('--color-bg', FALLBACK.bg) }
}

/**
 * The hero's geodesic sphere: a slowly turning black icosphere whose
 * wireframe carries pulses of light. Decorative — it is hidden from assistive
 * tech and every interaction it offers (tilt, drag, tap) is a flourish.
 *
 * Sizing, visibility and scroll live here; geometry and drawing live in
 * SphereEngine so this stays a thin React shell around an imperative loop.
 */
export function GeodesicSphere({ className, layout = DEFAULT_LAYOUT }: GeodesicSphereProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SphereEngine | null>(null)
  const reduced = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end start'] })
  // As the hero leaves, the sphere eases back and dims instead of just scrolling off.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15])

  const { radius, offsetY } = layout

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return // No canvas: the hero simply renders without its sphere.

    const engine = new SphereEngine(canvas, ctx, readPalette(), {
      reducedMotion: reduced,
      layout: { radius, offsetY },
    })
    engineRef.current = engine

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) engine.resize(rect.width, rect.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // Stop drawing entirely once the hero is off screen.
    const io = new IntersectionObserver(([entry]) => engine.setOnScreen(entry.isIntersecting), { rootMargin: '80px' })
    io.observe(wrap)

    const unsubscribe = scrollYProgress.on('change', (v) => engine.setScroll(v))
    engine.setScroll(scrollYProgress.get())

    return () => {
      unsubscribe()
      io.disconnect()
      ro.disconnect()
      engine.destroy()
      engineRef.current = null
    }
  }, [reduced, radius, offsetY, scrollYProgress])

  return (
    <motion.div
      ref={wrapRef}
      aria-hidden="true"
      className={cn('relative', className)}
      style={reduced ? undefined : { y, opacity }}
    >
      {/* Atmosphere: a warm pool behind the sphere, in the site's accent. The box
          overhangs by 25% a side so the glow fades out instead of hitting an edge. */}
      <div
        className="sphere-halo pointer-events-none absolute -inset-[25%]"
        style={{ '--sphere-r': `${(radius * 100) / 1.5}%`, '--sphere-y': `${((0.75 + offsetY) / 1.5) * 100}%` } as CSSProperties}
      />
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ touchAction: 'pan-y' }} />
    </motion.div>
  )
}
