import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '@/content/profile'
import { useActiveSection } from '@/hooks/useActiveSection'
import { cn } from '@/lib/utils'

const links = [
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
]

// Case study and capabilities highlight their neighbors rather than adding nav items.
const sectionIds = ['projects', 'experience', 'case-study', 'capabilities', 'about', 'contact']
const activeAlias: Record<string, string> = { 'case-study': 'projects', capabilities: 'about' }

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rawActive = useActiveSection(sectionIds)
  const active = rawActive ? (activeAlias[rawActive] ?? rawActive) : null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ease-[var(--ease-out-soft)]',
        scrolled ? 'border-b border-border/80 bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between px-6 transition-[padding] duration-500 ease-[var(--ease-out-soft)] sm:px-8',
          scrolled ? 'py-3' : 'py-5',
        )}
      >
        <a href="#top" className="-my-2 py-2 text-sm font-semibold tracking-tight text-ink transition-colors hover:text-accent">
          {profile.name}
        </a>

        <div className="hidden items-center gap-2 md:flex">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = active === link.id
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm transition-colors duration-300',
                    isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-x-3 -bottom-px h-px bg-accent"
                    />
                  )}
                </a>
              )
            })}
          </nav>
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-2 text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
          >
            Résumé
          </a>
          <a
            href="#contact"
            className="ml-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm font-medium text-ink backdrop-blur-sm transition-[border-color,background-color,color] duration-300 hover:border-accent/50 hover:text-accent"
          >
            Let's talk
          </a>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink transition-colors hover:border-accent/50 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            {menuOpen ? (
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M1 4h14M1 8h14M1 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-4 py-2">
              {links.map((link, i) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-baseline gap-4 rounded-md px-3 py-3.5 text-base transition-colors',
                    active === link.id ? 'text-accent' : 'text-ink-muted hover:bg-surface hover:text-ink',
                  )}
                >
                  <span className="label">{String(i + 1).padStart(2, '0')}</span>
                  {link.label}
                </a>
              ))}
              <div className="my-3 flex flex-col gap-2">
                <a
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-accent px-4 py-3 text-center text-base font-semibold text-bg"
                >
                  Let's talk
                </a>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-border px-4 py-3 text-center text-base font-medium text-ink"
                >
                  Résumé
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
