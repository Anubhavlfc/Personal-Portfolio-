import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { readMonoFont, readPalette } from '@/lib/art/core'
import type { Input, Scene, SceneFactory } from '@/lib/art/scene'
import { cn } from '@/lib/utils'

type ArtCanvasProps<P> = {
  /** Dynamic import of the scene module, so each figure's code loads only as it nears the viewport. */
  load: () => Promise<{ default: SceneFactory<P> }>
  props?: P
  className?: string
  /**
   * `canvas` (default): the figure takes hover, drag and click itself.
   * `section`: track the pointer across the enclosing <section> without ever
   * intercepting it — for full-bleed backgrounds that sit under content.
   * `none`: ambient only.
   */
  interaction?: 'canvas' | 'section' | 'none'
}

/**
 * Lifecycle shell for every mathematical figure on the site: sizing,
 * device-pixel ratio, lazy loading, pausing off screen, reduced motion and
 * pointer input. The scene itself only simulates and draws.
 */
export function ArtCanvas<P>({ load, props, className, interaction = 'canvas' }: ArtCanvasProps<P>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Scene<P> | null>(null)
  const propsRef = useRef<P | undefined>(props)
  const redrawRef = useRef<(() => void) | null>(null)
  const reduced = useReducedMotion() ?? false

  useEffect(() => {
    propsRef.current = props
    sceneRef.current?.setProps?.(props as P)
    redrawRef.current?.()
  }, [props])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // No canvas support: the caption still stands on its own.

    let disposed = false
    let scene: Scene<P> | null = null
    let raf = 0
    let last = 0
    let nearScreen = false
    let onScreen = false
    let width = 0
    let height = 0
    let dpr = 1
    let workEma = 0
    let frames = 0
    let degraded = false

    const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 640
    const input: Input = { x: 0, y: 0, over: false, nx: 0, ny: 0, dragging: false, dx: 0, dy: 0, click: null }

    const render = () => {
      if (!scene || width === 0) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      scene.draw(ctx)
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!scene) return
      // Clamped so a resumed tab never makes a figure lurch.
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      const t0 = performance.now()
      scene.update(dt, input)
      input.dx = 0
      input.dy = 0
      input.click = null
      render()
      if (scene.cursor !== undefined && canvas.style.cursor !== scene.cursor) canvas.style.cursor = scene.cursor

      // Shed detail once if the draw itself (not throttled frame timing) stays slow.
      const ms = performance.now() - t0
      frames++
      workEma = frames < 10 ? ms : workEma * 0.94 + ms * 0.06
      if (!degraded && frames > 120 && workEma > 7) {
        degraded = true
        scene.degrade?.()
      }
    }

    const sync = () => {
      const run = !disposed && scene !== null && !reduced && onScreen && width > 0
      if (run && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else if (!run && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const staticFrame = () => {
      if (!scene) return
      scene.update(0, input)
      render()
    }
    redrawRef.current = () => {
      if (reduced) staticFrame()
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      scene?.resize(width, height)
      if (reduced) staticFrame()
      else if (!raf) render()
      sync()
    }

    const start = async () => {
      let mod: { default: SceneFactory<P> }
      try {
        mod = await load()
      } catch {
        return // A failed chunk leaves an empty figure, never a broken page.
      }
      if (disposed) return
      scene = mod.default({ palette: readPalette(), mono: readMonoFont(), reduced, coarse })
      if (propsRef.current !== undefined) scene.setProps?.(propsRef.current)
      sceneRef.current = scene
      resize()
    }

    // Load a screen ahead; animate only while actually visible.
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !nearScreen) {
          nearScreen = true
          void start()
        }
      },
      { rootMargin: '600px 0px' },
    )
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { rootMargin: '40px 0px' },
    )
    nearObserver.observe(canvas)
    visObserver.observe(canvas)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Pointer ──
    const cleanups: Array<() => void> = []
    const on = <K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      target.addEventListener(type, fn as EventListener, opts)
      cleanups.push(() => target.removeEventListener(type, fn as EventListener, opts))
    }

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      input.x = e.clientX - rect.left
      input.y = e.clientY - rect.top
    }

    if (!reduced && interaction !== 'none') {
      on(window, 'pointermove', (e) => {
        if (e.pointerType !== 'mouse') return
        input.nx = (e.clientX / window.innerWidth) * 2 - 1
        input.ny = (e.clientY / window.innerHeight) * 2 - 1
      }, { passive: true })
    }

    if (!reduced && interaction === 'canvas') {
      let startX = 0
      let startY = 0
      let lastX = 0
      let lastY = 0
      let travel = 0
      let pointerId = -1

      on(canvas, 'pointermove', (e) => {
        local(e)
        if (e.pointerType === 'mouse') input.over = true
        if (input.dragging && e.pointerId === pointerId) {
          input.dx += e.clientX - lastX
          input.dy += e.clientY - lastY
          travel += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY)
          lastX = e.clientX
          lastY = e.clientY
        }
      })
      on(canvas, 'pointerleave', (e) => {
        if (e.pointerType === 'mouse' && !input.dragging) input.over = false
      })
      on(canvas, 'pointerdown', (e) => {
        if (e.button !== 0) return
        local(e)
        input.dragging = true
        pointerId = e.pointerId
        startX = lastX = e.clientX
        startY = lastY = e.clientY
        travel = 0
        canvas.setPointerCapture(e.pointerId)
      })
      on(canvas, 'pointerup', (e) => {
        if (e.pointerId !== pointerId) return
        input.dragging = false
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
        local(e)
        if (Math.hypot(e.clientX - startX, e.clientY - startY) < 6 && travel < 12) input.click = { x: input.x, y: input.y }
        if (e.pointerType !== 'mouse') input.over = false
      })
      on(canvas, 'pointercancel', () => {
        input.dragging = false
        input.over = false
      })
    }

    if (!reduced && interaction === 'section') {
      const section = canvas.closest('section') ?? canvas.parentElement
      if (section) {
        on(section, 'pointermove', (e) => {
          local(e)
          input.over = true
        }, { passive: true })
        on(section, 'pointerleave', () => {
          input.over = false
        })
        on(section, 'pointerdown', (e) => {
          local(e)
          input.click = { x: input.x, y: input.y }
        }, { passive: true })
      }
    }

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      nearObserver.disconnect()
      visObserver.disconnect()
      ro.disconnect()
      for (const off of cleanups) off()
      scene?.dispose?.()
      sceneRef.current = null
      redrawRef.current = null
    }
  }, [load, reduced, interaction])

  return (
    <canvas
      ref={canvasRef}
      className={cn('block h-full w-full', className)}
      style={{ touchAction: interaction === 'canvas' ? 'pan-y' : undefined }}
    />
  )
}
