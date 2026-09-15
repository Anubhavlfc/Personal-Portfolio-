import { projects, caseStudy, type Project } from '@/content/projects'
import { isPlaceholderLink } from '@/content/profile'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { FlowDiagram } from '@/components/ui/FlowDiagram'
import { iconPaths } from '@/lib/icons'
import { useSpotlight } from '@/hooks/useSpotlight'
import { cn } from '@/lib/utils'

function ProjectLinks({ project }: { project: Project }) {
  const links = [
    project.githubUrl && !isPlaceholderLink(project.githubUrl)
      ? { href: project.githubUrl, label: 'Source', icon: iconPaths.github }
      : null,
    project.demoUrl && !isPlaceholderLink(project.demoUrl)
      ? { href: project.demoUrl, label: 'Live demo', icon: null }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: string | null }[]

  if (links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-5">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="group/link inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
        >
          {link.icon && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={link.icon} />
            </svg>
          )}
          {link.label}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover/link:translate-x-1"
          >
            →
          </span>
        </a>
      ))}
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const spotlightRef = useSpotlight<HTMLElement>()
  const flipped = index % 2 === 1
  const hasCaseStudy = project.id === caseStudy.projectId

  return (
    <RevealOnScroll delay={index * 0.06} intensity="strong">
      <article
        ref={spotlightRef}
        aria-labelledby={`${project.id}-title`}
        className="spotlight panel group/card relative overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:border-accent/30 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_32px_64px_-36px_#000]"
      >
        <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-12 lg:gap-12">
          {/* Narrative column */}
          <div className={cn('lg:col-span-7', flipped && 'lg:order-2')}>
            <div className="flex items-center gap-3">
              <span className="label">{String(index + 1).padStart(2, '0')}</span>
              <span aria-hidden="true" className="h-px w-6 bg-border" />
              <span className="label">{project.kicker}</span>
            </div>

            <h3 id={`${project.id}-title`} className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {project.title}
            </h3>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">{project.problem}</p>

            <div className="mt-7">
              <p className="label text-accent">What I built</p>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-ink">{project.contribution}</p>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {project.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Metadata column — sits on the opposite side for every other project */}
          <aside
            className={cn(
              'flex flex-col gap-7 lg:col-span-5 lg:border-l lg:border-border lg:pl-10',
              flipped && 'lg:order-1 lg:border-l-0 lg:border-r lg:pl-0 lg:pr-10',
            )}
          >
            <div>
              <p className="label">Why it matters</p>
              <p className="mt-2 text-base leading-relaxed text-ink">{project.whyItMatters}</p>
            </div>

            <div>
              <p className="label">Stack</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {project.stack.map((s) => (
                  <li key={s} className="font-mono text-sm text-ink-muted transition-colors duration-500 group-hover/card:text-ink">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <ProjectLinks project={project} />
          </aside>
        </div>

        {hasCaseStudy ? (
          // The diagram lives in the case study for this one — link there instead of repeating it.
          <a
            href="#case-study"
            className="group/cs relative flex items-center justify-between gap-6 border-t border-border bg-bg/40 px-7 py-5 transition-colors hover:bg-accent-soft sm:px-10"
          >
            <span>
              <span className="label block">Case study</span>
              <span className="mt-1 block text-sm text-ink">
                Problem, architecture, the hard part, and the result — in detail.
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-ink-faint transition-[color,transform] duration-300 ease-[var(--ease-out-soft)] group-hover/cs:translate-x-1 group-hover/cs:text-accent"
            >
              →
            </span>
          </a>
        ) : (
          <div className="relative border-t border-border bg-bg/40 p-7 sm:p-10">
            <p className="label mb-6">{project.diagramLabel} — select a stage</p>
            <FlowDiagram stages={project.diagram} />
          </div>
        )}
      </article>
    </RevealOnScroll>
  )
}

export function FeaturedProjects() {
  return (
    <SectionShell
      id="projects"
      label="Featured projects"
      number="01"
      eyebrow="Featured work"
      title="Things I've actually built."
      intro="Each one is the problem, what I wrote to solve it, and why it was worth solving."
    >
      <div className="flex flex-col gap-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </SectionShell>
  )
}
