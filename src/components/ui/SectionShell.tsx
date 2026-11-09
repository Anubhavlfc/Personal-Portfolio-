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
  /**
   * The section's plate in the site's collection of figures. Beside the
   * header on desktop; tucked behind its top-right corner on small screens.
   */
  figure?: ReactNode
}

const tones: Record<Tone, string> = {
  default: '',
  raised: 'bg-gradient-to-b from-transparent via-white/[0.015] to-transparent',
  glow: 'before:pointer-events-none before:absolute before:inset-x-0 before:top-1/4 before:-z-10 before:h-64 before:bg-[radial-gradient(40rem_16rem_at_50%_50%,#d4a65712,transparent_70%)]',
}

function SectionHeader({ number, eyebrow, title, intro }: Pick<SectionShellProps, 'number' | 'eyebrow' | 'title' | 'intro'>) {
  return (
    <>
      {(eyebrow || number) && (
        <p className="label mb-4 flex items-center gap-3 text-accent">
          {number && <span className="text-ink-faint">{number}</span>}
          {number && eyebrow && <span aria-hidden="true" className="h-px w-6 bg-border" />}
          {eyebrow}
        </p>
      )}
      {title && <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl">{title}</h2>}
      {intro && <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">{intro}</p>}
    </>
  )
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
  figure,
}: SectionShellProps) {
  const hasHeader = Boolean(eyebrow || title || intro)
  return (
    <section
      id={id}
      aria-label={label}
      className={cn('relative scroll-mt-20 py-20 sm:py-28', figure && 'overflow-x-clip', tones[tone], className)}
    >
      <div className={cn('mx-auto max-w-6xl px-6 sm:px-8', containerClassName)}>
        {figure ? (
          <div className="relative mb-12 sm:mb-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:items-center lg:gap-16">
            {hasHeader && (
              <RevealOnScroll className={cn('relative z-10 max-w-2xl', headerClassName)}>
                <SectionHeader number={number} eyebrow={eyebrow} title={title} intro={intro} />
              </RevealOnScroll>
            )}
            <div className="pointer-events-none absolute -right-20 -top-16 z-0 h-56 w-56 opacity-60 [mask-image:linear-gradient(to_bottom,#000_40%,transparent_88%)] sm:-right-10 sm:h-64 sm:w-64 lg:pointer-events-auto lg:relative lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:opacity-100 lg:[mask-image:none]">
              {figure}
            </div>
          </div>
        ) : hasHeader && (
          <RevealOnScroll className={cn('mb-12 max-w-2xl sm:mb-14', headerClassName)}>
            <SectionHeader number={number} eyebrow={eyebrow} title={title} intro={intro} />
          </RevealOnScroll>
        )}
        {children}
      </div>
    </section>
  )
}
