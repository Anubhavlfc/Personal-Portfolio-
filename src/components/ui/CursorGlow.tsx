import { useEffect, useRef, useState } from 'react'

/**
 * A small soft light that trails the cursor and swells over interactive
 * elements. Additive only — the native cursor is untouched — and it never
 * mounts on touch devices or under reduced motion.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const evaluate = () => setEnabled(finePointer.matches && !reduced.matches)

    evaluate()
    finePointer.addEventListener('change', evaluate)
    reduced.addEventListener('change', evaluate)
    return () => {
      finePointer.removeEventListener('change', evaluate)
      reduced.removeEventListener('change', evaluate)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    if (!dot) return

    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let frame = 0
    let started = false

    const render = () => {
      // Ease toward the pointer so the light lags very slightly behind it.
      x += (targetX - x) * 0.18
      y += (targetY - y) * 0.18
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      frame = requestAnimationFrame(render)
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!started) {
        started = true
        x = targetX
        y = targetY
        dot.style.opacity = '1'
        frame = requestAnimationFrame(render)
      }
      const interactive = (e.target as Element | null)?.closest(
        'a, button, [role="button"], input, textarea, summary',
      )
      dot.dataset.active = interactive ? 'true' : 'false'
    }

    const onLeave = () => {
      dot.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] h-6 w-6 rounded-full opacity-0 transition-[opacity,width,height] duration-300 data-[active=true]:h-10 data-[active=true]:w-10"
      style={{
        background: 'radial-gradient(circle, #d4a65740, transparent 65%)',
        willChange: 'transform',
      }}
    />
  )
}
