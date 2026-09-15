import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { skillGroups } from '@/content/skills'
import { getSkillSources, type SkillSource } from '@/lib/skillUsage'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { cn } from '@/lib/utils'

type Active = { skill: string; sources: SkillSource[] } | null

const kindLabel: Record<SkillSource['kind'], string> = {
  experience: 'Internship',
  project: 'Project',
  coursework: 'Coursework',
}

export function Capabilities() {
  const [active, setActive] = useState<Active>(null)

  const groups = useMemo(
    () =>
      skillGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ name: item, sources: getSkillSources(item) })),
      })),
    [],
  )

  return (
    <SectionShell
      id="capabilities"
      label="Technical capabilities"
      number="04"
      eyebrow="Capabilities"
      title="What I work with, and where it came from."
      intro="Anything with a marker traces back to an internship, a project, or a course — hover or tap to see which."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
        <RevealOnScroll>
          <div className="divide-y divide-border border-y border-border" onMouseLeave={() => setActive(null)}>
            {groups.map((group) => (
              <div key={group.id} className="grid gap-3 py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
                <h3 className="label pt-1.5">{group.title}</h3>
                <ul className="flex flex-wrap gap-x-1 gap-y-1">
                  {group.items.map((item) => {
                    const hasSources = item.sources.length > 0
                    const isActive = active?.skill === item.name
                    const isDimmed = active !== null && !isActive

                    if (!hasSources) {
                      return (
                        <li
                          key={item.name}
                          className={cn(
                            'px-2 py-1 text-sm text-ink-muted transition-opacity duration-300',
                            isDimmed && 'opacity-40',
                          )}
                        >
                          {item.name}
                        </li>
                      )
                    }

                    return (
                      <li key={item.name}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive({ skill: item.name, sources: item.sources })}
                          onFocus={() => setActive({ skill: item.name, sources: item.sources })}
                          onClick={() => setActive(isActive ? null : { skill: item.name, sources: item.sources })}
                          aria-pressed={isActive}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-[background-color,color,opacity] duration-300',
                            isActive ? 'bg-accent-soft text-accent' : 'text-ink hover:text-accent',
                            isDimmed && 'opacity-40',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'h-1 w-1 shrink-0 rounded-full transition-all duration-300',
                              isActive ? 'bg-accent shadow-[0_0_8px_var(--color-accent)]' : 'bg-ink-faint',
                            )}
                          />
                          {item.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* Provenance panel. Sticky on every size: beside the list on desktop,
            pinned above it on mobile so a tapped skill is never off-screen. */}
        <RevealOnScroll delay={0.1} className="max-lg:sticky max-lg:top-16 max-lg:z-10 max-lg:order-first">
          <div
            aria-live="polite"
            className="panel rounded-2xl border border-border bg-surface/95 p-5 backdrop-blur-md sm:p-6 lg:sticky lg:top-28 lg:min-h-56"
          >
            {active ? (
              <motion.div
                key={active.skill}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="label">Used in</p>
                <p className="mt-2 text-lg font-semibold text-ink">{active.skill}</p>
                <ul className="mt-4 divide-y divide-border border-t border-border">
                  {active.sources.map((source) => (
                    <li key={`${source.kind}-${source.title}`} className="py-3">
                      <p className="text-sm text-ink">{source.title}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        <span className="text-accent">{kindLabel[source.kind]}</span> · {source.context}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <div>
                <p className="label">Used in</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                  Pick a skill on the left to see the internship, project, or course it came from.
                </p>
              </div>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </SectionShell>
  )
}
