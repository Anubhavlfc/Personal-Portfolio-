import { motion } from 'framer-motion'
import { profile } from '@/content/profile'
import { LinkButton } from '@/components/ui/Button'
import { FinancialGrid } from '@/components/ui/FinancialGrid'
import { SocialLink } from '@/components/ui/SocialLink'
import { iconPaths } from '@/lib/icons'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            {...fade(0)}
            className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {profile.location}
          </motion.p>

          <motion.h1
            {...fade(0.08)}
            className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="mt-4 max-w-xl text-balance text-xl font-medium leading-snug text-ink sm:text-2xl"
          >
            {profile.headline}
          </motion.p>

          <motion.p {...fade(0.24)} className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            {profile.subheadline}
          </motion.p>

          <motion.div {...fade(0.32)} className="mt-9 flex flex-wrap items-center gap-3">
            <LinkButton href="#projects" variant="primary">
              View Projects
            </LinkButton>
            <LinkButton href={profile.resumeUrl} download variant="secondary">
              Resume
            </LinkButton>
            <div className="flex items-center gap-2 sm:ml-2">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden lg:block"
        >
          <div className="grid-fade-mask aspect-square w-full rounded-2xl border border-border bg-surface/50 p-8">
            <FinancialGrid className="h-full w-full" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
