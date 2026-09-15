import { motion } from 'framer-motion'
import { profile } from '@/content/profile'
import { LinkButton, ButtonArrow } from '@/components/ui/Button'
import { FinancialGrid } from '@/components/ui/FinancialGrid'
import { SocialLink } from '@/components/ui/SocialLink'
import { iconPaths } from '@/lib/icons'
import { useSpotlight } from '@/hooks/useSpotlight'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export function Hero() {
  const spotlightRef = useSpotlight<HTMLElement>()

  return (
    <section
      ref={spotlightRef}
      id="top"
      aria-label="Introduction"
      className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28"
    >
      {/* Light that follows the cursor. Defaults to a fixed position so touch
          devices still get the glow, just without the tracking. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(32rem circle at var(--mx, 70%) var(--my, 30%), #d4a65712, transparent 62%)',
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            {...fade(0)}
            className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            {profile.location}
          </motion.p>

          <motion.h1
            {...fade(0.08)}
            className="text-balance bg-gradient-to-br from-ink via-ink to-ink-muted bg-clip-text text-4xl font-bold leading-[1.08] tracking-tight text-transparent sm:text-5xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="mt-4 max-w-xl text-balance text-xl font-medium leading-snug text-ink sm:text-2xl"
          >
            {profile.headline}
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="#projects" variant="primary">
              View Projects
              <ButtonArrow />
            </LinkButton>
            <LinkButton href={profile.resumeUrl} target="_blank" rel="noreferrer" variant="secondary">
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
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden lg:block"
        >
          <div className="panel grid-fade-mask aspect-square w-full rounded-2xl border border-border bg-surface/40 p-8">
            <FinancialGrid className="h-full w-full" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
