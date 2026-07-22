import { Sparkles, AtSign, Film, Tag } from 'lucide-react'
import { Card } from '../ui/Card'
import type { SimInputs } from '../../state/SimulationContext'

const MODALITY_LABEL: Record<string, string> = {
  video: 'Video',
  image: 'Image',
  text: 'Text',
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
}

export function SummaryCard({ inputs, platforms }: { inputs: SimInputs; platforms: string[] }) {
  const handle = inputs.handle.trim() ? inputs.handle.startsWith('@') ? inputs.handle: `@${inputs.handle}` : 'your account'
  const source = inputs.modality === 'text' ? 'a text post' : inputs.fileName || `a ${inputs.modality}`
  const platformText = platforms.length
    ? platforms.map((p) => PLATFORM_LABEL[p] ?? p).join(' + ')
    : 'no platform connected'

  return (
    <Card className="bg-canvas p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Sparkles className="h-3.5 w-3.5 text-brand-600" />
        You&rsquo;re about to simulate
      </p>
      <ul className="mt-3 space-y-2 text-sm text-ink">
        <li className="flex items-center gap-2">
          <AtSign className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="truncate">
            {handle}
            <span className="text-muted"> on {platformText}</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Film className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="truncate">
            {MODALITY_LABEL[inputs.modality] ?? inputs.modality}
            <span className="text-muted"> — {source}</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="truncate text-muted">
            {inputs.tags.length ? inputs.tags.map((t) => `#${t}`).join('  ') : 'no tags yet'}
          </span>
        </li>
      </ul>
    </Card>
  )
}
