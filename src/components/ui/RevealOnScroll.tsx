import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealOnScrollProps = {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li'
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function RevealOnScroll({ children, delay = 0, className, as = 'div' }: RevealOnScrollProps) {
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
      variants={variants}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
