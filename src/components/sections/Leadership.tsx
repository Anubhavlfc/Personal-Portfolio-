import { leadership } from '@/content/leadership'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { GlassCard } from '@/components/ui/GlassCard'

export function Leadership() {
  return (
    <SectionShell
      id="leadership"
      label="Leadership"
      eyebrow="Leadership"
      title="Organizing people, not just systems."
      intro="Responsibility outside of coursework and internships — running budgets, offices, and organizations."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {leadership.map((entry, i) => (
          <RevealOnScroll key={entry.id} delay={i * 0.08}>
            <GlassCard className="h-full p-7">
              <h3 className="text-base font-semibold text-ink">{entry.role}</h3>
              <p className="mt-1 text-sm text-accent">{entry.org}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{entry.focus}</p>
            </GlassCard>
          </RevealOnScroll>
        ))}
      </div>
    </SectionShell>
  )
}
