import { useEffect, useRef, useState } from 'react'
import { profile, isPlaceholderLink } from '@/content/profile'
import { education } from '@/content/education'
import { leadership, financeSpotlight } from '@/content/leadership'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { cn } from '@/lib/utils'

const facts = [
  { label: 'Studying', value: education.degrees.join(' · ') },
  { label: 'School', value: education.school },
  { label: 'Graduating', value: education.graduation.replace('Expected ', '') },
  { label: 'Honors', value: education.honors.join(' · ') },
  { label: 'Based in', value: profile.location },
]

const roles = [
  { role: financeSpotlight.role, org: financeSpotlight.org },
  ...leadership.map((l) => ({ role: l.role, org: l.org })),
]

function Portrait() {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'missing'>(
    isPlaceholderLink(profile.portraitUrl) ? 'missing' : 'loading',
  )
  const imgRef = useRef<HTMLImageElement>(null)

  // A cached image can finish before React attaches onLoad; catch that case.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setStatus('loaded')
  }, [])
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Monogram sits underneath and stays if the photo 404s, so a missing
          file never shows a broken image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-end bg-[radial-gradient(60%_50%_at_30%_20%,#d4a65722,transparent_70%),linear-gradient(160deg,#1b1a17,#0f0e0c)] p-6"
      >
        <span className="font-mono text-7xl font-medium tracking-tighter text-ink/90 sm:text-8xl">{initials}</span>
      </div>

      {status !== 'missing' && (
        <img
          ref={imgRef}
          src={profile.portraitUrl}
          alt={`Portrait of ${profile.name}`}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('missing')}
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-opacity duration-700 ease-[var(--ease-out-soft)]',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      <span className="label absolute right-4 top-4 rounded-md border border-border bg-bg/70 px-2 py-1 backdrop-blur-sm">
        {profile.location}
      </span>
    </div>
  )
}

export function About() {
  return (
    <SectionShell id="about" label="About" number="05" eyebrow="About" title="A little more about me." tone="raised">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <RevealOnScroll className="mx-auto w-full max-w-sm lg:col-span-4 lg:max-w-none">
          <Portrait />
        </RevealOnScroll>

        <div className="flex flex-col gap-10 lg:col-span-8">
          <RevealOnScroll delay={0.05}>
            <p className="text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">{profile.about}</p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">{profile.outsideOfWork}</p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="grid gap-10 sm:grid-cols-2">
              <dl className="divide-y divide-border border-y border-border">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex gap-6 py-3.5">
                    <dt className="label w-24 shrink-0 pt-0.5">{fact.label}</dt>
                    <dd className="text-sm leading-relaxed text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="label mb-4">Beyond coursework</p>
                <ul className="divide-y divide-border border-y border-border">
                  {roles.map((r) => (
                    <li key={r.role} className="py-3.5">
                      <p className="text-sm font-medium text-ink">{r.role}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">{r.org}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <p className="label mb-3">Selected coursework</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {education.coursework.map((c) => (
                <li key={c} className="font-mono text-sm text-ink-muted">
                  {c}
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </div>
    </SectionShell>
  )
}
