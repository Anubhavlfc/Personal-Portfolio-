import type { ReactNode } from 'react'
import { isPlaceholderLink } from '@/content/profile'
import { cn } from '@/lib/utils'

export function SocialLink({
  href,
  label,
  children,
  className,
}: {
  href: string
  label: string
  children: ReactNode
  className?: string
}) {
  // Until a URL is filled in, render nothing rather than a dead "coming soon" link.
  if (isPlaceholderLink(href)) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-accent/50 hover:text-accent',
        className,
      )}
    >
      {children}
    </a>
  )
}
