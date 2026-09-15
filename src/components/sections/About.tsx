import { profile } from '@/content/profile'
import { education } from '@/content/education'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

const facts = [
  { label: 'Studying', value: 'B.S. Computer Science · B.A. Finance' },
  { label: 'Graduating', value: education.graduation.replace('Expected ', '') },
  { label: 'Based in', value: profile.location },
  { label: 'Focus', value: 'Software engineering, data engineering, AI applications' },
]

export function About() {
  return (
    <SectionShell id="about" label="About" eyebrow="About" tone="raised">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <RevealOnScroll>
          <p className="text-lg leading-relaxed text-ink-muted sm:text-xl sm:leading-relaxed">{profile.about}</p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <dl className="divide-y divide-border border-y border-border">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6">
                <dt className="w-32 shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
                  {fact.label}
                </dt>
                <dd className="text-sm leading-relaxed text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </div>
    </SectionShell>
  )
}
