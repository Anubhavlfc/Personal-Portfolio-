import { useEffect, useRef } from 'react'

/**
 * Tracks the pointer within an element and exposes it as --mx/--my CSS vars.
 * Writes custom properties only — no React state — so moving the mouse never
 * triggers a re-render. Inert on touch devices and under reduced motion.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let pending: { x: number; y: number } | null = null

    const flush = () => {
      frame = 0
      if (!pending) return
      el.style.setProperty('--mx', `${pending.x}px`)
      el.style.setProperty('--my', `${pending.y}px`)
      pending = null
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      pending = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      if (!frame) frame = requestAnimationFrame(flush)
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      el.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return ref
}
