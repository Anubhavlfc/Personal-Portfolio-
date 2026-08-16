import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { experience } from '@/content/experience'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function Experience() {
  const [activeId, setActiveId] = useState(experience[0].id)
  const active = experience.find((e) => e.id === activeId) ?? experience[0]

  return (
    <SectionShell
      id="experience"
      label="Experience"
      eyebrow="Experience"
      title="Real workflows, not classroom exercises."
      intro="Two internships, two very different kinds of ownership — production data pipelines on one side, live software infrastructure on the other."
    >
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
        <RevealOnScroll>
          <div role="tablist" aria-label="Experience entries" className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {experience.map((entry, i) => {
              const isActive = entry.id === activeId
              return (
                <button
                  key={entry.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(entry.id)}
                  className={cn(
                    'relative shrink-0 rounded-xl border px-5 py-4 text-left transition-colors duration-200 lg:shrink lg:w-full',
                    isActive
                      ? 'border-accent/50 bg-accent-soft'
                      : 'border-border bg-surface hover:border-accent/30',
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{`0${i + 1} — ${entry.period}`}</p>
                  <p className={cn('mt-1.5 text-sm font-semibold', isActive ? 'text-accent' : 'text-ink')}>
                    {entry.role}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{entry.org}</p>
                </button>
              )
            })}
          </div>
        </RevealOnScroll>

        <div className="min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border bg-surface p-8 sm:p-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{active.period}</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink">{active.role}</h3>
              <p className="mt-1 text-base text-ink-muted">{active.org}</p>
              <p className="mt-6 text-base leading-relaxed text-ink-muted">{active.summary}</p>

              <ul className="mt-8 space-y-3">
                {active.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-2">
                {active.stack.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionShell>
  )
}
