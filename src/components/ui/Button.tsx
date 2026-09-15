import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'group/btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-soft)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-accent'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-bg shadow-[0_0_0_0_transparent] hover:bg-accent-bright hover:shadow-[0_8px_28px_-10px_var(--color-accent)]',
  secondary:
    'border border-border bg-surface/70 text-ink backdrop-blur-sm hover:border-accent/45 hover:bg-surface-2/80 hover:shadow-[0_8px_26px_-18px_#000]',
  ghost: 'text-ink-muted hover:text-ink',
}

/** Nudges to the right on hover; skipped under reduced motion via the media query in index.css. */
export function ButtonArrow() {
  return (
    <span
      aria-hidden="true"
      className="inline-block transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover/btn:translate-x-1"
    >
      →
    </span>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant
  children: ReactNode
}

export function LinkButton({ variant = 'primary', className, children, ...props }: LinkButtonProps) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      {children}
    </a>
  )
}
