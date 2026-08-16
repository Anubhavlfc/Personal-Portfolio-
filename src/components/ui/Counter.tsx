import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

type CounterProps = {
  value: number
  suffix?: string
  className?: string
  duration?: number
}

export function Counter({ value, suffix = '', className, duration = 1.2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(shouldReduceMotion ? value : 0)

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return
    const start = performance.now()
    let frame: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isInView, shouldReduceMotion, value, duration])

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  )
}
