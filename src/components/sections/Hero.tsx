import { useLayoutEffect, useRef, type RefObject } from 'react'
import { motion } from 'framer-motion'
import { profile } from '@/content/profile'
import { experience } from '@/content/experience'
import { education } from '@/content/education'
import { projects } from '@/content/projects'
import { LinkButton, ButtonArrow } from '@/components/ui/Button'
import { SocialLink } from '@/components/ui/SocialLink'
import { iconPaths } from '@/lib/icons'
import { useSpotlight } from '@/hooks/useSpotlight'
import { GeodesicSphere } from '@/components/ui/GeodesicSphere'

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

// Desktop placement of the sphere, in CSS px.
const TEXT_GAP = 24 // clear space between the end of the copy and the sphere
const EDGE_GAP = 40 // clear space from the right edge of the page
const TOP_GAP = 88 // below the nav
const BOTTOM_GAP = 64 // above the section end, with room for the drag hint

/**
 * Sizes and places the sphere so it starts just past where the copy's
 * longest line actually ends and stops short of the page edge — measured
 * from the rendered text, so it holds at every width and with any font.
 * Below lg the sphere uses its CSS placement and this clears itself.
 */
function useSphereSlot(section: RefObject<HTMLElement | null>, copy: RefObject<HTMLElement | null>, slot: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const sectionEl = section.current
    const copyEl = copy.current
    const slotEl = slot.current
    if (!sectionEl || !copyEl || !slotEl) return
    const desktop = window.matchMedia('(min-width: 1024px)')
    const range = document.createRange()

    const place = () => {
      const keys = ['left', 'top', 'width', 'height', 'right'] as const
      if (!desktop.matches) {
        for (const k of keys) slotEl.style.removeProperty(k)
        return
      }
      const box = sectionEl.getBoundingClientRect()
      let textRight = 0
      for (const el of copyEl.querySelectorAll('h1, p')) {
        range.selectNodeContents(el)
        for (const r of range.getClientRects()) textRight = Math.max(textRight, r.right)
      }
      const left = textRight - box.left + TEXT_GAP
      const right = box.width - EDGE_GAP
      const top = TOP_GAP
      const bottom = box.height - BOTTOM_GAP
      const size = Math.max(0, Math.min(right - left, bottom - top))
      slotEl.style.left = `${left}px`
      slotEl.style.top = `${top + (bottom - top - size) / 2}px`
      slotEl.style.width = `${size}px`
      slotEl.style.height = `${size}px`
      slotEl.style.right = 'auto'
    }

    place()
    const ro = new ResizeObserver(place)
    ro.observe(sectionEl)
    ro.observe(copyEl)
    desktop.addEventListener('change', place)
    void document.fonts?.ready.then(place)
    return () => {
      ro.disconnect()
      desktop.removeEventListener('change', place)
    }
  }, [section, copy, slot])
}

export function Hero() {
  const spotlightRef = useSpotlight<HTMLElement>()
  const copyRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  useSphereSlot(spotlightRef, copyRef, slotRef)

  return (
    <section
      ref={spotlightRef}
      id="top"
      aria-label="Introduction"
      className="relative overflow-x-clip pt-32 pb-16 sm:pt-40 sm:pb-24 lg:flex lg:min-h-[min(100svh,62rem)] lg:flex-col lg:justify-center lg:pt-28 lg:pb-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(34rem circle at var(--mx, 25%) var(--my, 35%), #d4a65712, transparent 62%)',
        }}
      />

      {/* Signature visual. On desktop useSphereSlot places it whole between the
          copy and the page edge. On small screens it rides behind the headline
          and dissolves downward so the supporting copy stays clean. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          ref={slotRef}
          className="pointer-events-auto absolute right-[-40%] top-10 h-[min(108vw,27rem)] w-[min(108vw,27rem)] opacity-70 [mask-image:linear-gradient(to_bottom,#000_40%,transparent_76%)] sm:right-[-22%] sm:top-20 sm:[mask-image:linear-gradient(to_bottom,#000_34%,transparent_66%)] sm:h-[30rem] sm:w-[30rem] lg:opacity-100 lg:[mask-image:none]"
        >
          <GeodesicSphere className="h-full w-full" layout={{ radius: 0.5, offsetY: 0 }} />
          <p className="label pointer-events-none absolute left-1/2 top-full mt-4 hidden -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border border-border/70 bg-bg/70 px-3.5 py-1.5 backdrop-blur-md lg:flex">
            <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true" className="animate-[nudge-x_2.4s_ease-in-out_infinite] text-accent">
              <path d="M5 1 1 5l4 4M17 1l4 4-4 4M1 5h20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Drag to spin
          </p>
        </div>
      </div>

      {/* Pointer-transparent grid so the sphere stays reachable between columns. */}
      <div className="pointer-events-none relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-6 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20 [&>*]:pointer-events-auto">
        {/* On small screens the sphere sits behind this copy; .text-halo keeps it crisp. */}
        <div ref={copyRef}>
          <motion.p {...fade(0)} className="label text-halo mb-6">
            {profile.name}
          </motion.p>

          <motion.h1
            {...fade(0.08)}
            className="text-halo text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]"
          >
            {profile.positioning}
          </motion.h1>

          <motion.p {...fade(0.16)} className="text-halo mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
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
