import { projects, type Project } from '@/content/projects'
import { isPlaceholderLink } from '@/content/profile'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Badge } from '@/components/ui/Badge'
import { FlowDiagram } from '@/components/ui/FlowDiagram'
import { iconPaths } from '@/lib/icons'
import { useSpotlight } from '@/hooks/useSpotlight'

function ProjectLinks({ project }: { project: Project }) {
  const links = [
    project.githubUrl && !isPlaceholderLink(project.githubUrl)
      ? { href: project.githubUrl, label: 'View source', icon: iconPaths.github }
      : null,
    project.demoUrl && !isPlaceholderLink(project.demoUrl)
      ? { href: project.demoUrl, label: 'Live demo', icon: null }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: string | null }[]

  if (links.length === 0) return null

  return (
    <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-6">
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

  return (
    <RevealOnScroll delay={index * 0.08} intensity="strong">
      <article
        ref={spotlightRef}
        className="spotlight panel group/card relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 ease-[var(--ease-out-soft)] hover:border-accent/30 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_28px_60px_-32px_#000]"
      >
        <div className="relative p-7 sm:p-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="text-xs font-medium tabular-nums text-ink-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{project.title}</h3>
          </div>
          <p className="mt-2 text-sm text-ink-faint">{project.kicker}</p>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted">{project.summary}</p>

          <div className="mt-6 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">What I built</p>
            <p className="mt-2 text-base leading-relaxed text-ink">{project.contribution}</p>
          </div>

          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2 transition-opacity duration-500 [&>*]:transition-colors [&>*]:duration-500 group-hover/card:[&>*]:border-accent/30 group-hover/card:[&>*]:text-ink">
            {project.stack.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          <ProjectLinks project={project} />
        </div>

        <div className="relative border-t border-border bg-bg/40 p-7 sm:p-10">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
            {project.diagramLabel} — select a stage
          </p>
          <FlowDiagram stages={project.diagram} />
        </div>
      </article>
    </RevealOnScroll>
  )
}

export function Projects() {
  return (
    <SectionShell
      id="projects"
      label="Projects"
      eyebrow="Projects"
      title="Things I've built."
      intro="Two projects I'd want to talk through in an interview — what the problem was, and what I actually wrote."
    >
      <div className="flex flex-col gap-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </SectionShell>
  )
}
