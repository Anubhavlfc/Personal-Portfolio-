import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:bg-accent-bright active:scale-[0.98]',
  secondary:
    'border border-border bg-surface text-ink hover:border-accent/50 hover:bg-surface-2 active:scale-[0.98]',
  ghost: 'text-ink-muted hover:text-ink',
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
