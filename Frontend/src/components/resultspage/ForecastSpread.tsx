import { motion } from 'motion/react'
import { Flame, Zap, AtSign } from 'lucide-react'
import { EASE } from '../../lib/motion'
import { formatCompact } from '../../lib/cn'
import { DIMENSIONS, type ContentAnalysis, type SimOutput, type Suggestion } from '../../config/site'
import type { CreatorProfile } from '../../lib/api'
import CountUp from "./CountUp"
import Kicker from './Kicker'

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
}

const CREATOR_ROWS: { key: keyof CreatorProfile; label: string }[] = [
  { key: 'trust', label: 'Trust' },
  { key: 'momentum', label: 'Momentum' },
  { key: 'niche_authority', label: 'Niche authority' },
  { key: 'audience_quality', label: 'Audience quality' },
  { key: 'volatility', label: 'Volatility' },
]

const DIM_QUIP: Record<string, string> = {
  humor: 'making people laugh',
  curiosity: 'making people curious',
  educational: 'teaching something',
  novelty: 'feeling fresh',
  controversy: 'stirring debate',
  emotional_intensity: 'hitting the feels',
  relatability: 'feeling “that’s so me”',
  practical_value: 'being genuinely useful',
}

const IMPACT_STYLE: Record<string, string> = {
  high: 'bg-brand-50 text-brand-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

function IndexRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-dotted border-ink/20 pb-1.5">
      <span className={`capitalize ${strong ? 'font-semibold text-ink' : 'text-ink/80'} text-sm`}>
        {strong && <span className="mr-1 text-brand-600">★</span>}
        {label}
      </span>
      <span className="flex-1" />
      <span className={`text-sm font-bold tabular-nums ${strong ? 'text-brand-700' : 'text-ink'}`}>{value}</span>
    </div>
  )
}

const confWord = (c: number) => (c >= 0.75 ? 'high confidence' : c >= 0.5 ? 'solid confidence' : 'an early read')

export default function ForecastSpread({
  analysis, output, creator, suggestions, viralPct, verdict, handle,
}: {
  analysis: ContentAnalysis
  output: SimOutput
  creator: CreatorProfile
  suggestions: Suggestion[]
  viralPct: number
  verdict: { title: string; sub: string }
  handle: string
}) {
  const ranked = [...DIMENSIONS].sort((a, b) => (analysis.dims[b] ?? 0) - (analysis.dims[a] ?? 0))
  const topSet = new Set(ranked.slice(0, 3))

  const wave = output.mean_wave
  const maxW = Math.max(...wave)
  const pts = wave
    .map((v, i) => `${((i / (wave.length - 1)) * 100).toFixed(2)},${(60 - (v / maxW) * 52).toFixed(2)}`)
    .join(' ')
  const peakAt = wave.indexOf(maxW)
  const meterPct = Math.min(100, (output.viral_probability / 0.5) * 100)
  const [lead, ...restEdits] = suggestions

  return (
    <div>
      <div className="grid gap-10 pt-8 md:grid-cols-12 md:gap-0">
        {/* lead story */}
        <div className="md:col-span-8 md:border-r md:border-ink/15 md:pr-10">
          <Kicker>Today&rsquo;s verdict</Kicker>
          <h1 className="mt-3 font-serif text-5xl font-black leading-[1.02] tracking-tight text-ink sm:text-7xl">
            {verdict.title}
          </h1>
          <p className="mt-3 text-[13px] italic text-muted">
            By the Reech simulation desk — 10,000 runs across 50,000 AI viewers, for {handle}
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Expected reach</p>
              <p className="font-serif font-black tracking-tight text-brand-700">
                <CountUp to={output.expected_reach} />
              </p>
            </div>
            <p className="max-w-xs pb-2 text-[15px] leading-relaxed text-muted">
              {verdict.sub} On a quiet day ~<strong className="text-ink">{formatCompact(output.reach_p10)}</strong>,
              typically <strong className="text-ink">{formatCompact(output.reach_p50)}</strong> — and up to{' '}
              <strong className="text-brand-700">{formatCompact(output.reach_p90)}</strong> if it pops.
            </p>
          </div>

          {/* chart of the day */}
          <div className="mt-8 border-y border-ink/15 py-5">
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-44 w-full">
              <defs>
                <linearGradient id="resFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.polygon
                points={`0,60 ${pts} 100,60`}
                fill="url(#resFill)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
              <motion.polyline
                points={pts}
                fill="none"
                stroke="#059669"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE }}
              />
            </svg>
            <p className="mt-2 text-[12px] text-muted">
              <strong className="font-bold uppercase tracking-wide text-ink">Fig. 1</strong> — how your post
              travels: first fans, then algorithm waves (peak at wave {peakAt + 1}), then the fade.
            </p>
          </div>
        </div>

        {/* the outlook column */}
        <div className="md:col-span-4 md:pl-10">
          <Kicker>The outlook</Kicker>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand-600 text-white">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <p className="font-serif text-6xl font-black leading-none tracking-tight text-ink">{viralPct}%</p>
              <p className="mt-1 text-sm text-muted">chance of going viral today</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="relative h-2 rounded-full bg-neutral-100">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
                initial={{ width: 0 }}
                whileInView={{ width: `${meterPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE, delay: 0.2 }}
              />
              <motion.span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-brand-600 shadow"
                style={{ left: `${meterPct}%` }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1, ease: EASE }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-medium text-muted">
              <span>long shot</span>
              <span>real chance</span>
              <span>coin flip</span>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            {(viralPct * 100).toLocaleString()} of 10,000 simulated timelines broke out — {confWord(output.confidence)} at{' '}
            {Math.round(output.confidence * 100)}%.
          </p>

          <div className="mt-8 border-t border-ink/15 pt-6">
            <Kicker>By the numbers</Kicker>
            <div className="mt-4 space-y-2.5">
              <IndexRow label="Quiet day" value={formatCompact(output.reach_p10)} />
              <IndexRow label="Typical run" value={formatCompact(output.reach_p50)} />
              <IndexRow label="If it pops" value={formatCompact(output.reach_p90)} strong />
              <IndexRow label="Confidence" value={`${Math.round(output.confidence * 100)}%`} />
              <IndexRow label="Peak wave" value={`#${peakAt + 1}`} />
              <IndexRow label="Simulated runs" value="10,000" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 border-t border-ink/15 pt-8 md:grid-cols-3 md:gap-0">
        <div className="md:border-r md:border-ink/15 md:pr-8">
          <Kicker>Content ratings</Kicker>
          <p className="mt-2 text-[13px] text-muted">The eight creative ingredients, scored /10. ★ = your superpowers.</p>
          <div className="mt-4 space-y-2.5">
            {ranked.map((d) => (
              <IndexRow
                key={d}
                label={d.replace(/_/g, ' ')}
                value={(analysis.dims[d] ?? 0).toFixed(1)}
                strong={topSet.has(d)}
              />
            ))}
          </div>
        </div>

        <div className="md:border-r md:border-ink/15 md:px-8">
          <Kicker>Read as</Kicker>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            Your top card is <strong className="capitalize">{ranked[0].replace(/_/g, ' ')}</strong>
            <span className="text-muted"> — this post is great at {DIM_QUIP[ranked[0]] ?? ranked[0]}.</span>
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[14px] text-muted">
            The AI filed it under
            {analysis.topics.map((t) => (
              <span key={t} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-semibold capitalize text-brand-700">
                {t.replace(/_/g, ' ')}
              </span>
            ))}
            {analysis.entities.length > 0 && (
              <>
                featuring
                {analysis.entities.map((e) => (
                  <span key={e} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-semibold text-amber-700">
                    {e}
                  </span>
                ))}
              </>
            )}
          </p>
          <div className="mt-5 space-y-2.5">
            <IndexRow label="Shareability" value={`${analysis.composites.shareability.toFixed(1)}/10`} strong />
            <IndexRow label="Saveability" value={`${analysis.composites.saveability.toFixed(1)}/10`} />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            People will send this to friends — fewer will bookmark it. Shares are the algorithm&rsquo;s
            favourite signal, so that&rsquo;s the right way around.
          </p>
        </div>

        <div className="md:pl-8">
          <Kicker>Creator desk</Kicker>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
            <AtSign className="h-3.5 w-3.5 text-brand-600" />
            Calibrated to <strong className="text-ink">{handle}</strong> on{' '}
            <span>{creator.platforms.map((p) => PLATFORM_LABEL[p] ?? p).join(' + ')}</span>
          </p>
          <div className="mt-4 space-y-2.5">
            {CREATOR_ROWS.map((r) => (
              <IndexRow key={r.key} label={r.label} value={`${Math.round(Number(creator[r.key]))}/100`} />
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            These set your starting audience and how kindly the algorithm treats you — the same post
            performs differently from a different account.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-ink/15 pt-8">
        <Kicker>Before you post — the edit desk</Kicker>
        <div className="mt-5 grid gap-10 md:grid-cols-12 md:gap-0">
          {/* pull quote: the #1 edit */}
          <div className="md:col-span-5 md:border-r md:border-ink/15 md:pr-10">
            <p className="font-serif text-3xl font-black leading-snug tracking-tight text-ink sm:text-4xl">
              <span className="text-brand-600">“</span>
              {lead.title}
              <span className="text-brand-600">”</span>
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{lead.detail}</p>
            <span className={`mt-4 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${IMPACT_STYLE[lead.impact]}`}>
              {lead.impact} impact · do this first
            </span>
          </div>
          {/* the rest of the list */}
          <div className="md:col-span-7 md:pl-10">
            <ol className="space-y-6">
              {restEdits.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
                  className="flex gap-4"
                >
                  <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
                    {i + 2}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[16px] font-bold text-ink">
                      {s.title}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${IMPACT_STYLE[s.impact]}`}>
                        {s.impact}
                      </span>
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted">{s.detail}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
            <p className="mt-6 flex items-center gap-1.5 text-[13px] text-muted">
              <Zap className="h-3.5 w-3.5 text-brand-600" />
              Ranked by how much each one moved the forecast in simulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}