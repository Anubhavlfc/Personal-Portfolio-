import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { RevealOnScroll } from './RevealOnScroll'

type SectionShellProps = {
  id: string
  label: string
  eyebrow?: string
  title?: ReactNode
  intro?: ReactNode
  children: ReactNode
  className?: string
  containerClassName?: string
}

export function SectionShell({
  id,
  label,
  eyebrow,
  title,
  intro,
  children,
  className,
  containerClassName,
}: SectionShellProps) {
  return (
    <section id={id} aria-label={label} className={cn('scroll-mt-20 py-20 sm:py-24', className)}>
      <div className={cn('mx-auto max-w-6xl px-6 sm:px-8', containerClassName)}>
        {(eyebrow || title || intro) && (
          <RevealOnScroll className="mb-10 max-w-2xl sm:mb-12">
            {eyebrow && (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
            )}
            {title && (
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
            )}
            {intro && <p className="mt-3 text-base leading-relaxed text-ink-muted">{intro}</p>}
          </RevealOnScroll>
        )}
        {children}
      </div>
    </section>
  )
}
