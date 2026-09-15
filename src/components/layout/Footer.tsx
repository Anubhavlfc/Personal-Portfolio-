import { profile, isPlaceholderLink } from '@/content/profile'

export function Footer() {
  const year = new Date().getFullYear()
  const links = [
    { label: 'Email', href: `mailto:${profile.email}` },
    { label: 'GitHub', href: profile.githubUrl },
    { label: 'LinkedIn', href: profile.linkedinUrl },
    { label: 'Résumé', href: profile.resumeUrl },
  ].filter((l) => !isPlaceholderLink(l.href))

  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="label">
          © {year} {profile.name}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={l.href.startsWith('mailto:') ? undefined : 'noreferrer'}
              className="text-sm text-ink-muted transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
          <a href="#top" className="text-sm text-ink-muted transition-colors hover:text-accent">
            Top ↑
          </a>
        </nav>
      </div>
    </footer>
  )
}
