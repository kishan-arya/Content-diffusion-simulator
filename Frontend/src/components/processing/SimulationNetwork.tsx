import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { formatCompact } from '../../lib/cn'
import type { Reaction } from './reactions'

const WAVES = 6
const PER_WAVE = [1, 5, 9, 13, 17, 21, 25]
const CX = 360
const CY = 230
const SQUASH = 0.8

interface GNode {
  id: number
  x: number
  y: number
  wave: number
  size: number
  delay: number
  parent: { x: number; y: number } | null
}

function buildGraph(): GNode[] {
  const nodes: GNode[] = []
  const byWave: GNode[][] = []
  let id = 0
  for (let w = 0; w <= WAVES; w++) {
    const count = PER_WAVE[w]
    const radius = w === 0 ? 0 : 28 + w * 31
    const ring: GNode[] = []
    for (let i = 0; i < count; i++) {
      const baseAngle = count === 1 ? 0 : (i / count) * Math.PI * 2 + w * 0.55
      const angle = baseAngle + (Math.random() - 0.5) * 0.28
      const r = radius + (w === 0 ? 0 : (Math.random() - 0.5) * 22)
      const x = CX + Math.cos(angle) * r
      const y = CY + Math.sin(angle) * r * SQUASH
      let parent: { x: number; y: number } | null = null
      if (w > 0) {
        const prev = byWave[w - 1]
        let best = prev[0]
        let bestD = Infinity
        for (const p of prev) {
          const pa = Math.atan2(p.y - CY, p.x - CX)
          let d = Math.abs(pa - angle)
          d = Math.min(d, Math.PI * 2 - d)
          if (d < bestD) {
            bestD = d
            best = p
          }
        }
        parent = { x: best.x, y: best.y }
      }
      const node: GNode = {
        id: id++,
        x,
        y,
        wave: w,
        size: w === 0 ? 10 : Math.max(2.6, 5 - w * 0.35) + Math.random() * 1.3,
        delay: Math.random() * 0.3,
        parent,
      }
      ring.push(node)
      nodes.push(node)
    }
    byWave[w] = ring
  }
  return nodes
}

export function SimulationNetwork({
  wave,
  reached,
  reactions,
}: {
  wave: number
  reached: number
  reactions: Reaction[]
}) {
  const nodes = useMemo(() => buildGraph(), [])
  const visible = nodes.filter((n) => n.wave <= wave)

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <svg viewBox="0 0 720 460" className="block w-full">
        {/* edges */}
        {visible.map((n) =>
          n.parent ? (
            <motion.line
              key={`e${n.id}`}
              x1={n.parent.x}
              y1={n.parent.y}
              x2={n.x}
              y2={n.y}
              stroke="#059669"
              strokeWidth={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 0.5, delay: n.delay }}
            />
          ) : null,
        )}

        {/* nodes */}
        {visible.map((n) => {
          const frontier = n.wave === wave
          const core = n.wave === 0 ? '#047857' : frontier ? '#059669' : '#34d399'
          return (
            <g key={n.id}>
              <motion.circle
                cx={n.x}
                cy={n.y}
                fill="#10b981"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: n.size * 2.6, opacity: frontier ? 0.32 : 0.14 }}
                transition={{ duration: 0.5, delay: n.delay }}
              />
              <motion.circle
                cx={n.x}
                cy={n.y}
                fill={core}
                initial={{ r: 0 }}
                animate={{ r: n.size }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: n.delay + 0.05 }}
              />
              {n.wave === 0 && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  animate={{ r: [10, 26], opacity: [0.6, 0] }}
                  transition={{ duration: 2.2, ease: 'easeOut', repeat: Infinity }}
                />
              )}
            </g>
          )
        })}
      </svg>

      <div className="absolute left-3 top-3 rounded-xl border border-line bg-white/80 px-3 py-2 shadow-soft backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Wave</p>
        <p className="text-xl font-extrabold tabular-nums leading-none text-ink">
          {wave}
          <span className="text-sm font-semibold text-muted">/{WAVES}</span>
        </p>
      </div>
      <div className="absolute right-3 top-3 rounded-xl border border-line bg-white/80 px-3 py-2 text-right shadow-soft backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Reached</p>
        <p className="text-xl font-extrabold tabular-nums leading-none text-brand-700">
          {formatCompact(reached)}
        </p>
      </div>

      <div className="absolute bottom-3 left-3 hidden w-56 flex-col gap-2 sm:flex">
        <AnimatePresence initial={false}>
          {reactions.map((r) => {
            const Icon = r.action.Icon
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: -14, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 rounded-full border border-line bg-white/90 py-1.5 pl-1.5 pr-3 shadow-soft backdrop-blur"
              >
                <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-100 text-[11px] font-bold uppercase text-brand-700">
                  {r.persona.replace('@', '').charAt(0)}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink">
                  <span className="font-semibold">{r.persona}</span>{' '}
                  <span className="text-muted">{r.action.verb}</span>
                </span>
                <Icon className={`h-3.5 w-3.5 flex-none ${r.action.color}`} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="relative mt-2 h-8 w-full sm:hidden">
        <AnimatePresence initial={false}>
          {reactions.length > 0 && (() => {
            const r = reactions[reactions.length - 1]
            const Icon = r.action.Icon
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute left-1/2 top-0 flex max-w-full -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white/90 py-1 pl-1 pr-2.5 shadow-soft backdrop-blur"
              >
                <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-100 text-[10px] font-bold uppercase text-brand-700">
                  {r.persona.replace('@', '').charAt(0)}
                </span>
                <span className="truncate text-[11px] text-ink">
                  <span className="font-semibold">{r.persona}</span>{' '}
                  <span className="text-muted">{r.action.verb}</span>
                </span>
                <Icon className={`h-3 w-3 flex-none ${r.action.color}`} />
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>
    </div>
  )
}
