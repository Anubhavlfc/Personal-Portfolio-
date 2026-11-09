import { useMemo } from 'react'
import { projects } from '@/content/projects'
import type { ConstellationProps } from '@/lib/art/scenes/constellation'
import { ArtCanvas } from './ArtCanvas'
import { Figure, FigureCaption } from './Figure'

/**
 * The collection. Each plate pairs a lazily loaded scene with its caption;
 * sections import a plate rather than wiring scenes themselves. Captions
 * state only the mathematics — nothing here makes a claim about the work.
 *
 *   Fig. 1  Tesseract         projects
 *   Fig. 2  Möbius strip      experience
 *   Fig. 3  Lorenz attractor  case study
 *   Fig. 4  Constellation     capabilities
 *   Fig. 5  Torus knot        about
 *   Fig. 6  Particle field    contact
 *
 * The hero's geodesic sphere is the uncaptioned frontispiece.
 */

const stage = 'aspect-square w-full'
const caption = 'hidden lg:flex'

// Module-level so each loader keeps a stable identity across renders.
const loadTesseract = () => import('@/lib/art/scenes/tesseract')
const loadMobius = () => import('@/lib/art/scenes/mobius')
const loadLorenz = () => import('@/lib/art/scenes/lorenz')
const loadConstellation = () => import('@/lib/art/scenes/constellation')
const loadTorusKnot = () => import('@/lib/art/scenes/torusKnot')
const loadParticles = () => import('@/lib/art/scenes/particleField')

export function TesseractPlate() {
  return (
    <Figure
      n={1}
      title="Tesseract"
      meta="{±1}⁴ · 16 vertices · 32 edges, turning a quarter at a time through four dimensions"
      hint="Hover to hold · click to change projection · drag to turn"
      load={loadTesseract}
      stageClassName={stage}
      captionClassName={caption}
    />
  )
}

export function MobiusPlate() {
  return (
    <Figure
      n={2}
      title="Möbius strip"
      meta="P(u + 2π, v) = P(u, −v) · one surface, one edge — the light needs two laps to come home"
      hint="Hover to warm the band · click to send a wave · drag to turn"
      load={loadMobius}
      stageClassName={stage}
      captionClassName={caption}
    />
  )
}

export function LorenzPlate() {
  return (
    <Figure
      n={3}
      title="Lorenz attractor"
      meta="σ = 10 · ρ = 28 · β = 8⁄3 · RK4 · two trajectories that start 10⁻⁵ apart"
      hint="Click to release another 10⁻⁵ away · drag to turn"
      load={loadLorenz}
      stageClassName={stage}
      captionClassName={caption}
    />
  )
}

type ConstellationPlateProps = Omit<ConstellationProps, 'onOpen'>

export function ConstellationPlate({ active, onHover, onSelect }: ConstellationPlateProps) {
  const props = useMemo<ConstellationProps>(
    () => ({
      active,
      onHover,
      onSelect,
      // Rings are the places skills came from — open the part of the page about them.
      onOpen: (node) => {
        const project = node.kind === 'project' ? projects.find((p) => p.title === node.label) : undefined
        const target = project
          ? document.getElementById(`${project.id}-title`)
          : document.getElementById(node.kind === 'experience' ? 'experience' : 'about')
        target?.scrollIntoView({ block: project ? 'center' : 'start' })
      },
    }),
    [active, onHover, onSelect],
  )
  return (
    <Figure
      n={4}
      title="Constellation"
      meta="Every skill on this page linked to where it was used — drawn live from the site’s own content"
      hint="Hover a point · click a ring to jump there · drag to turn"
      load={loadConstellation}
      props={props}
      stageClassName={stage}
      captionClassName={caption}
    />
  )
}

export function TorusKnotPlate() {
  return (
    <Figure
      n={5}
      title="Torus knot"
      meta="(2, 5), the cinquefoil — twice around the axis, five times through the hole, one unbroken line"
      hint="Hover to set it moving · click to pluck · drag to turn"
      load={loadTorusKnot}
      stageClassName={stage}
      captionClassName={caption}
    />
  )
}

/** Full-bleed background for the closing section, plus its caption. */
export function ParticleFieldPlate() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(140%_110%_at_50%_100%,#000_34%,transparent_84%)]"
      >
        <ArtCanvas load={loadParticles} interaction="section" />
      </div>
      <figure className="pointer-events-none absolute bottom-6 right-8 z-10 hidden lg:block">
        <FigureCaption n={6} title="Particle field" meta="Motes on a slow sine flow field" className="items-end text-right" />
      </figure>
    </>
  )
}
