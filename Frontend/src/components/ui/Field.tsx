import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

const controlBase =
  'w-full border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 ' +
  'transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ' +
  'disabled:pointer-events-none disabled:opacity-60'

export function Field({label,hint,htmlFor,children}: {
  label?: string
  hint?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, 'min-h-28 resize-y', className)} {...props} />
}
