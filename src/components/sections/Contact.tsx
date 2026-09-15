import { profile, isPlaceholderLink } from '@/content/profile'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { iconPaths } from '@/lib/icons'

type Method = {
  label: string
  value: string
  href: string
  icon: string | null
  external?: boolean
}

export function Contact() {
  // Links without a URL yet are omitted entirely rather than shown as dead rows.
  const methods: Method[] = [
    {
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: null,
    },
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
    {
      label: 'Resume',
      value: 'View PDF',
      href: profile.resumeUrl,
      icon: null,
      external: true,
    },
  ].filter(Boolean) as Method[]

  return (
    <SectionShell
      id="contact"
      label="Contact"
      tone="glow"
      eyebrow="Contact"
      title="Get in touch."
      intro="The fastest way to reach me is email — happy to talk about anything I've built here."
    >
      <RevealOnScroll>
        <ul className="divide-y divide-border border-y border-border">
          {methods.map((method) => (
            <li key={method.label}>
              <a
                href={method.href}
                target={method.external ? '_blank' : undefined}
                rel={method.external ? 'noreferrer' : undefined}
                className="group flex flex-col gap-1 py-5 transition-colors sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="flex w-32 shrink-0 items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
                  {method.icon && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={method.icon} />
                    </svg>
                  )}
                  {method.label}
                </span>
                <span className="flex items-center gap-2 break-all text-base text-ink transition-colors group-hover:text-accent">
                  {method.value}
                  <span aria-hidden="true" className="text-ink-faint transition-colors group-hover:text-accent">
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </RevealOnScroll>
    </SectionShell>
  )
}
