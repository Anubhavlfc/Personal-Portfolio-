import { financeSpotlight } from '@/content/leadership'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { GlassCard } from '@/components/ui/GlassCard'
import { Counter } from '@/components/ui/Counter'

function FinanceFlow() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
      {financeSpotlight.flow.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className="rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm font-semibold text-accent whitespace-nowrap">
            {step}
          </div>
          {i < financeSpotlight.flow.length - 1 && (
            <svg width="16" height="16" viewBox="0 0 20 20" className="shrink-0 text-ink-faint" aria-hidden="true">
              <path d="M2 10h14M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

export function BeyondTheCode() {
  return (
    <SectionShell
      id="beyond-the-code"
      label="Beyond the code"
      eyebrow="Beyond the Code"
      title="Technical work, backed by financial fluency."
      intro="Most software portfolios stop at code. Mine also includes the budget process behind real student-funded events."
    >
      <RevealOnScroll>
        <GlassCard hover={false} className="overflow-hidden p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{financeSpotlight.org}</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{financeSpotlight.role}</h3>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
                {financeSpotlight.description}
              </p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {financeSpotlight.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start justify-center rounded-2xl border border-border bg-bg/40 px-8 py-6 lg:items-center">
              <span className="text-4xl font-bold tracking-tight text-accent sm:text-5xl">
                <Counter value={10} suffix="+" />
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {financeSpotlight.scaleUnit}
              </span>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">Budget lifecycle</p>
            <FinanceFlow />
          </div>
        </GlassCard>
      </RevealOnScroll>
    </SectionShell>
  )
}
