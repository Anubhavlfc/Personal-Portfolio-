import { motion } from 'framer-motion'
import { profile } from '@/content/profile'
import { LinkButton } from '@/components/ui/Button'
import { FinancialGrid } from '@/components/ui/FinancialGrid'
import { GlassCard } from '@/components/ui/GlassCard'
import { SocialLink } from '@/components/ui/SocialLink'
import { iconPaths } from '@/lib/icons'

const domains = ['SOFTWARE', 'DATA', 'AI', 'FINANCE']

export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {profile.location}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-semibold tracking-tight text-ink-muted sm:text-xl"
          >
            <span>Building at the intersection of</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-1 flex flex-wrap items-baseline gap-x-3 text-2xl font-bold tracking-tight text-accent sm:text-3xl"
          >
            {domains.map((d, i) => (
              <span key={d} className="flex items-baseline gap-3">
                {d}
                {i < domains.length - 1 && <span className="text-ink-faint">×</span>}
              </span>
            ))}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-xl text-balance text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {profile.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <LinkButton href="#work" variant="primary">
              Explore My Work
            </LinkButton>
            <LinkButton href="#resume" variant="secondary">
              View Resume
            </LinkButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex items-center gap-3"
          >
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
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <GlassCard hover={false} className="grid-fade-mask relative aspect-square w-full p-6 sm:p-8">
            <FinancialGrid className="h-full w-full" />
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
