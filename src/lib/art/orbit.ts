import { clamp, damp } from './core'
import type { Input } from './scene'

/**
 * Orientation for a figure: idle drift + pointer tilt + drag with momentum.
 * The same parts in every figure; the tuning is what gives each one its
 * temperament — a springy follow reads as fluid, a stiff one as precise.
 */
export type OrbitTuning = {
  idleYaw: number // rad/s of continuous turn
  basePitch: number
  wobble: number // amplitude of the slow pitch sway
  tiltYaw: number // how far the pointer can turn it
  tiltPitch: number
  /** Exponential follow rate, or a spring when `spring` is set. */
  follow: number
  spring?: { stiffness: number; damping: number }
  dragGain: number // radians per px, multiplied by 1/size
  coast: number // decay rate of a flung spin
}

export class Orbit {
  yaw: number
  pitch: number
  private idle = 0
  private tiltY = 0
  private tiltP = 0
  private velTY = 0
  private velTP = 0
  private dragYaw = 0
  private dragPitch = 0
  private flingY = 0
  private flingP = 0
  private time = 0
  private readonly t: OrbitTuning

  constructor(tuning: OrbitTuning, startYaw = 0) {
    this.t = tuning
    this.idle = startYaw
    this.yaw = startYaw
    this.pitch = tuning.basePitch
  }

  update(dt: number, input: Input, size: number) {
    const t = this.t
    this.time += dt
    this.idle += t.idleYaw * dt

    const targetY = input.nx * t.tiltYaw
    const targetP = input.ny * t.tiltPitch
    if (t.spring) {
      // Under-damped: overshoots a touch and settles, like something suspended.
      const { stiffness: k, damping: c } = t.spring
      this.velTY += ((targetY - this.tiltY) * k - this.velTY * c) * dt
      this.velTP += ((targetP - this.tiltP) * k - this.velTP * c) * dt
      this.tiltY += this.velTY * dt
      this.tiltP += this.velTP * dt
    } else {
      this.tiltY = damp(this.tiltY, targetY, input.over ? t.follow * 2 : t.follow, dt)
      this.tiltP = damp(this.tiltP, targetP, input.over ? t.follow * 2 : t.follow, dt)
    }

    const gain = t.dragGain / Math.max(80, size)
    if (input.dragging && dt > 0) {
      const dy = input.dx * gain
      const dp = input.dy * gain
      this.dragYaw += dy
      this.dragPitch = clamp(this.dragPitch + dp, -1.2, 1.2)
      this.flingY = this.flingY * 0.4 + (dy / dt) * 0.6
      this.flingP = this.flingP * 0.4 + (dp / dt) * 0.6
    } else {
      this.flingY = clamp(this.flingY, -4, 4)
      this.flingP = clamp(this.flingP, -3, 3)
      this.dragYaw += this.flingY * dt
      this.dragPitch += this.flingP * dt
      this.flingY = damp(this.flingY, 0, t.coast, dt)
      this.flingP = damp(this.flingP, 0, t.coast * 1.4, dt)
      this.dragPitch = damp(this.dragPitch, 0, 0.6, dt)
    }

    this.yaw = this.idle + this.tiltY + this.dragYaw
    this.pitch = t.basePitch + t.wobble * Math.sin(this.time * 0.21) + this.tiltP + this.dragPitch
  }
}
