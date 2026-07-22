import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Video, Image as ImageIcon, Type, ScanLine, Check, type LucideIcon } from 'lucide-react'
import { useSimulation } from '../../state/SimulationContext'
import { EASE } from '../../lib/motion'

type Stage = 'scan' | 'organize' | 'relate' | 'hold' | 'absorb' | 'done'

const T_ORGANIZE = 3800
const T_RELATE = 5300
const T_HOLD = 8000
const OUTRO_DONE = 900 
const OUTRO_COMPLETE = 2300 

type Cat = 'Scene' | 'Objects' | 'Visual' | 'Activity'

const CAT_STYLE: Record<Cat, { chip: string; panel: string; label: string }> = {
  Scene: { chip: 'bg-sky-50 text-sky-700 border-sky-200', panel: 'border-sky-200/70 bg-sky-50/40', label: 'text-sky-700' },
  Objects: { chip: 'bg-brand-50 text-brand-700 border-brand-200', panel: 'border-brand-200/70 bg-brand-50/40', label: 'text-brand-700' },
  Visual: { chip: 'bg-amber-50 text-amber-700 border-amber-200', panel: 'border-amber-200/70 bg-amber-50/40', label: 'text-amber-700' },
  Activity: { chip: 'bg-teal-50 text-teal-700 border-teal-200', panel: 'border-teal-200/70 bg-teal-50/40', label: 'text-teal-700' },
}

const RAW: { label: string; cat: Cat }[] = [
  { label: 'Outdoor', cat: 'Scene' }, { label: 'City', cat: 'Scene' }, { label: 'Landscape', cat: 'Scene' },
  { label: 'Camera', cat: 'Objects' }, { label: 'Stage', cat: 'Objects' }, { label: 'Phone', cat: 'Objects' },
  { label: 'Warm Colors', cat: 'Visual' }, { label: 'Cinematic', cat: 'Visual' }, { label: 'High Contrast', cat: 'Visual' },
  { label: 'Travel', cat: 'Activity' }, { label: 'Music', cat: 'Activity' }, { label: 'Lifestyle', cat: 'Activity' },
]

const RELATIONS: [string, string][] = [
  ['Outdoor', 'Travel'],
  ['Stage', 'Music'],
  ['Cinematic', 'Lifestyle'],
  ['City', 'Camera'],
]

function buildGeo(compact: boolean) {
  const W = compact ? 460 : 680
  const H = compact ? 430 : 480
  const CX = W / 2
  const CY = H / 2
  const RX = compact ? 175 : 252
  const RY = compact ? 152 : 186
  const clusterX = compact ? 140 : 207
  const clusterY = compact ? 112 : 122
  const slotGap = compact ? 24 : 26

  const clusters: Record<Cat, { x: number; y: number }> = {
    Scene: { x: -clusterX, y: -clusterY },
    Objects: { x: clusterX, y: -clusterY },
    Visual: { x: -clusterX, y: clusterY },
    Activity: { x: clusterX, y: clusterY },
  }

  const slotCount: Record<string, number> = {}
  const chips = RAW.map((c, i) => {
    const slot = (slotCount[c.cat] = (slotCount[c.cat] ?? -1) + 1)
    const ang = -Math.PI / 2 + (i / RAW.length) * Math.PI * 2
    const cl = clusters[c.cat]
    return {
      ...c,
      i,
      sx: Math.cos(ang) * RX,
      sy: Math.sin(ang) * RY,
      ox: cl.x,
      oy: cl.y - 6 + slot * slotGap,
    }
  })
  const chipBy = Object.fromEntries(chips.map((c) => [c.label, c]))

  const arc = (a: { ox: number; oy: number }, b: { ox: number; oy: number }) => {
    const x1 = CX + a.ox, y1 = CY + a.oy, x2 = CX + b.ox, y2 = CY + b.oy
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    const dx = mx - CX, dy = my - CY
    const len = Math.hypot(dx, dy) || 1
    const cx = mx + (dx / len) * (compact ? 42 : 60), cy = my + (dy / len) * (compact ? 42 : 60)
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
  }

  return { W, H, clusters, chips, chipBy, arc, panelW: compact ? 'w-36' : 'w-40' }
}

const MESSAGES = [
  'Analyzing visual composition…',
  'Detecting objects…',
  'Understanding the scene…',
  'Extracting semantic context…',
  'Organizing metadata…',
  'Linking related concepts…',
  'Deep-reading the details…',
  'Cross-checking topics & entities…',
  'Almost there…',
]
const HOLD_LOOP = 3

export function VisionScan({ waiting = false, onComplete }: { waiting?: boolean; onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>('scan')
  const [msg, setMsg] = useState(0)
  const [holdReached, setHoldReached] = useState(false)
  const outroStarted = useRef(false)
  const [winW, setWinW] = useState(typeof window === 'undefined' ? 1024 : window.innerWidth)
  useEffect(() => {
    const upd = () => setWinW(window.innerWidth)
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])
  const compact = winW < 640
  const geo = useMemo(() => buildGeo(compact), [compact])
  const scale = Math.min(1, (winW - 32) / geo.W)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setStage('organize'), T_ORGANIZE))
    timers.push(setTimeout(() => setStage('relate'), T_RELATE))
    timers.push(
      setTimeout(() => {
        setStage('hold')
        setHoldReached(true)
      }, T_HOLD),
    )

    const introMsgs = MESSAGES.length - HOLD_LOOP
    const step = T_HOLD / introMsgs
    for (let i = 0; i < introMsgs; i++) timers.push(setTimeout(() => setMsg(i), 300 + i * step))

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (stage !== 'hold' || !waiting) return
    const first = MESSAGES.length - HOLD_LOOP
    const iv = setInterval(
      () => setMsg((m) => (m + 1 >= MESSAGES.length ? first : Math.max(first, m + 1))),
      2400,
    )
    return () => clearInterval(iv)
  }, [stage, waiting])

  useEffect(() => {
    if (outroStarted.current || waiting || !holdReached) return
    outroStarted.current = true
    setStage('absorb')
    const t1 = setTimeout(() => setStage('done'), OUTRO_DONE)
    const t2 = setTimeout(onComplete, OUTRO_COMPLETE)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [waiting, holdReached, onComplete])

  const settled = stage === 'organize' || stage === 'relate' || stage === 'hold'
  const leaving = stage === 'absorb' || stage === 'done'

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto overflow-visible" style={{ width: geo.W * scale, height: geo.H * scale }}>
        <div className="relative origin-top-left" style={{ width: geo.W, height: geo.H, transform: `scale(${scale})` }}>
        <svg viewBox={`0 0 ${geo.W} ${geo.H}`} className="absolute inset-0 h-full w-full">
          {RELATIONS.map(([a, b], i) => (
            <motion.path
              key={`${a}-${b}`}
              d={geo.arc(geo.chipBy[a], geo.chipBy[b])}
              fill="none"
              stroke="#0d9488"
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                stage === 'relate' || stage === 'hold'
                  ? { pathLength: 1, opacity: 0.55 }
                  : leaving
                    ? { pathLength: 1, opacity: 0 }
                    : { pathLength: 0, opacity: 0 }
              }
              transition={
                stage === 'relate'
                  ? { duration: 1.1, delay: i * 0.28, ease: EASE }
                  : { duration: 0.4 }
              }
            />
          ))}
        </svg>

        <div className="absolute inset-0 grid place-items-center">
          {(Object.keys(geo.clusters) as Cat[]).map((cat, i) => {
            const cl = geo.clusters[cat]
            const s = CAT_STYLE[cat]
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={
                  settled
                    ? { opacity: 1, scale: 1, x: cl.x, y: cl.y + 18 }
                    : leaving
                      ? { opacity: 0, scale: 0.5, x: cl.x * 0.2, y: (cl.y + 18) * 0.2 }
                      : { opacity: 0, scale: 0.85, x: cl.x, y: cl.y + 18 }
                }
                transition={{ duration: 0.55, delay: settled ? 0.15 + i * 0.06 : i * 0.03, ease: EASE }}
                className={`[grid-area:1/1] h-29.5 ${geo.panelW} rounded-2xl border ${s.panel}`}
              >
                <p className={`pt-2 text-center text-[10px] font-bold uppercase tracking-wider ${s.label}`}>{cat}</p>
              </motion.div>
            )
          })}

          <MediaCard stage={stage} compact={compact} />

          {geo.chips.map((c) => {
            const s = CAT_STYLE[c.cat]
            const target =
              stage === 'scan'
                ? { x: c.sx, y: c.sy, scale: 1, opacity: 1 }
                : settled
                  ? { x: c.ox, y: c.oy, scale: 1, opacity: 1 }
                  : { x: 0, y: 0, scale: 0.25, opacity: 0 }
            const transition =
              stage === 'scan'
                ? { type: 'tween' as const, duration: 0.55, ease: 'easeOut' as const, delay: 0.5 + c.i * 0.22 }
                : settled
                  ? { duration: 0.75, delay: c.i * 0.035, ease: EASE }
                  : { duration: 0.5, delay: c.i * 0.02, ease: 'easeIn' as const }
            return (
              <motion.span
                key={c.label}
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                animate={target}
                transition={transition}
                className={`[grid-area:1/1] z-10 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-soft ${s.chip}`}
              >
                {c.label}
              </motion.span>
            )
          })}
        </div>
        </div>
      </div>

      <div className="mt-2 flex h-6 items-center gap-2">
        <motion.span
          className="h-2 w-2 rounded-full bg-cyan-500"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-muted"
          >
            {MESSAGES[msg]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

const MODALITY_META: Record<string, { icon: LucideIcon; label: string }> = {
  video: { icon: Video, label: 'Video' },
  image: { icon: ImageIcon, label: 'Image' },
  text: { icon: Type, label: 'Text post' },
}

function MediaCard({ stage, compact }: { stage: Stage; compact?: boolean }) {
  const { inputs } = useSimulation()
  const meta = MODALITY_META[inputs.modality] ?? MODALITY_META.video
  const Icon = meta.icon
  const title =
    inputs.modality === 'text'
      ? inputs.description.trim().slice(0, 60) || 'Your text post'
      : inputs.fileName || `Your ${inputs.modality}`
  const done = stage === 'done'
  const absorbing = stage === 'absorb' || done

  return (
    <motion.div
      className={`[grid-area:1/1] relative overflow-hidden rounded-2xl border border-line bg-white shadow-lift ${compact ? 'h-36 w-56' : 'h-44 w-72'}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{
        opacity: 1,
        scale: done ? [1, 1.05, 1] : 1,
        boxShadow: done
          ? '0px 20px 60px -20px rgba(5,150,105,0.45)'
          : '0px 12px 40px rgba(16,24,40,0.12)',
      }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {['left-3 top-3 border-l-2 border-t-2', 'right-3 top-3 border-r-2 border-t-2',
        'left-3 bottom-3 border-l-2 border-b-2', 'right-3 bottom-3 border-r-2 border-b-2'].map((c) => (
        <span
          key={c}
          className={`absolute h-5 w-5 rounded-[3px] transition-colors duration-500 ${done ? 'border-brand-500/70' : 'border-cyan-500/60'} ${c}`}
        />
      ))}

      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <span
          className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors duration-500 ${done ? 'bg-brand-600 text-white' : 'bg-cyan-50 text-cyan-600'}`}
        >
          {done ? <Check className="h-7 w-7" /> : <Icon className="h-7 w-7" />}
        </span>
        <div className="min-w-0">
          <p className="max-w-52 truncate text-sm font-bold text-ink">{title}</p>
          <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-muted">
            {done ? (
              <span className="font-semibold text-brand-700">Understood</span>
            ) : (
              <>
                <ScanLine className="h-3 w-3" /> {meta.label} · scanning
              </>
            )}
          </p>
        </div>
      </div>

      <motion.div animate={{ opacity: absorbing ? 0 : 1 }} transition={{ duration: 0.4 }}>
        <motion.div
          className="absolute inset-x-0 h-16 bg-linear-to-b from-cyan-400/0 via-cyan-400/25 to-cyan-400/0 blur-md"
          initial={{ top: '-25%' }}
          animate={{ top: '110%' }}
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-x-0 h-px bg-cyan-300 shadow-[0_0_16px_3px_rgba(34,211,238,0.7)]"
          initial={{ top: '-25%' }}
          animate={{ top: '110%' }}
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  )
}
