import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { Container } from '../../ui/Container'
import { SectionHeading } from '../SectionHeading'
import { cn } from '../../../lib/cn'
import { EASE } from '../../../lib/motion'

interface QA {
  q: string
  a: string
}

const FAQS: QA[] = [
  {
    q: 'How does Reech actually work?',
    a: 'Reech reads what your post is really about — the scene, the hook, the emotional pull — then plays it to a calibrated audience of 50,000 synthetic viewers across thousands of algorithmic runs. Instead of one vanity score, you get the full range of outcomes: an expected reach band, the odds of going viral, and the wave-by-wave curve of how the feed would promote or bury it.',
  },
  {
    q: 'Is my content used to train your models?',
    a: 'No. Your uploads are analyzed to generate your forecast and are never added to a training set or shared with other creators. The models that power the simulation are trained on aggregate, anonymized signals — not on your individual posts. Your work stays yours.',
  },
  {
    q: 'Which platforms and content types are supported?',
    a: 'Reech models short-form, feed-driven distribution — the mechanics behind platforms like Instagram, TikTok, and YouTube Shorts. You can analyze video, image, or text posts. Each modality is scored on the same eight engagement dimensions, so a Reel and a carousel are judged by the same underlying audience.',
  },
  {
    q: 'Can I connect more than one account?',
    a: 'Yes — you can link your Instagram and YouTube accounts at the same time. Reech merges both into a single creator profile, so your trust, momentum, and audience-quality scores reflect your combined footprint rather than one platform in isolation. One connection is enough to run a forecast, but linking both gives the simulation a sharper picture of who already listens to you.',
  },
  {
    q: 'Does it handle video differently from images or text?',
    a: 'Yes. For video we transcribe the audio and read pacing, hook timing, and on-screen context; for images we read composition, subject, and style; for text we read the claim, tone, and payoff. All three feed into the same shareability and saveability composites, so forecasts stay comparable across formats.',
  },
  {
    q: 'How accurate is the forecast?',
    a: 'It is a simulation, not a promise. Virality is genuinely stochastic — the same post can flop or explode depending on timing and luck — so we report a p10–p90 reach band and a confidence level rather than a single fake-precise number. Treat the range as a well-informed forecast of what could happen, and use the suggestions to widen your upside.',
  },
  {
    q: 'Do I need a large following to use Reech?',
    a: 'Not at all. Your creator profile sets the cold-start size and algorithmic favorability, so a smaller account simply starts with a tighter early audience. The simulation still models how a strong post can break out beyond your current reach — which is exactly where the interesting forecasts live for growing creators.',
  },
  {
    q: 'Is there a free trial, and how does pricing work?',
    a: 'You can run your first forecasts free — no card required — to see the reach band, viral odds, and suggestions on your own content. Paid plans unlock higher simulation volume, trend-aware timing, and profile calibration. You only move up a tier when you are getting real value from the free runs.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-canvas py-14 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="The honest answers"
          subtitle="Reech is a forecasting tool, not a magic button. Here's exactly what it does, what it doesn't, and how your content is handled."
        />

        <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
          <div className="divide-y divide-line border border-line">
            {FAQS.map((item, i) => {
              const isOpen = open === i
              return (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.05, ease: EASE }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className={cn(
                      'flex w-full items-center gap-4 px-4 py-4 text-left transition-colors sm:px-7 sm:py-5',
                      'hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
                    )}
                  >
                    <span
                      className={cn(
                        'text-base font-semibold tracking-tight transition-colors sm:text-lg',
                        isOpen ? 'text-brand-700' : 'text-ink',
                      )}
                    >
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className={cn(
                        'ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors',
                        isOpen
                          ? 'border-brand-200 bg-brand-50 text-brand-600'
                          : 'border-line bg-canvas text-muted',
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-5 text-[15px] leading-relaxed text-muted sm:px-7 sm:pb-6">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
