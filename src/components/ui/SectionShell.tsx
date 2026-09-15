import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { RevealOnScroll } from './RevealOnScroll'

type Tone = 'default' | 'raised' | 'glow'

type SectionShellProps = {
  id: string
  label: string
  /** Editorial index shown beside the eyebrow, e.g. "01". */
  number?: string
  eyebrow?: string
  title?: ReactNode
  intro?: ReactNode
  children: ReactNode
  tone?: Tone
  className?: string
  containerClassName?: string
  /** Lets a section place its own header inside a custom grid. */
  headerClassName?: string
}

const tones: Record<Tone, string> = {
  default: '',
  raised: 'bg-gradient-to-b from-transparent via-white/[0.015] to-transparent',
  glow: 'before:pointer-events-none before:absolute before:inset-x-0 before:top-1/4 before:-z-10 before:h-64 before:bg-[radial-gradient(40rem_16rem_at_50%_50%,#d4a65712,transparent_70%)]',
}

export function SectionShell({
  id,
  label,
  number,
  eyebrow,
  title,
  intro,
  children,
  tone = 'default',
  className,
  containerClassName,
  headerClassName,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn('relative scroll-mt-20 py-20 sm:py-28', tones[tone], className)}
    >
      <div className={cn('mx-auto max-w-6xl px-6 sm:px-8', containerClassName)}>
        {(eyebrow || title || intro) && (
          <RevealOnScroll className={cn('mb-12 max-w-2xl sm:mb-14', headerClassName)}>
            {(eyebrow || number) && (
              <p className="label mb-4 flex items-center gap-3 text-accent">
                {number && <span className="text-ink-faint">{number}</span>}
                {number && eyebrow && <span aria-hidden="true" className="h-px w-6 bg-border" />}
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl">{title}</h2>
            )}
            {intro && <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">{intro}</p>}
          </RevealOnScroll>
        )}
        {children}
      </div>
    </section>
  )
}
