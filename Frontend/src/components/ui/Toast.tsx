import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type ToastType = 'error' | 'success' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 4
const DEFAULT_DURATION = 5000

const STYLES: Record<ToastType, { icon: ReactNode; accent: string }> = {
  error: { icon: <AlertCircle className="h-4 w-4" />, accent: 'text-red-600' },
  success: { icon: <CheckCircle2 className="h-4 w-4" />, accent: 'text-brand-600' },
  info: { icon: <Info className="h-4 w-4" />, accent: 'text-sky-600' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setItems((xs) => xs.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'error', duration = DEFAULT_DURATION) => {
      const id = idRef.current++
      setItems((xs) => [...xs, { id, message, type }].slice(-MAX_TOASTS))
      window.setTimeout(() => remove(id), duration)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const s = STYLES[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.28 }}
                className="pointer-events-auto flex w-full max-w-md items-start gap-3 border border-line bg-white px-4 py-3 shadow-soft"
              >
                <span className={`mt-0.5 flex-none ${s.accent}`}>{s.icon}</span>
                <p className="flex-1 text-sm leading-snug text-ink">{t.message}</p>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss"
                  className="mt-0.5 flex-none text-muted transition-colors hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
