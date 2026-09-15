import { education } from '@/content/education'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Badge } from '@/components/ui/Badge'

export function Education() {
  return (
    <SectionShell id="education" label="Education" eyebrow="Education" title="Education.">
      <RevealOnScroll>
        <div className="border-t border-border pt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
            <div>
              <h3 className="text-xl font-semibold text-ink">{education.school}</h3>
              <p className="mt-1.5 text-base text-ink-muted">{education.degrees.join(' · ')}</p>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-sm font-medium text-accent">{education.graduation}</span>
              {education.honors.map((h) => (
                <span key={h} className="text-sm text-ink-faint">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Selected coursework</p>
            <div className="flex flex-wrap gap-2">
              {education.coursework.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </SectionShell>
  )
}
