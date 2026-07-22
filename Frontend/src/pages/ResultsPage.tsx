import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw} from 'lucide-react'
import { Logo } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { useSimulation } from '../state/SimulationContext'
import { EASE } from '../lib/motion'
import { formatCompact } from '../lib/cn'
import { DIMENSIONS } from '../config/site'
import ForecastSpread from '../components/resultspage/ForecastSpread'
import MeaningSpread from '../components/resultspage/MeaningSpread'

type Tab = 'forecast' | 'meaning'

function TabSwitch({tab, setTab, layoutKey, full}: {
  tab: Tab
  setTab: (t: Tab) => void
  layoutKey: string
  full?: boolean
}) {
  return (
    <div className={`${full ? 'flex w-full' : 'inline-flex'} rounded-full border border-line bg-white p-1 shadow-soft`}>
      {(
        [
          { id: 'forecast', label: 'The forecast' },
          { id: 'meaning', label: 'What it means' },
        ] as { id: Tab; label: string }[]
      ).map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${full ? 'flex-1' : ''} ${active ? 'text-white' : 'text-muted hover:text-ink'}`}
          >
            {active && (
              <motion.span
                layoutId={`results-tab-${layoutKey}`}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-brand-600"
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function Ticker({ items }: { items: string[] }) {
  const row = items.map((t, i) => (
    <span key={i} className="mx-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/70">
      <span className="text-brand-600">▲</span>
      {t}
    </span>
  ))
  return (
    <div className="overflow-hidden border-y border-ink/15 py-2">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>{row}</div>
      </motion.div>
    </div>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { result, reset, inputs } = useSimulation()
  const [tab, setTab] = useState<Tab>('forecast')

  // no result (e.g. direct navigation) -> back to the form
  useEffect(() => {
    if (!result) navigate('/get-started', { replace: true })
  }, [result, navigate])
  if (!result) return null

  const { analysis, output, creator, suggestions, verdict } = result
  const viralPct = Math.round(output.viral_probability * 100)
  const handle = inputs.handle.trim() || creator.handle
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const ranked = [...DIMENSIONS].sort((a, b) => (analysis.dims[b] ?? 0) - (analysis.dims[a] ?? 0))
  const tickerItems = [
    `Reach ${formatCompact(output.expected_reach)}`,
    `Viral ${viralPct}%`,
    `Confidence ${Math.round(output.confidence * 100)}%`,
    `Share ${analysis.composites.shareability.toFixed(1)}`,
    `Save ${analysis.composites.saveability.toFixed(1)}`,
    ...ranked.slice(0, 3).map((d) => `${d.replace(/_/g, ' ')} ${(analysis.dims[d] ?? 0).toFixed(1)}`),
    `Trust ${creator.trust}`,
    `Momentum ${creator.momentum}`,
  ]

  const runAnother = () => {
    reset()
    navigate('/get-started', { replace: true })
  }

  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <TabSwitch tab={tab} setTab={setTab} layoutKey="desktop" />
            </div>
            <Button size="sm" onClick={runAnother}>
              <RefreshCw className="h-3.5 w-3.5" /> Run it again
            </Button>
          </div>
        </div>
        <div className="mt-4 sm:hidden">
          <TabSwitch tab={tab} setTab={setTab} layoutKey="mobile" full />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-6 border-t-4 border-ink pt-3"
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Vol. 001 · Forecast edition</p>
            <h2 className="font-serif text-2xl font-black uppercase tracking-[0.08em] text-ink sm:text-3xl">
              The Reech Report
            </h2>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-muted sm:block">{today}</p>
          </div>
        </motion.div>

        <div className="mt-3">
          <Ticker items={tickerItems} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {tab === 'forecast' ? (
              <ForecastSpread
                analysis={analysis}
                output={output}
                creator={creator}
                suggestions={suggestions}
                viralPct={viralPct}
                verdict={verdict}
                handle={handle}
              />
            ) : (
              <MeaningSpread />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex flex-col items-center gap-4 border-t-2 border-ink/70 pt-6 sm:flex-row sm:justify-between">
          <p className="text-[12px] text-muted">
            A forecast, not a promise — the feed always keeps a little mystery.
          </p>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={runAnother}>
              <RefreshCw className="h-3.5 w-3.5" /> Tweak it & run again
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Back home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}




