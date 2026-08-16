import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  hover?: boolean
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface/60 backdrop-blur-sm',
        hover && 'transition-colors duration-300 hover:border-accent/40 hover:bg-surface-2/60',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
