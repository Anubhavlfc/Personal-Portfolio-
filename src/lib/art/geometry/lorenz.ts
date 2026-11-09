/**
 * The Lorenz system, integrated with classical fourth-order Runge–Kutta.
 *
 *   dx/dt = σ(y − x)    dy/dt = x(ρ − z) − y    dz/dt = xy − βz
 *
 * With Lorenz's own parameters (σ = 10, ρ = 28, β = 8/3) every trajectory is
 * drawn onto the two-lobed attractor, and any two that start apart — however
 * slightly — eventually separate completely.
 */
export const SIGMA = 10
export const RHO = 28
export const BETA = 8 / 3

/** The two non-trivial equilibria the lobes wind around: (±√(β(ρ−1)), ±√(β(ρ−1)), ρ−1). */
export const FIXED_POINTS: ReadonlyArray<readonly [number, number, number]> = (() => {
  const c = Math.sqrt(BETA * (RHO - 1))
  return [
    [c, c, RHO - 1],
    [-c, -c, RHO - 1],
  ] as const
})()

function deriv(x: number, y: number, z: number, out: Float64Array, o: number) {
  out[o] = SIGMA * (y - x)
  out[o + 1] = x * (RHO - z) - y
  out[o + 2] = x * y - BETA * z
}

const k = new Float64Array(12)

/** Advance state (x, y, z) in place by one RK4 step of size h. */
export function lorenzStep(s: Float64Array, h: number) {
  const x = s[0], y = s[1], z = s[2]
  deriv(x, y, z, k, 0)
  deriv(x + (h / 2) * k[0], y + (h / 2) * k[1], z + (h / 2) * k[2], k, 3)
  deriv(x + (h / 2) * k[3], y + (h / 2) * k[4], z + (h / 2) * k[5], k, 6)
  deriv(x + h * k[6], y + h * k[7], z + h * k[8], k, 9)
  s[0] = x + (h / 6) * (k[0] + 2 * k[3] + 2 * k[6] + k[9])
  s[1] = y + (h / 6) * (k[1] + 2 * k[4] + 2 * k[7] + k[10])
  s[2] = z + (h / 6) * (k[2] + 2 * k[5] + 2 * k[8] + k[11])
}

/**
 * Lorenz coordinates → the figure's unit frame: z (the attractor's vertical)
 * becomes screen-up, centred on the equilibria's height.
 */
export const LORENZ_SCALE = 1 / 31
export function toFigure(x: number, y: number, z: number, out: Float32Array, o: number) {
  out[o] = x * LORENZ_SCALE
  out[o + 1] = (z - (RHO - 1)) * LORENZ_SCALE
  out[o + 2] = y * LORENZ_SCALE
}
