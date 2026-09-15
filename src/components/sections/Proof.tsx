import { proof } from '@/content/proof'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

/**
 * A horizontal strip rather than a full section — it should read as a
 * receipt for the projects above, not a destination of its own.
 */
export function Proof() {
  return (
    <section aria-label="Proof" className="relative py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <RevealOnScroll>
          {/* gap-px over a border-colored background draws hairlines between
              every cell at any column count, so rows never lose their divider. */}
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {proof.map((item, i) => (
              <li
                key={item.label}
                className="group/proof relative bg-bg-raised px-6 py-6 transition-colors hover:bg-surface sm:last:col-span-2 lg:last:col-span-1"
              >
                <span aria-hidden="true" className="label absolute right-5 top-4 opacity-50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-mono text-3xl font-medium tracking-tight text-ink transition-colors group-hover/proof:text-accent sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">{item.detail}</p>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  )
}
