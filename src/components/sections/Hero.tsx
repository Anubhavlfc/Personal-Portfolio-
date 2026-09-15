import { motion } from 'framer-motion'
import { profile } from '@/content/profile'
import { experience } from '@/content/experience'
import { education } from '@/content/education'
import { projects } from '@/content/projects'
import { LinkButton, ButtonArrow } from '@/components/ui/Button'
import { SocialLink } from '@/components/ui/SocialLink'
import { iconPaths } from '@/lib/icons'
import { useSpotlight } from '@/hooks/useSpotlight'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
})

// The right-hand index is assembled from the same content the sections use,
// so it can't say something the rest of the page doesn't.
const current = experience.find((e) => e.period.includes('Present')) ?? experience[0]
const previous = experience.find((e) => e.id !== current.id)
const flagship = projects[0]

const index = [
  { key: 'now', value: `${current.role} · ${current.org}`, href: '#experience' },
  previous ? { key: 'prev', value: `${previous.role} · ${previous.org}`, href: '#experience' } : null,
  { key: 'built', value: `${flagship.title} · ${flagship.kicker.split(' · ')[1] ?? flagship.kicker}`, href: '#projects' },
  { key: 'study', value: `${education.degrees.join(' · ')} · ${education.graduation.replace('Expected ', '')}`, href: '#about' },
  { key: 'based', value: profile.location, href: '#about' },
].filter((row): row is NonNullable<typeof row> => row !== null)

export function Hero() {
  const spotlightRef = useSpotlight<HTMLElement>()

  return (
    <section
      ref={spotlightRef}
      id="top"
      aria-label="Introduction"
      className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(34rem circle at var(--mx, 25%) var(--my, 35%), #d4a65712, transparent 62%)',
        }}
      />

      <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20">
        <div>
          <motion.p {...fade(0)} className="label mb-6">
            {profile.name}
          </motion.p>

          <motion.h1
            {...fade(0.08)}
            className="text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]"
          >
            {profile.positioning}
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {profile.supporting}
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <LinkButton href="#projects" variant="primary" magnetic>
              View Projects
              <ButtonArrow />
            </LinkButton>
            <LinkButton href={profile.resumeUrl} target="_blank" rel="noreferrer" variant="secondary">
              Résumé
            </LinkButton>
            <div className="flex items-center gap-2 sm:ml-1">
              <SocialLink href={profile.githubUrl} label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={iconPaths.github} />
                </svg>
              </SocialLink>
              <SocialLink href={profile.linkedinUrl} label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={iconPaths.linkedin} />
                </svg>
              </SocialLink>
            </div>
          </motion.div>
        </div>

        <motion.ul
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-label="At a glance"
          className="panel rounded-2xl border border-border bg-surface/60 backdrop-blur-sm"
        >
          {index.map((row, i) => (
            <li key={row.key} className={i > 0 ? 'border-t border-border' : undefined}>
              <a
                href={row.href}
                className="group/row grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:px-6"
              >
                <span className="label transition-colors group-hover/row:text-accent">{row.key}</span>
                <span className="min-w-0 text-sm leading-snug text-ink">{row.value}</span>
                <span
                  aria-hidden="true"
                  className="text-ink-faint transition-[color,transform] duration-300 ease-[var(--ease-out-soft)] group-hover/row:translate-x-0.5 group-hover/row:text-accent"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
