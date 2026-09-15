import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { skillGroups } from '@/content/skills'
import { getSkillSources, type SkillSource } from '@/lib/skillUsage'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { cn } from '@/lib/utils'

type Active = { skill: string; sources: SkillSource[] } | null

export function Skills() {
  const [active, setActive] = useState<Active>(null)

  // Resolved once — the mapping is derived from static content.
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
      id="skills"
      label="Skills"
      eyebrow="Skills"
      title="What I work with."
      intro="Anything marked with a dot links to where I actually used it — hover or tap to see."
    >
      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => (
          <RevealOnScroll key={group.id} delay={i * 0.04}>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">{group.title}</h3>
              <ul className="mt-4 space-y-1">
                {group.items.map((item) => {
                  const hasSources = item.sources.length > 0
                  const isActive = active?.skill === item.name
                  const isDimmed = active !== null && !isActive

                  if (!hasSources) {
                    return (
                      <li
                        key={item.name}
                        className={cn(
                          'py-1 text-sm leading-relaxed text-ink-muted transition-opacity duration-300',
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
                        onClick={() =>
                          setActive(isActive ? null : { skill: item.name, sources: item.sources })
                        }
                        aria-pressed={isActive}
                        className={cn(
                          'group/skill -mx-2 flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm leading-relaxed transition-all duration-300',
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
          </RevealOnScroll>
        ))}
      </div>

      {/* Fixed-height strip so revealing a skill never shifts the layout. */}
      <div
        className="mt-10 min-h-20 border-t border-border pt-6"
        aria-live="polite"
        onMouseLeave={() => setActive(null)}
      >
        {/* Keyed so each skill re-triggers the fade, but with no exit animation
            to wait on — sweeping across skills stays instant. */}
        {active ? (
          <motion.div
            key={active.skill}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
              {active.skill} — used in
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {active.sources.map((source) => (
                <li
                  key={source.title}
                  className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-sm"
                >
                  <span className="text-ink">{source.title}</span>
                  <span className="text-ink-faint"> · {source.context}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <p className="text-sm text-ink-faint">
            Select a skill to trace it back to the work it came from.
          </p>
        )}
      </div>
    </SectionShell>
  )
}
