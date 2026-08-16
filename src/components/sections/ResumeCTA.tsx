import { profile } from '@/content/profile'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { LinkButton } from '@/components/ui/Button'

export function ResumeCTA() {
  return (
    <SectionShell id="resume" label="Resume" className="py-20 sm:py-24">
      <RevealOnScroll className="flex flex-col items-center rounded-3xl border border-border bg-surface px-8 py-16 text-center sm:px-12">
        <h2 className="text-balance text-2xl font-semibold text-ink sm:text-3xl">Want the full picture?</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Everything above, plus the details that don't fit on a webpage.
        </p>
        <LinkButton href={profile.resumeUrl} download variant="primary" className="mt-8">
          Download Resume
        </LinkButton>
      </RevealOnScroll>
    </SectionShell>
  )
}
