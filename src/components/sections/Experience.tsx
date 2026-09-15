import { experience } from '@/content/experience'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Badge } from '@/components/ui/Badge'

export function Experience() {
  return (
    <SectionShell id="experience" label="Experience" eyebrow="Experience" title="Where I've worked.">
      <ol className="flex flex-col">
        {experience.map((entry, i) => (
          <RevealOnScroll key={entry.id} as="li" delay={i * 0.08}>
            <div className="border-t border-border py-8 sm:py-10">
              <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-12">
                <p className="text-sm font-medium text-ink-faint lg:pt-1">{entry.period}</p>

                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-ink">{entry.role}</h3>
                  <p className="mt-1 text-base text-accent">{entry.org}</p>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">{entry.summary}</p>

                  <ul className="mt-5 space-y-2.5">
                    {entry.highlights.map((h) => (
                      <li key={h} className="flex max-w-2xl items-start gap-3 text-sm leading-relaxed text-ink-muted">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {entry.stack.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </ol>
    </SectionShell>
  )
}
