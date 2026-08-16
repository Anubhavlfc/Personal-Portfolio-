import { useState, type FormEvent } from 'react'
import { profile } from '@/content/profile'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Button } from '@/components/ui/Button'
import { SocialLink } from '@/components/ui/SocialLink'
import { iconPaths } from '@/lib/icons'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const subject = `Portfolio contact from ${name || 'a visitor'}`
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ''}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <SectionShell
      id="contact"
      label="Contact"
      eyebrow="Contact"
      title={
        <>
          Have an interesting problem?
          <br />
          <span className="text-ink-muted">Let's build something.</span>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <RevealOnScroll className="flex flex-col gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="text-lg font-medium text-ink transition-colors hover:text-accent break-all"
          >
            {profile.email}
          </a>
          <div className="flex items-center gap-3">
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
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2 w-full resize-none rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
              />
            </div>
            <Button type="submit" variant="primary" className="mt-6 w-full sm:w-auto">
              Send Message
            </Button>
            <p className="mt-3 text-xs text-ink-faint">Opens your email client with this addressed to me.</p>
          </form>
        </RevealOnScroll>
      </div>
    </SectionShell>
  )
}
