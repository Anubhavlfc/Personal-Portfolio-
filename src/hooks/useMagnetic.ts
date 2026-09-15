import { useEffect, useRef } from 'react'

/**
 * Pulls an element a few pixels toward the cursor while hovered. Writes a
 * transform directly — no React state — and is inert on touch devices and
 * under reduced motion. `strength` is the maximum offset in pixels.
 */
export function useMagnetic<T extends HTMLElement>(strength = 4) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`
        })
      }
    }

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      el.style.transform = ''
    }

    el.style.transition = 'transform 0.35s var(--ease-out-soft)'
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [strength])

  return ref
}
