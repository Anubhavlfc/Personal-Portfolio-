import { notes, type Note } from '@/content/notes'
import { SectionShell } from '@/components/ui/SectionShell'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

function NoteRow({ note }: { note: Note }) {
  const Wrapper = note.href ? 'a' : 'div'
  const linkProps = note.href
    ? { href: note.href, target: note.href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' }
    : {}

  return (
    <li>
      <Wrapper
        {...linkProps}
        className="group/note grid gap-2 py-6 transition-colors sm:grid-cols-[140px_1fr_auto] sm:gap-8 sm:items-baseline"
      >
        <div className="flex items-center gap-3 sm:block">
          <time dateTime={note.date} className="label">
            {formatDate(note.date)}
          </time>
          <span className="label text-accent sm:mt-1.5 sm:block">{note.category}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink transition-colors group-hover/note:text-accent">{note.title}</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">{note.summary}</p>
        </div>
        {note.href && (
          <span
            aria-hidden="true"
            className="hidden text-ink-faint transition-[color,transform] duration-300 ease-[var(--ease-out-soft)] group-hover/note:translate-x-1 group-hover/note:text-accent sm:block"
          >
            →
          </span>
        )}
      </Wrapper>
    </li>
  )
}

export function Notes() {
  return (
    <SectionShell
      id="notes"
      label="Engineering notes"
      number="06"
      eyebrow="Engineering notes"
      title="Small things I'm learning, building, and thinking about."
    >
      <RevealOnScroll>
        {notes.length > 0 ? (
          <ul className="divide-y divide-border border-y border-border">
            {notes.map((note) => (
              <NoteRow key={note.slug} note={note} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center sm:px-10">
            <p className="label">Nothing published yet</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
              This is where short write-ups will go — lessons from the projects above, engineering decisions, and
              things I'm working through. Check back.
            </p>
          </div>
        )}
      </RevealOnScroll>
    </SectionShell>
  )
}
