import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Radio, Quote } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { Badge } from '../components/ui/Badge'
import { VisionScan } from '../components/processing/VisionScan'
import { SimulationNetwork } from '../components/processing/SimulationNetwork'
import { pickAction, type Reaction } from '../components/processing/reactions'
import { useSimulation } from '../state/SimulationContext'
import { mockSimOutput, MOCK_PERSONAS } from '../config/site'
import { EASE } from '../lib/motion'
import { QUOTES } from '../config/site'

const WAVES = 6
const WAVE_MS = 1100
const SETTLE_MS = 1300
const SIM_TOTAL = 10_000
const HOVER_AT = 9_935 

// concentric rings radiating outwards from centre (L3)
function SonarBackdrop({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2">
        {/* static rings */}
        {[320, 480, 640, 800, 960].map((d) => (
          <div
            key={d}
            className="absolute rounded-full border border-brand-600/6"
            style={{ width: d, height: d, left: -d / 2, top: -d / 2 }}
          />
        ))}
        {[0, 2.6].map((delay) => (
          <motion.div
            key={delay}
            className="absolute rounded-full border-2 border-brand-500/25"
            style={{ width: 240, height: 240, left: -120, top: -120 }}
            animate={{ scale: [0.8, 4.6], opacity: [0.5, 0] }}
            transition={{ duration: 5.2, ease: 'easeOut', repeat: Infinity, delay }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Patience quotes 
const QUOTE_MS = 5000
function QuoteTicker() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), QUOTE_MS)
    return () => clearInterval(iv)
  }, [])
  const q = QUOTES[idx]

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-10 md:inset-x-auto md:bottom-8 md:right-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 72, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 32, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white/95 py-3 pl-3 pr-5 shadow-lift backdrop-blur"
        >
          <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Quote className="h-4 w-4" />
          </span>
          <p className="text-[15px] font-semibold tracking-tight text-ink">
            {q.text.split(' ').map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + i * 0.09, ease: EASE }}
                className={`inline-block ${w === q.accent ? 'text-brand-600' : ''}`}
              >
                {w}
                {' '}
              </motion.span>
            ))}
          </p>
          <motion.span
            className="absolute bottom-0 left-12 right-5 h-0.5 origin-left rounded-full bg-brand-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: QUOTE_MS / 1000, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function ProcessingPage() {
  const navigate = useNavigate()
  const { startPipeline, status } = useSimulation()
  const [phase, setPhase] = useState<'studying' | 'simulating'>('studying')
  const [wave, setWave] = useState(0)
  const [runCount, setRunCount] = useState(0)
  const [reactions, setReactions] = useState<Reaction[]>([])
  const reactionId = useRef(0)
  const statusRef = useRef(status)
  useEffect(() => {
    statusRef.current = status
  }, [status])

  const reachedByWave = useMemo(() => {
    const slice = mockSimOutput.mean_wave.slice(0, WAVES)
    const total = slice.reduce((a, b) => a + b, 0) || 1
    const out = [0]
    let acc = 0
    for (let w = 0; w < WAVES; w++) {
      acc += slice[w]
      out.push(Math.round((mockSimOutput.expected_reach * acc) / total))
    }
    return out
  }, [])

  // Calls Backend
  useEffect(() => {
    void startPipeline()
  }, [startPipeline])

  // pipeline failed -> the toast shows what went wrong; bounce back to the form
  useEffect(() => {
    if (status === 'error') navigate('/get-started', { replace: true })
  }, [status, navigate])

  const handleStudyComplete = useCallback(() => setPhase('simulating'), [])

  useEffect(() => {
    if (phase !== 'simulating') return
    const timers: ReturnType<typeof setTimeout>[] = []

    for (let w = 1; w <= WAVES; w++) {
      timers.push(setTimeout(() => setWave(w), w * WAVE_MS))
    }

    const runIv = setInterval(() => {
      setRunCount((c) => {
        const target = statusRef.current === 'done' ? SIM_TOTAL : HOVER_AT
        if (c >= target) return c
        return Math.min(target, c + Math.max(9, Math.round((target - c) * 0.05)))
      })
    }, 50)

    const reactIv = setInterval(() => {
      const persona = MOCK_PERSONAS[Math.floor(Math.random() * MOCK_PERSONAS.length)]
      const id = reactionId.current++
      setReactions((prev) => [...prev, { id, persona, action: pickAction() }].slice(-4))
    }, 300)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(runIv)
      clearInterval(reactIv)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'simulating' || status !== 'done' || runCount < SIM_TOTAL || wave < WAVES) return
    const t = setTimeout(() => navigate('/results', { replace: true }), SETTLE_MS)
    return () => clearTimeout(t)
  }, [phase, status, runCount, wave, navigate])

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <SonarBackdrop active={phase === 'studying'} />
      <QuoteTicker />

      <div className="relative">
        <Container className="flex min-h-screen flex-col items-center justify-center py-10">
          <AnimatePresence mode="wait">
            {phase === 'studying' ? (
              <motion.div
                key="study"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-col items-center text-center"
              >
                <Badge icon={<Sparkles className="h-3.5 w-3.5 text-brand-600" />}>Vision scan</Badge>
                <h1 className="mt-4 mb-8 font-serif text-3xl font-black tracking-tight text-ink sm:text-4xl">
                  Understanding your content
                </h1>
                <VisionScan
                  waiting={status !== 'simulating' && status !== 'done'}
                  onComplete={handleStudyComplete}
                />
              </motion.div>
            ) : (
              <motion.div
                key="sim"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex w-full flex-col items-center text-center"
              >
                <Badge icon={<Radio className="h-3.5 w-3.5 text-brand-600" />}>Simulating spread</Badge>
                <h1 className="mt-4 font-serif text-3xl font-black tracking-tight text-ink sm:text-4xl">
                  Spreading across the crowd
                </h1>
                <p className="mt-2 mb-6 max-w-md text-muted">
                  Playing your post to 50,000 AI viewers, wave after wave.
                </p>

                <SimulationNetwork wave={wave} reached={reachedByWave[wave]} reactions={reactions} />

                <div className="mx-auto mt-6 w-full max-w-md">
                  <div className="flex items-center justify-between text-xs font-medium text-muted">
                    <span>Running simulations</span>
                    <span className="tabular-nums text-brand-700">
                      {runCount.toLocaleString()} / {SIM_TOTAL.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/6">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-600"
                      style={{ width: `${(runCount / SIM_TOTAL) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </div>
    </div>
  )
}
