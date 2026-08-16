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
  const placeholder = isPlaceholderLink(href)
  return (
    <a
      href={placeholder ? undefined : href}
      target={placeholder ? undefined : '_blank'}
      rel={placeholder ? undefined : 'noreferrer'}
      aria-disabled={placeholder}
      aria-label={placeholder ? `${label} (link coming soon)` : label}
      title={placeholder ? `${label} — coming soon` : label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-accent/50 hover:text-accent aria-disabled:cursor-not-allowed aria-disabled:opacity-40',
        className,
      )}
    >
      {children}
    </a>
  )
}
