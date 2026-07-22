import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function TagInput({value,onChange,placeholder = 'Add a tag and press Enter',max = 12,}: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  max?: number
}) {
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const t = raw.trim().replace(/^#/, '')
    if (!t || value.includes(t) || value.length >= max) return
    onChange([...value, t])
    setDraft('')
  }

  const remove = (t: string) => onChange(value.filter((x) => x !== t))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 border border-line bg-white px-2.5 py-2 ' +
          'transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10',
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="text-brand-500 hover:text-brand-800"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={value.length ? '' : placeholder}
        className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
      />
    </div>
  )
}
