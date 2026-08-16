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
    <section id={id} aria-label={label} className={cn('scroll-mt-24 py-24 sm:py-32', className)}>
      <div className={cn('mx-auto max-w-6xl px-6 sm:px-8', containerClassName)}>
        {(eyebrow || title || intro) && (
          <RevealOnScroll className="mb-14 max-w-2xl sm:mb-16">
            {eyebrow && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
            )}
            {intro && <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">{intro}</p>}
          </RevealOnScroll>
        )}
        {children}
      </div>
    </section>
  )
}
