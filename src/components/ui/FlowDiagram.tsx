import { Fragment, useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type FlowStage = {
  label: string
  detail: string
}

type FlowDiagramProps = {
  stages: FlowStage[]
  className?: string
  interactive?: boolean
}

function Arrow() {
  return (
    <div className="flex shrink-0 items-center justify-center px-1 text-ink-faint sm:px-2" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 20 20" className="rotate-90 sm:rotate-0">
        <path
          d="M2 10h14M11 5l5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function FlowDiagram({ stages, className, interactive = true }: FlowDiagramProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const baseId = useId()

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0', className)}>
      {stages.map((stage, i) => {
        const isOpen = openIndex === i
        const panelId = `${baseId}-panel-${i}`
        return (
          <Fragment key={stage.label}>
            <div className="flex flex-1 flex-col">
              {interactive ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 sm:text-center',
                    isOpen
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border bg-surface text-ink hover:border-accent/40',
                  )}
                >
                  <span className="mr-2 text-xs text-ink-faint sm:mr-0 sm:mb-1 sm:block">{`0${i + 1}`}</span>
                  {stage.label}
                </button>
              ) : (
                <div className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-semibold text-ink sm:text-center">
                  <span className="mr-2 text-xs text-ink-faint sm:mr-0 sm:mb-1 sm:block">{`0${i + 1}`}</span>
                  {stage.label}
                </div>
              )}
              {interactive && (
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-center">{stage.detail}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
            {i < stages.length - 1 && <Arrow />}
          </Fragment>
        )
      })}
    </div>
  )
}
