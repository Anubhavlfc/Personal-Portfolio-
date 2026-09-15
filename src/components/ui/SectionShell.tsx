import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { RevealOnScroll } from './RevealOnScroll'

type Tone = 'default' | 'raised' | 'glow'

type SectionShellProps = {
  id: string
  label: string
  eyebrow?: string
  title?: ReactNode
  intro?: ReactNode
  children: ReactNode
  tone?: Tone
  className?: string
  containerClassName?: string
}

/** Each tone shifts the backdrop by a fraction of a step — enough to separate
 *  sections on scroll without reading as distinct colored bands. */
const tones: Record<Tone, string> = {
  default: '',
  raised: 'bg-gradient-to-b from-transparent via-white/[0.015] to-transparent',
  glow: 'before:pointer-events-none before:absolute before:inset-x-0 before:top-1/4 before:-z-10 before:h-64 before:bg-[radial-gradient(40rem_16rem_at_50%_50%,#d4a65710,transparent_70%)]',
}

export function SectionShell({
  id,
  label,
  eyebrow,
  title,
  intro,
  children,
  tone = 'default',
  className,
  containerClassName,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn('relative scroll-mt-20 py-20 sm:py-24', tones[tone], className)}
    >
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
