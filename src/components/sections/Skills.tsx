import { useState } from 'react'
import { skillGroups } from '@/content/skills'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

export function Skills() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  return (
    <SectionShell
      id="skills"
      label="Skills"
      eyebrow="Capabilities"
      title="Organized as systems, not a logo wall."
      intro="Six areas that work together — hover a group to see it stand apart from the rest."
    >
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        onMouseLeave={() => setActiveGroup(null)}
      >
        {skillGroups.map((group, i) => {
          const isDimmed = activeGroup !== null && activeGroup !== group.id
          return (
            <RevealOnScroll key={group.id} delay={i * 0.06}>
              <GlassCard
                onMouseEnter={() => setActiveGroup(group.id)}
                className={cn(
                  'h-full p-7 transition-opacity duration-300',
                  isDimmed ? 'opacity-40' : 'opacity-100',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-accent">{group.index}</span>
                  <h3 className="text-base font-semibold text-ink">{group.title}</h3>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-bg/40 px-3 py-1 text-xs font-medium text-ink-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </RevealOnScroll>
          )
        })}
      </div>
    </SectionShell>
  )
}
