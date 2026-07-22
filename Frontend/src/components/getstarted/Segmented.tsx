import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { EASE } from '../../lib/motion'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

export function Segmented<T extends string>({options,value,onChange,ariaLabel,}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full gap-1 border border-line bg-neutral-100 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm',
              'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
              active ? 'text-brand-700' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${ariaLabel ?? 'default'}`}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                className="absolute inset-0 bg-white shadow-sm ring-1 ring-black/4"
              />
            )}
            <motion.span
              initial={false}
              animate={{ scale: active ? 1 : 0.98 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="relative z-10 flex items-center gap-2"
            >
              {opt.icon}
              {opt.label}
            </motion.span>
          </button>
        )
      })}
    </div>
  )
}
