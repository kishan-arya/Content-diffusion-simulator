import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'motion/react'
import { ArrowRight, ChevronDown, Check, Zap, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import { Button } from '../ui/Button'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { formatCompact } from '../../lib/cn'
import { POST_IMAGE, CONTENT_FEED, STORY_NICHES, TRENDING, mockSimOutput, mockSuggestions } from '../../config/site'

const ACTS = [
  { at: 0.27, word: 'Understand', desc: 'Reech reads what your post is really about — scoring it and naming the concepts inside.' },
  { at: 0.50, word: 'Simulate', desc: '50,000 viewers judge it — each audience reacts to the same post differently.' },
  { at: 0.72, word: 'Predict', desc: 'Your audience meets live trends, and thousands of runs forecast the reach.' },
  { at: 0.92, word: 'Recommend', desc: 'One honest number, and the single edit most likely to move it.' },
]

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    <section ref={ref} className="relative h-[640vh]">
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-canvas">
        <MarqueeFeed p={p} />
        <ChosenPost p={p} />
        <UnderstandLayer p={p} />
        <SimulateLayer p={p} />
        <PredictLayer p={p} />
        <RecommendLayer p={p} />
        <ActType p={p} />
        <HeroCopy p={p} />
      </div>
    </section>
  )
}

function MarqueeFeed({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0, 0.1, 0.17], [1, 1, 0])
  const scale = useTransform(p, [0, 0.17], [1, 1.12])
  const cols = [CONTENT_FEED.slice(0, 3), CONTENT_FEED.slice(3, 6), CONTENT_FEED.slice(6, 9), CONTENT_FEED.slice(9, 12)]
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0">
      <div className="flex h-[130%] translate-y-[-6%] gap-3 p-3">
        {cols.map((c, i) => <MarqueeCol key={i} imgs={c} dur={22 + i * 5} up={i % 2 === 0} hideMobile={i >= 2} />)}
      </div>
      <div className="absolute inset-0 [background:radial-gradient(ellipse_62%_55%_at_center,rgba(0,0,0,0.72),rgba(0,0,0,0.42))]" />
    </motion.div>
  )
}
function MarqueeCol({ imgs, dur, up, hideMobile }: { imgs: string[]; dur: number; up: boolean; hideMobile?: boolean }) {
  const loop = [...imgs, ...imgs]
  return (
    <div className={`h-full flex-1 overflow-hidden ${hideMobile ? 'max-sm:hidden' : ''}`}>
      <motion.div animate={{ y: up ? ['0%', '-50%'] : ['-50%', '0%'] }} transition={{ duration: dur, repeat: Infinity, ease: 'linear' }} className="flex flex-col gap-3">
        {loop.map((src, i) => (
          <div key={i} className="aspect-4/5 overflow-hidden rounded-2xl">
            <ImageWithFallback src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
function HeroCopy({ p }: { p: MotionValue<number> }) {
  const navigate = useNavigate()
  const opacity = useTransform(p, [0, 0.09], [1, 0])
  const y = useTransform(p, [0, 0.11], [0, -40])
  const hint = useTransform(p, [0, 0.03], [1, 0])
  return (
    <>
      <motion.div style={{ opacity, y }} className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">Reech</p>
        <h1 className="mt-4 max-w-4xl text-balance font-serif text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-7xl">
          Every post is a bet.<br />Stop guessing.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/90">
          Reech runs your content through its whole pipeline — audience, trends, and a real reach forecast — before you ever hit publish.
        </p>
        <div className="mt-8 text-shadow-none">
          <Button size="lg" variant="secondary" onClick={() => navigate('/get-started')} className="border-transparent shadow-lift">
            Analyze my content <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
      <motion.div style={{ opacity: hint }} className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-white/80">
        <span className="text-xs font-medium">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}><ChevronDown className="h-4 w-4" /></motion.span>
      </motion.div>
    </>
  )
}

function ChosenPost({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.13, 0.2, 0.62, 0.68], [0, 1, 1, 0])
  const scale = useTransform(p, [0.15, 0.24, 0.42, 0.5], [0.7, 1, 1, 0.62])
  const likes = useTransform(p, [0.2, 0.34], [0, 1])
  return (
    <motion.div style={{ opacity, scale }} className="absolute left-1/2 top-1/2 z-10 h-[34vh] w-[88vw] max-h-95 max-w-140 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-4xl border-[5px] border-white bg-slate-200 shadow-2xl sm:h-[40vh] sm:w-[62vh]">
      <ImageWithFallback src={POST_IMAGE} alt="Your post" className="h-full w-full object-cover" />
      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">your post</div>
      <motion.div style={{ opacity: likes }} className="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-linear-to-t from-black/70 to-transparent p-3 text-white">
        <span className="flex items-center gap-1 text-xs font-semibold"><Heart className="h-4 w-4" /> 12.4k</span>
        <span className="flex items-center gap-1 text-xs font-semibold"><MessageCircle className="h-4 w-4" /> 840</span>
        <span className="flex items-center gap-1 text-xs font-semibold"><Share2 className="h-4 w-4" /> 2.1k</span>
      </motion.div>
    </motion.div>
  )
}

// ACT - 1
const UNDERSTAND_TAGS: { t: string; l: string; top: string; tone: string }[] = [
  { t: 'fashion', l: '22%', top: '18%', tone: 'sky' },
  { t: 'streetwear', l: '78%', top: '18%', tone: 'sky' },
  { t: 'Aesthetic 8.6', l: '11%', top: '50%', tone: 'brand' },
  { t: 'Nike', l: '89%', top: '50%', tone: 'amber' },
  { t: 'Trendy 7.4', l: '25%', top: '84%', tone: 'brand' },
  { t: 'Shareable 7.9', l: '75%', top: '84%', tone: 'brand' },
]
const TAG_TONE: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200', sky: 'bg-sky-50 text-sky-700 border-sky-200', amber: 'bg-amber-50 text-amber-700 border-amber-200',
}
function UnderstandLayer({ p }: { p: MotionValue<number> }) {
  return <div className="pointer-events-none absolute inset-0 z-20">{UNDERSTAND_TAGS.map((tag, i) => <FloatTag key={tag.t} p={p} tag={tag} i={i} />)}</div>
}
function FloatTag({ p, tag, i }: { p: MotionValue<number>; tag: (typeof UNDERSTAND_TAGS)[number]; i: number }) {
  const s = 0.22 + i * 0.02
  const opacity = useTransform(p, [s, s + 0.05, 0.4, 0.45], [0, 1, 1, 0])
  const scale = useTransform(p, [s, s + 0.05], [0.6, 1])
  return (
    <motion.span style={{ opacity, scale, left: tag.l, top: tag.top }} className={`absolute -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-semibold shadow-soft ${TAG_TONE[tag.tone]}`}>
      {tag.t}
    </motion.span>
  )
}

// ACT - 2
const NICHE_POS: { l: string; top: string; hideMobile?: boolean }[] = [
  { l: '18%', top: '24%', hideMobile: true }, { l: '82%', top: '22%', hideMobile: true },
  { l: '85%', top: '62%' }, { l: '16%', top: '66%' },
  { l: '50%', top: '86%', hideMobile: true },
]

const SIM_DOTS = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 137.5) % 100, b = (i * 263.1) % 100, band = i % 4
  let x: number, y: number
  if (band === 0) { x = 2 + (a / 100) * 24; y = 4 + (b / 100) * 92 }        
  else if (band === 1) { x = 74 + (a / 100) * 24; y = 4 + (b / 100) * 92 }  
  else if (band === 2) { x = 4 + (a / 100) * 92; y = 3 + (b / 100) * 22 }   
  else { x = 4 + (a / 100) * 92; y = 75 + (b / 100) * 22 }                  
  return { x, y, on: i % 9 < 5, d: (i % 8) * 0.25 }
})

function SimulateLayer({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.4, 0.45, 0.62, 0.67], [0, 1, 1, 0])
  const runsMv = useTransform(p, [0.44, 0.6], [0, 10000])
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <SimDots p={p} />
      {STORY_NICHES.map((n, i) => <NicheCard key={n.name} p={p} n={n} pos={NICHE_POS[i]} i={i} />)}
      <motion.div style={{ opacity }} className="absolute left-1/2 top-[14%] w-full -translate-x-1/2 px-6 text-center sm:top-[9%]">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Audience simulation</p>
        <p className="text-xl font-black tracking-tight text-ink sm:text-3xl">50,000 <span className="text-sm font-semibold text-muted sm:text-lg">viewers reacting</span></p>
        <p className="mt-0.5 text-xs font-semibold text-brand-700"><Counter mv={runsMv} comma /> / 10,000 Monte Carlo runs</p>
      </motion.div>
    </div>
  )
}

function SimDots({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.4, 0.46, 0.62, 0.67], [0, 1, 1, 0])
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      {SIM_DOTS.map((dot, i) => (
        <motion.span key={i} style={{ left: `${dot.x}%`, top: `${dot.y}%` }} className={`absolute h-1.5 w-1.5 rounded-full ${dot.on ? 'bg-brand-500' : 'bg-neutral-300'} ${i % 4 || dot.y < 28 ? 'max-sm:hidden' : ''}`} animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] }} transition={{ duration: 2.2, repeat: Infinity, delay: dot.d, ease: 'easeInOut' }} />
      ))}
    </motion.div>
  )
}

function NicheCard({ p, n, pos, i }: { p: MotionValue<number>; n: (typeof STORY_NICHES)[number]; pos: (typeof NICHE_POS)[number]; i: number }) {
  const s = 0.42 + i * 0.015
  const opacity = useTransform(p, [s, s + 0.05, 0.62, 0.67], [0, 1, 1, 0])
  const scale = useTransform(p, [s, s + 0.06], [0.7, 1])
  const barScale = useTransform(p, [0.46, 0.6], [0, n.aff])
  const strong = n.aff >= 0.7
  return (
    <motion.div style={{ opacity, scale, left: pos.l, top: pos.top }} className={`absolute w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-white shadow-lift sm:w-40 ${pos.hideMobile ? 'max-sm:hidden' : ''} ${strong ? 'border-brand-300 ring-2 ring-brand-500/20' : 'border-line'}`}>
      <div className="h-12 w-full sm:h-16"><ImageWithFallback src={n.img} alt={n.name} className="h-full w-full object-cover" /></div>
      <div className="p-2">
        <p className="truncate text-[11px] font-bold text-ink">{n.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100"><motion.div style={{ scaleX: barScale }} className="h-full w-full origin-left rounded-full bg-linear-to-r from-brand-500 to-teal-500" /></div>
          <span className="text-[10px] font-bold text-brand-700">{Math.round(n.aff * 100)}%</span>
        </div>
      </div>
    </motion.div>
  )
}

// ACT - 3
function Counter({ mv, pct, comma }: { mv: MotionValue<number>; pct?: boolean; comma?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (v: number) => (pct ? `${Math.round(v)}%` : comma ? Math.round(v).toLocaleString('en-US') : formatCompact(v))
  // write the DOM directly on each frame instead of setState — a scroll-driven
  // counter must not trigger a React re-render per frame (that storms on fast scroll)
  useMotionValueEvent(mv, 'change', (v) => {
    if (ref.current) ref.current.textContent = fmt(v)
  })
  return <span ref={ref}>{fmt(mv.get())}</span>
}

function PredictLayer({ p }: { p: MotionValue<number> }) {
  const o = mockSimOutput
  const opacity = useTransform(p, [0.63, 0.68, 0.84, 0.89], [0, 1, 1, 0])
  const reachMv = useTransform(p, [0.68, 0.82], [0, o.expected_reach])
  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-10 px-6 max-sm:gap-6">
      <div className="w-full max-w-4xl">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted">Trending now — your post scored against the moment</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {TRENDING.map((t, i) => <TrendCard key={t.label} p={p} t={t} i={i} />)}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Forecast reach</p>
        <p className="text-7xl font-black tabular-nums tracking-tight text-gradient sm:text-9xl"><Counter mv={reachMv} /></p>
        <p className="mt-2 text-sm text-muted">{formatCompact(o.reach_p10)}–{formatCompact(o.reach_p90)} range · {Math.round(o.viral_probability * 100)}% viral odds · 3 trend matches</p>
      </div>
    </motion.div>
  )
}

function TrendCard({ p, t, i }: { p: MotionValue<number>; t: (typeof TRENDING)[number]; i: number }) {
  const s = 0.65 + i * 0.015
  const scale = useTransform(p, [s, s + 0.06], [0.8, 1])
  const lock = useTransform(p, [0.77, 0.83], [0, 1])
  return (
    <motion.div style={{ scale }} className={`relative overflow-hidden rounded-2xl border bg-white shadow-lift ${i >= 3 ? 'max-sm:hidden' : ''} ${t.match ? 'border-brand-300' : 'border-line opacity-70'}`}>
      <div className="relative h-24 w-full">
        <ImageWithFallback src={t.img} alt={t.label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        <span className="absolute bottom-1.5 left-2 right-2 truncate text-[11px] font-bold text-white">{t.label}</span>
        {t.match && <motion.span style={{ scale: lock }} className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white shadow"><Check className="h-3 w-3" /></motion.span>}
      </div>
      <div className="p-1.5"><div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100"><div className={`h-full rounded-full ${t.match ? 'bg-brand-500' : 'bg-neutral-300'}`} style={{ width: `${t.heat * 100}%` }} /></div></div>
    </motion.div>
  )
}

// ACT - 4
const IMPACT: Record<string, string> = { high: 'bg-brand-50 text-brand-700', medium: 'bg-amber-50 text-amber-700', low: 'bg-slate-100 text-slate-600' }
const REC_WAVE = [6, 14, 30, 54, 78, 96, 82, 58, 34, 18, 8]
const REC_MAX = Math.max(...REC_WAVE)
const REC_PTS = REC_WAVE.map((v, i) => `${((i / (REC_WAVE.length - 1)) * 100).toFixed(1)},${(42 - (v / REC_MAX) * 38).toFixed(1)}`).join(' ')
function RecommendLayer({ p }: { p: MotionValue<number> }) {
  const o = mockSimOutput
  const opacity = useTransform(p, [0.86, 0.91], [0, 1])
  const y = useTransform(p, [0.86, 0.93], [30, 0])
  const curve = useTransform(p, [0.86, 0.94], [0, 1])
  const metrics = [
    { l: 'Expected reach', v: formatCompact(o.expected_reach), s: `${formatCompact(o.reach_p10)}–${formatCompact(o.reach_p90)}` },
    { l: 'Viral odds', v: `${Math.round(o.viral_probability * 100)}%`, s: '10k runs' },
    { l: 'Confidence', v: `${Math.round(o.confidence * 100)}%`, s: 'stable' },
  ]
  return (
    <motion.div style={{ opacity, y }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
      <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 hidden h-[58%] w-full opacity-[0.09] sm:block">
        <polygon points={`0,42 ${REC_PTS} 100,42`} fill="#059669" />
        <motion.polyline points={REC_PTS} fill="none" stroke="#047857" strokeWidth={0.6} vectorEffect="non-scaling-stroke" style={{ pathLength: curve }} />
      </svg>
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-6 max-sm:hidden md:grid-cols-[290px_1fr]">
        <div className="hidden flex-col gap-3 md:flex">
          <div className="aspect-4/3 overflow-hidden rounded-3xl border-4 border-white shadow-lift"><ImageWithFallback src={POST_IMAGE} alt="Your post" className="h-full w-full object-cover" /></div>
          <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><TrendingUp className="h-4 w-4" /></span>
            <div><p className="text-[11px] uppercase tracking-wide text-muted">Verdict</p><p className="text-base font-black text-brand-700">Viral potential</p></div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2.5 md:hidden">
            <TrendingUp className="h-4 w-4 text-brand-700" />
            <p className="text-sm font-black text-brand-700">Verdict: viral potential</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((m) => (
              <div key={m.l} className="rounded-2xl border border-line bg-white/95 px-4 py-3 text-center shadow-soft"><p className="text-[10px] uppercase tracking-wide text-muted">{m.l}</p><p className="mt-0.5 text-2xl font-black tracking-tight text-ink">{m.v}</p><p className="text-[10px] text-muted">{m.s}</p></div>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-white/95 p-4 shadow-soft">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"><Zap className="h-3.5 w-3.5 text-brand-600" /> Recommended edits</p>
            {mockSuggestions.slice(0, 3).map((sug, i) => (
              <div key={sug.title} className="flex items-center gap-3 border-t border-line py-2 first:border-0">
                <span className="grid h-5 w-5 flex-none place-items-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">{i + 1}</span>
                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{sug.title}</p>
                <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${IMPACT[sug.impact]}`}>{sug.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 flex items-center px-4 sm:hidden">
        <div className="w-full rounded-3xl border border-line bg-white/95 p-4 shadow-lift">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-brand-700" />
            <p className="text-sm font-black text-brand-700">Verdict: viral potential</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {metrics.map((m) => (
              <div key={m.l} className="rounded-xl border border-line bg-canvas px-1.5 py-2 text-center">
                <p className="text-[9px] uppercase tracking-wide text-muted">{m.l}</p>
                <p className="mt-0.5 text-lg font-black tracking-tight text-ink">{m.v}</p>
                <p className="text-[9px] text-muted">{m.s}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2.5 border-t border-line pt-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              <Zap className="h-3.5 w-3.5 text-brand-600" /> Recommended edits
            </p>
            {mockSuggestions.slice(0, 2).map((sug, i) => (
              <div key={sug.title} className="flex items-start gap-2.5">
                <span className="grid h-6 w-6 flex-none place-items-center rounded-lg bg-brand-600 text-[11px] font-bold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-snug text-ink">{sug.title}</p>
                </div>
                <span className={`flex-none rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${IMPACT[sug.impact]}`}>{sug.impact}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-line pt-2.5 text-center text-[10px] text-muted">
            Based on 10,000 simulated runs across 50,000 AI viewers
          </p>
        </div>
      </div>
    </motion.div>
  )
}


function ActType({ p }: { p: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute bottom-[8%] left-0 z-30 mx-auto w-full max-w-6xl px-8">
      {ACTS.map((a, i) => <ActWord key={a.word} p={p} a={a} i={i} />)}
    </div>
  )
}

function ActWord({ p, a, i }: { p: MotionValue<number>; a: (typeof ACTS)[number]; i: number }) {
  const opacity = useTransform(p, [a.at - 0.09, a.at - 0.04, a.at + 0.05, a.at + 0.1], [0, 1, 1, 0])
  const y = useTransform(p, [a.at - 0.09, a.at, a.at + 0.1], [40, 0, -40])
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-8 bottom-0">
      <span className="text-sm font-bold tabular-nums text-brand-600">0{i + 1} / 04</span>
      <h2 className="mt-1 font-serif text-4xl font-black leading-none tracking-tight text-ink drop-shadow-sm sm:text-7xl">{a.word}</h2>
      <p className="mt-3 hidden max-w-md text-base leading-relaxed text-ink/70 sm:block">{a.desc}</p>
    </motion.div>
  )
}
