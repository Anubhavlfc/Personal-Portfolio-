import { profile, isPlaceholderLink } from '@/content/profile'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { LinkButton, ButtonArrow } from '@/components/ui/Button'
import { iconPaths } from '@/lib/icons'

type Method = {
  label: string
  value: string
  href: string
  icon: string | null
  external?: boolean
}

export function Contact() {
  // Links without a URL yet are omitted rather than shown as dead rows.
  const methods: Method[] = (
    [
      { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: null },
    !isPlaceholderLink(profile.githubUrl)
      ? {
          label: 'GitHub',
          value: profile.githubUrl.replace('https://', ''),
          href: profile.githubUrl,
          icon: iconPaths.github,
          external: true,
        }
      : null,
    !isPlaceholderLink(profile.linkedinUrl)
      ? {
          label: 'LinkedIn',
          value: profile.linkedinUrl.replace('https://', ''),
          href: profile.linkedinUrl,
          icon: iconPaths.linkedin,
          external: true,
        }
      : null,
      { label: 'Résumé', value: 'View PDF', href: profile.resumeUrl, icon: null, external: true },
    ] satisfies (Method | null)[]
  ).filter((m) => m !== null)

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative scroll-mt-20 py-24 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:-z-10 before:h-[28rem] before:bg-[radial-gradient(44rem_20rem_at_50%_100%,#d4a65714,transparent_70%)] sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <RevealOnScroll className="lg:col-span-7">
            <p className="label mb-5">06 — Contact</p>
            <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Let's build something useful.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
              Email is fastest. I'm glad to talk through anything on this page — how it was built, what I'd do
              differently, or what I'd want to build next.
            </p>
            <div className="mt-8">
              <LinkButton href={`mailto:${profile.email}`} variant="primary" magnetic>
                Say hello
                <ButtonArrow />
              </LinkButton>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1} className="lg:col-span-5">
            <ul className="divide-y divide-border border-y border-border">
              {methods.map((method) => (
                <li key={method.label}>
                  <a
                    href={method.href}
                    target={method.external ? '_blank' : undefined}
                    rel={method.external ? 'noreferrer' : undefined}
                    className="group flex items-center justify-between gap-6 py-5 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="label w-20 shrink-0">{method.label}</span>
                      <span className="flex items-center gap-2 break-all text-sm text-ink transition-colors group-hover:text-accent">
                        {method.icon && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d={method.icon} />
                          </svg>
                        )}
                        {method.value}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-ink-faint transition-[color,transform] duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1 group-hover:text-accent"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}
