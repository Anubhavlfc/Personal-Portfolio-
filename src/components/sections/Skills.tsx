import { skillGroups } from '@/content/skills'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

export function Skills() {
  return (
    <SectionShell id="skills" label="Skills" eyebrow="Skills" title="What I work with.">
      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <RevealOnScroll key={group.id} delay={i * 0.05}>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">{group.title}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-ink-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </SectionShell>
  )
}
