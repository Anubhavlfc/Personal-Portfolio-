import type { Palette } from './core'

/** Pointer state the canvas shell maintains for its scene. Coordinates are CSS px. */
export type Input = {
  /** Pointer position local to the canvas. */
  x: number
  y: number
  /** A mouse is over the canvas. */
  over: boolean
  /** Mouse position across the whole window, −1…1 from centre (0 for touch). */
  nx: number
  ny: number
  dragging: boolean
  /** Drag movement since the previous frame. */
  dx: number
  dy: number
  /** One-shot: set on the frame a click or tap lands. */
  click: { x: number; y: number } | null
}

export type SceneEnv = {
  palette: Palette
  mono: string
  reduced: boolean
  /** Touch-first or small screen: use the lighter version of the piece. */
  coarse: boolean
}

export interface Scene<P = unknown> {
  resize(width: number, height: number): void
  /** Advance the simulation. Under reduced motion this is called once with dt = 0. */
  update(dt: number, input: Input): void
  draw(ctx: CanvasRenderingContext2D): void
  setProps?(props: P): void
  /** Called once if frames are consistently expensive — shed detail. */
  degrade?(): void
  dispose?(): void
  /** CSS cursor the shell applies to the canvas each frame. */
  cursor?: string
}

export type SceneFactory<P = unknown> = (env: SceneEnv) => Scene<P>
