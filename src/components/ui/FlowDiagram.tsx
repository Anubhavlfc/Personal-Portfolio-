import { Fragment, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type FlowStage = {
  label: string
  detail: string
}

type FlowDiagramProps = {
  stages: FlowStage[]
  className?: string
}

function Arrow() {
  return (
    <div className="flex shrink-0 items-center justify-center px-1 text-ink-faint xl:px-1.5" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 20 20" className="rotate-90 xl:rotate-0">
        <path
          d="M3 10h13M11 5l5 5-5 5"
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

export function FlowDiagram({ stages, className }: FlowDiagramProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const panelId = `${useId()}-panel`
  const open = openIndex === null ? null : stages[openIndex]

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 xl:flex-row xl:items-stretch xl:gap-0">
        {stages.map((stage, i) => {
          const isOpen = openIndex === i
          return (
            <Fragment key={stage.label}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 xl:flex-col xl:items-center xl:gap-1 xl:px-2 xl:text-center xl:text-xs',
                  isOpen
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border bg-surface text-ink hover:border-accent/40',
                )}
              >
                <span className="text-xs tabular-nums text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 text-balance break-words">{stage.label}</span>
              </button>
              {i < stages.length - 1 && <Arrow />}
            </Fragment>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="mt-4 border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink-muted">
              <span className="font-medium text-ink">{open.label} — </span>
              {open.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
