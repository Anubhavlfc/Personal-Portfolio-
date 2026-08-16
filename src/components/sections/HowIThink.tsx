import { howIThink } from '@/content/howIThink'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { FlowDiagram } from '@/components/ui/FlowDiagram'

export function HowIThink() {
  return (
    <SectionShell
      id="how-i-think"
      label="How I think"
      eyebrow="How I Think"
      title="A question becomes a decision through the same six steps, every time."
      intro="Tap a step to see what it means in practice."
    >
      <RevealOnScroll>
        <div className="grid-fade-mask rounded-3xl border border-accent/20 bg-gradient-to-b from-accent-soft/60 via-surface to-surface p-8 sm:p-12">
          <FlowDiagram stages={howIThink.map((s) => ({ label: s.label, detail: s.explanation }))} />
        </div>
      </RevealOnScroll>
    </SectionShell>
  )
}
