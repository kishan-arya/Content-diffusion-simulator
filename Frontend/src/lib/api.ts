import type { ContentAnalysis, SimOutput, Suggestion, Verdict } from '../config/site'
import type { SimInputs } from '../state/SimulationContext'

export interface CreatorProfile {
  handle: string
  platforms: string[]
  trust: number
  momentum: number
  niche_authority: number
  audience_quality: number
  volatility: number
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''

function base(): string {
  if (!API_BASE) {
    throw new Error('Backend not configured — set VITE_API_BASE in Frontend/.env.local.')
  }
  return API_BASE
}

// Remove the @ and trim the userID
function creatorUserId(handle: string): string {
  return handle.replace(/^@/, '').trim()
}

// Open a backend OAuth URL in a popup
function runOAuthPopup(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const popup = window.open(url, 'reech-oauth', 'width=600,height=760,menubar=no,toolbar=no')
    if (!popup) {
      reject(new Error('Popup blocked — allow popups for this site, then try Connect again.'))
      return
    }
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer)
        resolve()
      }
    }, 700)
  })
}

// L2-user engine
export async function authorizeCreator(handle: string, platform: string): Promise<CreatorProfile> {
  const b = base()
  const userId = creatorUserId(handle)

  await runOAuthPopup(`${b}/auth/${platform}?user_id=${encodeURIComponent(userId)}`)

  const res = await fetch(`${b}/creator/analyze?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) {
    throw new Error(
      "Couldn't verify the connection. Finish the login in the popup, close it, then try Connect again.",
    )
  }
  const data = await res.json()
  return {
    handle,
    platforms: (data.platforms_connected as string[] | undefined) ?? [platform],
    trust: data.scores.creator_trust_score,
    momentum: data.scores.creator_momentum_score,
    niche_authority: data.scores.niche_authority_score,
    audience_quality: data.scores.audience_quality_score,
    volatility: data.scores.creator_volatility_score,
  }
}

function topicsToList(topics: unknown): string[] {
  if (Array.isArray(topics)) return topics as string[]
  if (topics && typeof topics === 'object') {
    return Object.entries(topics as Record<string, number>)
      .filter(([, v]) => v > 0)
      .map(([k]) => k)
  }
  return []
}

// L3-Context Engine
export async function analyzeContent(inputs: SimInputs): Promise<ContentAnalysis> {
  const b = base()
  const username = encodeURIComponent(creatorUserId(inputs.handle))

  let res: Response
  if (inputs.modality === 'text') {
    res = await fetch(`${b}/context/analyze/text?username=${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputs.description, tags: inputs.tags }),
    })
  } else {
    if (!inputs.file) throw new Error('No file selected for analysis.')
    const form = new FormData()
    form.append('file', inputs.file)
    if (inputs.description) form.append('text', inputs.description)
    form.append('tags', JSON.stringify(inputs.tags))
    res = await fetch(`${b}/context/analyze/${inputs.modality}?username=${username}`, {
      method: 'POST',
      body: form,
    })
  }
  if (!res.ok) throw new Error(`Content analysis failed (HTTP ${res.status}).`)

  const data = await res.json()
  return {
    modality: inputs.modality,
    dims: Object.fromEntries(
      Object.entries(data.engagement.scores as Record<string, { score: number }>).map(
        ([k, v]) => [k, v.score],
      ),
    ),
    composites: data.engagement.composite,
    topics: topicsToList(data.topics),
    entities: data.entities ?? [],
    content_id: data.content_id,
  }
}

// L4 + L5 
export async function runSimulationApi(analysis: ContentAnalysis,creator: CreatorProfile): Promise<{ output: SimOutput; verdict: Verdict; suggestions: Suggestion[] }> {
  const b = base()
  if (!analysis.content_id) throw new Error('Content analysis did not return a content_id.')

  const params = new URLSearchParams({
    content_id: analysis.content_id,
    user_id: creatorUserId(creator.handle),
    runs: '10000',
  })
  const res = await fetch(`${b}/analyse?${params.toString()}`, { method: 'POST' })
  if (!res.ok) throw new Error(`Simulation failed (HTTP ${res.status}).`)

  const data = await res.json()
  return {
    output: data.output as SimOutput,
    verdict: data.verdict as Verdict,
    suggestions: data.suggestions as Suggestion[],
  }
}
