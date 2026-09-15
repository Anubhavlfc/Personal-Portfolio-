import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Animation hierarchy: `strong` is for content that should announce itself
 * (project cards), `subtle` for supporting copy that should simply arrive.
 */
type Intensity = 'subtle' | 'strong'

type RevealOnScrollProps = {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li'
  intensity?: Intensity
}

const variants: Record<Intensity, Variants> = {
  subtle: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
  strong: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
}

const durations: Record<Intensity, number> = { subtle: 0.5, strong: 0.75 }

export function RevealOnScroll({
  children,
  delay = 0,
  className,
  as = 'div',
  intensity = 'subtle',
}: RevealOnScrollProps) {
  const shouldReduceMotion = useReducedMotion()
  const MotionTag = as === 'li' ? motion.li : motion.div

  if (shouldReduceMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants[intensity]}
      transition={{ duration: durations[intensity], delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
