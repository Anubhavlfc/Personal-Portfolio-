import { motion, useReducedMotion } from 'framer-motion'

const gridLines = {
  horizontal: [60, 140, 220, 300, 380],
  vertical: [80, 200, 320, 440, 560],
}

const trendPath = 'M20,340 L100,300 L180,320 L260,220 L340,250 L420,120 L500,160 L580,60'
const markers = [
  { x: 260, y: 220 },
  { x: 420, y: 120 },
  { x: 580, y: 60 },
]

export function FinancialGrid({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <svg
      viewBox="0 0 620 400"
      className={className}
      role="img"
      aria-label="Abstract rising financial trend line over a faint chart grid"
    >
      <g stroke="var(--color-border)" strokeWidth="1">
        {gridLines.horizontal.map((y) => (
          <line key={y} x1="0" y1={y} x2="620" y2={y} />
        ))}
        {gridLines.vertical.map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="400" />
        ))}
      </g>

      <motion.path
        d={trendPath}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={shouldReduceMotion ? undefined : { animation: 'drift 14s ease-in-out infinite' }}
      />

      {markers.map((m, i) => (
        <motion.circle
          key={`${m.x}-${m.y}`}
          cx={m.x}
          cy={m.y}
          r="4"
          fill="var(--color-accent)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.6 + i * 0.15 }}
        />
      ))}
    </svg>
  )
}
