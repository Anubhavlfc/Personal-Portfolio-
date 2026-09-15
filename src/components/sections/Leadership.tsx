import { leadership, financeSpotlight } from '@/content/leadership'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

function BudgetFlow() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {financeSpotlight.flow.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span className="whitespace-nowrap rounded-md border border-border bg-bg/50 px-3 py-1.5 text-xs font-medium text-ink-muted">
            {step}
          </span>
          {i < financeSpotlight.flow.length - 1 && (
            <svg width="12" height="12" viewBox="0 0 20 20" className="shrink-0 text-ink-faint" aria-hidden="true">
              <path
                d="M2 10h14M11 5l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

export function Leadership() {
  return (
    <SectionShell
      id="leadership"
      label="Leadership"
      tone="raised"
      eyebrow="Leadership"
      title="Responsibility outside of coursework."
    >
      <div className="flex flex-col gap-6">
        <RevealOnScroll>
          <article className="rounded-2xl border border-border bg-surface p-7 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-ink">{financeSpotlight.role}</h3>
                <p className="mt-1 text-sm text-ink-muted">{financeSpotlight.org}</p>
              </div>
              <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
                <span className="text-3xl font-semibold tracking-tight text-accent">
                  {financeSpotlight.eventCount}+
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
                  {financeSpotlight.eventUnit}
                </span>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted">
              {financeSpotlight.description}
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Budget lifecycle</p>
              <BudgetFlow />
            </div>
          </article>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-3">
          {leadership.map((entry, i) => (
            <RevealOnScroll key={entry.id} delay={i * 0.06}>
              <article className="h-full rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent/40">
                <h3 className="text-base font-semibold text-ink">{entry.role}</h3>
                <p className="mt-1 text-sm text-accent">{entry.org}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{entry.focus}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
