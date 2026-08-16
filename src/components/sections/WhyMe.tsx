import { pillars, pillarsIntro } from '@/content/pillars'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { GlassCard } from '@/components/ui/GlassCard'

export function WhyMe() {
  return (
    <SectionShell id="about" label="Why me" eyebrow={pillarsIntro.eyebrow}>
      <RevealOnScroll className="mb-16 max-w-2xl">
        <p className="text-balance text-2xl font-semibold leading-snug text-ink sm:text-3xl">
          {pillarsIntro.lead}
          <br />
          <span className="text-ink-muted">{pillarsIntro.body}</span>
        </p>
      </RevealOnScroll>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 hidden h-px w-[calc(100%-8rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <RevealOnScroll key={pillar.index} delay={i * 0.1}>
              <GlassCard className="relative h-full p-8">
                <div
                  aria-hidden="true"
                  className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-sm font-bold text-accent"
                >
                  {pillar.index}
                </div>
                <h3 className="text-lg font-semibold text-ink">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{pillar.description}</p>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
