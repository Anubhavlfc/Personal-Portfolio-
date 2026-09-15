export type Note = {
  slug: string
  title: string
  summary: string
  date: string // ISO date, e.g. '2026-09-15'
  category: 'Lesson' | 'Breakdown' | 'Experiment' | 'Decision'
  href?: string // external link or a future route; omit while the note is unpublished
}

/**
 * Short engineering write-ups. Empty on purpose — the section renders an
 * honest "nothing published yet" state rather than placeholder articles.
 * Add entries here as they're written; newest first.
 */
export const notes: Note[] = []
