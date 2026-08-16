import { education } from '@/content/education'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'

export function Education() {
  return (
    <SectionShell id="education" label="Education" eyebrow="Education" title="Academic profile">
      <RevealOnScroll>
        <GlassCard hover={false} className="p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-2xl font-semibold text-ink">{education.school}</h3>
              <p className="mt-2 text-base text-ink-muted">{education.degrees.join(' | ')}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="text-sm font-semibold text-accent">{education.graduation}</span>
              {education.honors.map((h) => (
                <span key={h} className="text-xs text-ink-faint">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
              Selected coursework
            </p>
            <div className="flex flex-wrap gap-2">
              {education.coursework.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </div>
        </GlassCard>
      </RevealOnScroll>
    </SectionShell>
  )
}
