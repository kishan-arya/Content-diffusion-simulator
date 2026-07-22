import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { authorizeCreator, analyzeContent, runSimulationApi, type CreatorProfile } from '../lib/api'
import { type ContentAnalysis, type SimOutput, type Suggestion, type Verdict } from '../config/site'
import { useToast } from '../components/ui/Toast'

// input type for content L3
export type Modality = 'video' | 'image' | 'text'

// Inputs required for the Simulator
export interface SimInputs {
  handle: string
  authorized: boolean
  modality: Modality
  fileName: string           
  file: File | null         // Content File
  description: string
  tags: string[]
}

// Final Output displayed on the Dashboard (L2,L3,L4,L5)
export interface SimResult {
  analysis: ContentAnalysis
  output: SimOutput
  creator: CreatorProfile
  suggestions: Suggestion[]
  verdict: Verdict
}

export type PipelineStatus = 'idle' | 'analyzing' | 'simulating' | 'done' | 'error'

interface SimulationContextValue {
  inputs: SimInputs
  setInputs: (patch: Partial<SimInputs>) => void
  creator: CreatorProfile | null
  result: SimResult | null
  status: PipelineStatus
  connect: (handle: string, platform: string) => Promise<CreatorProfile>
  disconnect: () => void
  startPipeline: () => Promise<void>
  reset: () => void
}

const DEFAULT_INPUTS: SimInputs = {
  handle: '',
  authorized: false,
  modality: 'video',
  fileName: '',
  file: null,
  description: '',
  tags: [],
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [inputs, setInputsState] = useState<SimInputs>(DEFAULT_INPUTS)
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [result, setResult] = useState<SimResult | null>(null)
  const [status, setStatus] = useState<PipelineStatus>('idle')

  const inputsRef = useRef(inputs)
  const creatorRef = useRef<CreatorProfile | null>(null)
  const runningRef = useRef(false)

  const setInputs = useCallback((patch: Partial<SimInputs>) => {
    setInputsState((prev) => {
      const next = { ...prev, ...patch }
      inputsRef.current = next
      return next
    })
  }, [])

  const connect = useCallback(async (handle: string, platform: string) => {
    const profile = await authorizeCreator(handle, platform)
    creatorRef.current = profile
    setCreator(profile)
    setInputsState((prev) => {
      const next = { ...prev, authorized: profile.platforms.length > 0 }
      inputsRef.current = next
      return next
    })
    return profile
  }, [])

  const disconnect = useCallback(() => {
    creatorRef.current = null
    setCreator(null)
    setInputsState((prev) => {
      const next = { ...prev, authorized: false }
      inputsRef.current = next
      return next
    })
  }, [])

  const startPipeline = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true

    try {
      setStatus('analyzing')
      const analysis = await analyzeContent(inputsRef.current)

      const usedCreator = creatorRef.current
      if (!usedCreator) throw new Error('No creator connected — connect an account first.')

      setStatus('simulating')
      const { output, verdict, suggestions } = await runSimulationApi(analysis, usedCreator)

      setResult({ analysis, output, creator: usedCreator, suggestions, verdict })
      setStatus('done')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Something went wrong running the simulation.', 'error')
      setStatus('error')
    }
  }, [toast])

  const reset = useCallback(() => {
    setInputsState(DEFAULT_INPUTS)
    inputsRef.current = DEFAULT_INPUTS
    creatorRef.current = null
    runningRef.current = false
    setCreator(null)
    setResult(null)
    setStatus('idle')
  }, [])

  return (
    <SimulationContext.Provider
      value={{ inputs, setInputs, creator, result, status, connect, disconnect, startPipeline, reset }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within a SimulationProvider')
  return ctx
}
