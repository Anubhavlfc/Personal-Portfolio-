import { projects, type CaseStudyProject, type FlagshipProject } from '@/content/projects'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Badge } from '@/components/ui/Badge'
import { FlowDiagram } from '@/components/ui/FlowDiagram'

function FlagshipCard({ project }: { project: FlagshipProject }) {
  return (
    <RevealOnScroll>
      <article className="overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-b from-accent-soft to-surface">
        <div className="p-8 sm:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-accent/40 bg-bg/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Flagship Project
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">01</span>
          </div>

          <h3 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{project.title}</h3>
          <p className="mt-2 text-lg text-ink-muted">{project.tagline}</p>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-muted">{project.story}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border/60 bg-bg/40 p-8 sm:p-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
            System architecture — tap a stage
          </p>
          <FlowDiagram stages={project.architecture} />
        </div>
      </article>
    </RevealOnScroll>
  )
}

function CaseStudyCard({ project }: { project: CaseStudyProject }) {
  return (
    <RevealOnScroll>
      <article className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="p-8 sm:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border bg-bg/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Data Science Case Study
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">02</span>
          </div>

          <h3 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{project.title}</h3>
          <p className="mt-2 text-lg text-ink-muted">{project.tagline}</p>

          <div className="mt-6 max-w-3xl rounded-xl border border-border bg-bg/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Problem</p>
            <p className="mt-2 text-base leading-relaxed text-ink">{project.problem}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>

          <p className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Outcome — </span>
            {project.outcome}
          </p>
        </div>

        <div className="border-t border-border bg-bg/30 p-8 sm:p-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
            Pipeline — tap a stage
          </p>
          <FlowDiagram stages={project.pipeline} />
        </div>
      </article>
    </RevealOnScroll>
  )
}

function PlaceholderCard() {
  return (
    <RevealOnScroll>
      <article className="rounded-3xl border border-dashed border-border p-8 sm:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Next Project
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">03</span>
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-ink-muted">Add your next project here</h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-faint">
          Reserved slot — drop in a title, the problem, the solution, the stack, and links to GitHub and a live
          demo when ready.
        </p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          {['Problem', 'Solution', 'Technologies', 'GitHub / Demo'].map((label) => (
            <div key={label} className="rounded-xl border border-dashed border-border p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</dt>
              <dd className="mt-2 text-ink-faint">—</dd>
            </div>
          ))}
        </dl>
      </article>
    </RevealOnScroll>
  )
}

export function Projects() {
  return (
    <SectionShell
      id="work"
      label="Projects"
      eyebrow="Selected work"
      title="Projects built to be used, not just demoed."
      intro="Each one is a small case study — the problem, the system, and what it produced."
    >
      <div className="flex flex-col gap-10">
        {projects.map((project) => {
          if (project.kind === 'flagship') return <FlagshipCard key={project.id} project={project} />
          if (project.kind === 'case-study') return <CaseStudyCard key={project.id} project={project} />
          return <PlaceholderCard key={project.id} />
        })}
      </div>
    </SectionShell>
  )
}
