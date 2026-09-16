import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { experience, type ExperienceEntry } from '@/content/experience'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { cn } from '@/lib/utils'

function Entry({ entry, index, isLast }: { entry: ExperienceEntry; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(index === 0)
  const panelId = `${useId()}-panel`

  return (
    <RevealOnScroll as="li" delay={index * 0.08} className="relative">
      <div className="grid gap-4 lg:grid-cols-[180px_2rem_1fr] lg:gap-8">
        <p className="label pt-1.5 lg:text-right">{entry.period}</p>

        {/* Rail */}
        <div aria-hidden="true" className="relative hidden lg:block">
          <span
            className={cn(
              'absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-bg transition-colors duration-300',
              open ? 'bg-accent shadow-[0_0_12px_var(--color-accent)]' : 'bg-ink-faint',
            )}
          />
          {!isLast && <span className="absolute left-1/2 top-6 bottom-[-2.5rem] w-px -translate-x-1/2 bg-border" />}
        </div>

        <div className={cn('pb-10', !isLast && 'lg:pb-12')}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="group/x flex w-full items-start justify-between gap-6 text-left"
          >
            <span>
              <span className="block text-xl font-semibold tracking-tight text-ink transition-colors group-hover/x:text-accent sm:text-2xl">
                {entry.role}
              </span>
              <span className="mt-1 block text-base text-ink-muted">{entry.org}</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-ink-muted transition-[transform,border-color,color] duration-300 ease-[var(--ease-out-soft)] group-hover/x:border-accent/50 group-hover/x:text-accent',
                open && 'rotate-45',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </button>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">{entry.summary}</p>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <ul className="mt-5 max-w-2xl space-y-2.5 border-l border-border pl-5">
                  {entry.highlights.map((h) => (
                    <li key={h} className="text-sm leading-relaxed text-ink">
                      {h}
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {entry.stack.map((s) => (
                    <li key={s} className="font-mono text-sm text-ink-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RevealOnScroll>
  )
}

export function Experience() {
  return (
    <SectionShell
      id="experience"
      label="Experience"
      number="02"
      eyebrow="Experience"
      title="Where the work has been."
      intro="Two internships so far — one on the data side, one on the software side."
    >
      <ol className="border-t border-border pt-10">
        {experience.map((entry, i) => (
          <Entry key={entry.id} entry={entry} index={i} isLast={i === experience.length - 1} />
        ))}
      </ol>
    </SectionShell>
  )
}
