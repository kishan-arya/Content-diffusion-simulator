import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Camera, PlaySquare, Video, Image as ImageIcon, Type, Link2, Loader2, Check } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { FloatingBackdrop } from '../components/layout/FloatingBackdrop'
import { Field, Input, Textarea } from '../components/ui/Field'
import { TagInput } from '../components/ui/TagInput'
import Stepper, { Step } from '../components/ui/Stepper'
import { Segmented } from '../components/getstarted/Segmented'
import { Dropzone } from '../components/getstarted/Dropzone'
import { SummaryCard } from '../components/getstarted/SummaryCard'
import { useSimulation, type Modality } from '../state/SimulationContext'
import { useToast } from '../components/ui/Toast'
import { EASE } from '../lib/motion'

const PLATFORM_OPTIONS: { value: string; label: string; icon: ReactNode }[] = [
  { value: 'instagram', label: 'Instagram', icon: <Camera className="h-4 w-4" /> },
  { value: 'youtube', label: 'YouTube', icon: <PlaySquare className="h-4 w-4" /> },
]

const MODALITY_OPTIONS: { value: Modality; label: string; icon: ReactNode }[] = [
  { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" /> },
  { value: 'text', label: 'Text', icon: <Type className="h-4 w-4" /> },
]

function Hint({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="text-center text-xs text-muted"
    >
      {children}
    </motion.p>
  )
}

export default function GetStartedPage() {
  const navigate = useNavigate()
  const { inputs, setInputs, reset, connect, disconnect, creator } = useSimulation()
  const { toast } = useToast()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  useEffect(() => {reset()}, [reset])

  const connected = creator?.platforms ?? []

  // preventing continue on form when input not added on given step
  const contentReady = inputs.modality === 'text' ? inputs.description.trim().length > 0 : inputs.fileName.length > 0
  const canContinue = step === 1 ? inputs.authorized : step === 2 ? contentReady : inputs.description.trim().length > 0

  const connectAccount = async (platform: string) => {
    if (!inputs.handle.trim() || connecting) return
    setConnecting(platform)
    try {
      const profile = await connect(inputs.handle.trim(), platform)
      if (!profile.platforms.includes(platform)) {
        toast(
          `${PLATFORM_OPTIONS.find((p) => p.value === platform)?.label ?? platform} didn't finish connecting — complete the login in the popup, then try again.`,
          'error',
        )
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Connection failed. Please try again.', 'error')
    } finally {
      setConnecting(null)
    }
  }

  // the backend user_id derives from the handle, so editing it invalidates connections
  const onHandleChange = (handle: string) => {
    setInputs({ handle })
    if (inputs.authorized || creator) disconnect()
  }

  const onModalityChange = (modality: Modality) => {
    if (modality !== inputs.modality) setInputs({ modality, fileName: '', file: null })
  }

  return (
    <div className="relative min-h-screen bg-canvas">
      <FloatingBackdrop />
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Badge>Set up your simulation</Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            className="mt-4 font-serif text-3xl font-black tracking-tight text-ink sm:text-4xl"
          >
            Let&rsquo;s get your post ready to simulate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
            className="mt-2 max-w-md text-sm text-muted"
          >
            Connect your profile, add your content, and give it context — then we&rsquo;ll play it
            to 50,000 AI viewers.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
          className="flex w-full flex-col items-center"
        >
          <Stepper
            initialStep={1}
            nextButtonText="Continue"
            backButtonText="Back"
            disableStepIndicators
            onStepChange={setStep}
            onFinalStepCompleted={() => navigate('/processing', { replace: true })}
            nextButtonProps={{ disabled: !canContinue }}
          >
            <Step>
              <div className="space-y-5">
                <StepHead
                  title="Connect your profile"
                  subtitle="We calibrate the simulation to your creator profile — reach, favorability, and consistency."
                />

                <Field label="Creator handle" htmlFor="handle" hint="The account you'll post from.">
                  <Input
                    id="handle"
                    placeholder="@yourhandle"
                    value={inputs.handle}
                    disabled={connecting !== null}
                    onChange={(e) => onHandleChange(e.target.value)}
                  />
                </Field>

                <Field
                  label="Platforms"
                  hint="Connect one or both — link Instagram and YouTube together and Reech calibrates on your combined audience."
                >
                  <div className="grid gap-px border border-line bg-line">
                    {PLATFORM_OPTIONS.map((p) => {
                      const isConnected = connected.includes(p.value)
                      const isConnecting = connecting === p.value
                      return (
                        <div key={p.value} className="flex items-center gap-3 bg-white p-3.5">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center border ${
                              isConnected
                                ? 'border-brand-200 bg-brand-50 text-brand-700'
                                : 'border-line bg-canvas text-muted'
                            }`}
                          >
                            {p.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink">{p.label}</p>
                            <p className="truncate text-xs text-muted">
                              {isConnected
                                ? `Connected · ${inputs.handle.trim() || 'your account'}`
                                : isConnecting
                                  ? 'Finish the login in the popup, then close it…'
                                  : 'Not connected'}
                            </p>
                          </div>
                          {isConnected ? (
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => connectAccount(p.value)}
                              disabled={connecting !== null || !inputs.handle.trim()}
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
                                </>
                              ) : (
                                <>
                                  <Link2 className="h-3.5 w-3.5" /> Connect
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Field>

                <Hint show={!inputs.authorized}>
                  {connecting
                    ? 'Complete the login in the popup window, then close it.'
                    : inputs.handle.trim()
                      ? 'Connect at least one platform to continue.'
                      : 'Enter your creator handle, then connect a platform.'}
                </Hint>
                <Hint show={inputs.authorized && connected.length === 1}>
                  You can connect the other platform too — Reech blends both into one sharper
                  creator profile.
                </Hint>
              </div>
            </Step>

            <Step>
              <div className="space-y-5">
                <StepHead
                  title="Upload your content"
                  subtitle="Pick what you're posting. This is what our Context Engine reads and scores."
                />

                <Field label="Content type">
                  <Segmented
                    ariaLabel="Modality"
                    options={MODALITY_OPTIONS}
                    value={inputs.modality}
                    onChange={onModalityChange}
                  />
                </Field>

                <motion.div
                  key={inputs.modality === 'text' ? 'text' : 'media'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  {inputs.modality === 'text' ? (
                    <Field label="Post text" hint="Paste the caption or copy you plan to publish.">
                      <Textarea
                        placeholder="Write or paste your post here…"
                        className="min-h-40"
                        value={inputs.description}
                        onChange={(e) => setInputs({ description: e.target.value })}
                      />
                    </Field>
                  ) : (
                    <Dropzone
                      modality={inputs.modality}
                      fileName={inputs.fileName}
                      onFile={(fileName, file) => setInputs({ fileName, file })}
                      onClear={() => setInputs({ fileName: '', file: null })}
                    />
                  )}
                </motion.div>

                <Hint show={!contentReady}>
                  Add your {inputs.modality === 'text' ? 'post text' : inputs.modality} to continue.
                </Hint>
              </div>
            </Step>

            <Step>
              <div className="space-y-5">
                <StepHead
                  title="Describe & tag"
                  subtitle="Context and tags sharpen topic and entity detection — and your forecast."
                />

                <Field
                  label="Description"
                  htmlFor="description"
                  hint="What is the post about? Any hook, angle, or timing that matters."
                >
                  <Textarea
                    id="description"
                    placeholder="e.g. A fast-cut behind-the-scenes at Coachella, shot on a GoPro…"
                    value={inputs.description}
                    onChange={(e) => setInputs({ description: e.target.value })}
                  />
                </Field>

                <Field label="Tags" hint="Add the hashtags you plan to post with.">
                  <TagInput
                    value={inputs.tags}
                    onChange={(tags) => setInputs({ tags })}
                    placeholder="Add a tag and press Enter"
                  />
                </Field>

                <SummaryCard inputs={inputs} platforms={connected} />

                <Hint show={!inputs.description.trim()}>
                  Add a description to run the simulation.
                </Hint>
              </div>
            </Step>
          </Stepper>
        </motion.div>
      </main>
    </div>
  )
}

function StepHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pt-1">
      <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{subtitle}</p>
    </div>
  )
}
