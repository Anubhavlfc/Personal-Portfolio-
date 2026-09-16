import type { ReactNode } from 'react'
import { caseStudy, projects } from '@/content/projects'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { FlowDiagram } from '@/components/ui/FlowDiagram'
import { iconPaths } from '@/lib/icons'

const project = projects.find((p) => p.id === caseStudy.projectId)!

type Part = { id: string; label: string }

const parts: Part[] = [
  { id: 'problem', label: 'Problem' },
  { id: 'approach', label: 'Approach' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'implementation', label: 'Implementation' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'result', label: 'Result' },
  ...(caseStudy.reflection ? [{ id: 'reflection', label: 'What I learned' }] : []),
]

function Block({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <RevealOnScroll>
      <div id={`case-${id}`} className="scroll-mt-28 border-t border-border pt-8">
        <h3 className="label text-accent">{label}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </RevealOnScroll>
  )
}

export function CaseStudy() {
  return (
    <SectionShell
      id="case-study"
      label="Case study"
      number="03"
      eyebrow={caseStudy.eyebrow}
      title={
        <>
          {project.title}{' '}
          <span className="block text-ink-muted">How the system is put together.</span>
        </>
      }
      tone="raised"
      headerClassName="max-w-3xl"
    >
      <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-20">
        {/* Sticky in-section navigation */}
        <nav aria-label="Case study sections" className="lg:sticky lg:top-28 lg:self-start">
          <ol className="flex flex-wrap gap-x-5 gap-y-2 lg:flex-col lg:gap-3">
            {parts.map((part, i) => (
              <li key={part.id}>
                <a
                  href={`#case-${part.id}`}
                  className="group/toc inline-flex items-baseline gap-3 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  <span className="label transition-colors group-hover/toc:text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {part.label}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-8 hidden max-w-[180px] text-xs leading-relaxed text-ink-faint lg:block">
            Stack: {project.stack.join(', ')}
          </p>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group/src mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={iconPaths.github} />
              </svg>
              View source
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover/src:translate-x-1"
              >
                →
              </span>
            </a>
          )}
        </nav>

        <div className="flex flex-col gap-12">
          <Block id="problem" label="Problem">
            <p className="max-w-2xl text-lg leading-relaxed text-ink">{caseStudy.problem}</p>
          </Block>

          <Block id="approach" label="Approach">
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{caseStudy.approach}</p>
          </Block>

          <Block id="architecture" label="Architecture & technical decisions">
            <div className="rounded-2xl border border-border bg-bg/50 p-6 sm:p-8">
              <p className="label mb-6">Request flow — select a stage</p>
              <FlowDiagram stages={project.diagram} />
            </div>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {caseStudy.decisions.map((d, i) => (
                <li key={d.title} className="panel rounded-xl border border-border bg-surface p-5">
                  <p className="label">{String(i + 1).padStart(2, '0')}</p>
                  <p className="mt-3 text-sm font-semibold text-ink">{d.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{d.detail}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="implementation" label="Implementation">
            <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{caseStudy.implementation}</p>
          </Block>

          <Block id="challenge" label="The hard part">
            <p className="max-w-2xl border-l-2 border-accent pl-5 text-base leading-relaxed text-ink">
              {caseStudy.challenge}
            </p>
          </Block>

          <Block id="result" label="Result">
            <ul className="grid gap-3 md:grid-cols-3">
              {caseStudy.result.map((r) => (
                <li key={r} className="rounded-xl border border-border bg-bg/40 p-5 text-sm leading-relaxed text-ink">
                  {r}
                </li>
              ))}
            </ul>
          </Block>

          {caseStudy.reflection && (
            <Block id="reflection" label="What I learned">
              <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{caseStudy.reflection}</p>
            </Block>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
