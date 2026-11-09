import type { ReactNode } from 'react'
import type { SceneFactory } from '@/lib/art/scene'
import { cn } from '@/lib/utils'
import { ArtCanvas } from './ArtCanvas'

type FigureProps<P> = {
  /** Plate number in the site-wide sequence; the hero sphere is 1. */
  n: number
  title: string
  /** The mathematics, stated plainly. */
  meta?: ReactNode
  /** How to interact — shown only where a fine pointer exists. */
  hint?: string
  load: () => Promise<{ default: SceneFactory<P> }>
  props?: P
  interaction?: 'canvas' | 'section' | 'none'
  className?: string
  /** Box that holds the canvas; sets the figure's size. */
  stageClassName?: string
  captionClassName?: string
}

type CaptionProps = { n: number; title: string; meta?: ReactNode; hint?: string; className?: string }

/** Gallery caption: plate number, name, the mathematics, and how to interact. */
export function FigureCaption({ n, title, meta, hint, className }: CaptionProps) {
  return (
    <figcaption className={cn('flex flex-col gap-1', className)}>
      <span className="label">
        <span className="text-ink-faint/70">Fig. {n}</span>
        <span aria-hidden="true" className="mx-2 inline-block h-px w-4 translate-y-[-3px] bg-border" />
        <span className="text-ink-muted">{title}</span>
      </span>
      {meta && <span className="font-mono text-[0.6875rem] leading-relaxed text-ink-faint">{meta}</span>}
      {hint && (
        <span aria-hidden="true" className="hidden font-mono text-[0.6875rem] text-ink-faint/70 [@media(hover:hover)]:inline">
          {hint}
        </span>
      )}
    </figcaption>
  )
}

/**
 * A plate in the site's collection: the live figure plus a gallery caption.
 * The canvas is decorative and hidden from assistive tech; the caption is
 * real text and is what a screen reader hears.
 */
export function Figure<P>({ n, title, meta, hint, load, props, interaction, className, stageClassName, captionClassName }: FigureProps<P>) {
  return (
    <figure className={cn('relative', className)}>
      <div aria-hidden="true" className={cn('relative', stageClassName)}>
        <div className="art-halo pointer-events-none absolute inset-0" />
        <ArtCanvas load={load} props={props} interaction={interaction} className="relative" />
      </div>
      <FigureCaption n={n} title={title} meta={meta} hint={hint} className={cn('mt-3', captionClassName)} />
    </figure>
  )
}
