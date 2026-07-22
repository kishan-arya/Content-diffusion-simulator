import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
  'transition-all duration-200 active:scale-[0.98] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_10px_30px_-10px_rgba(5,150,105,0.6)]',
  secondary: 'bg-white text-ink border border-line hover:border-brand-300 hover:bg-brand-50/50 shadow-soft',
  ghost: 'text-ink/70 hover:text-ink hover:bg-black/[0.04]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  )
}
