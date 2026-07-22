import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { UploadCloud, FileVideo, FileImage, X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Dropzone({modality,fileName,onFile,onClear}: {
  modality: 'video' | 'image'
  fileName: string
  onFile: (name: string, file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const accept = modality === 'video' ? 'video/*' : 'image/*'
  const FileIcon = modality === 'video' ? FileVideo : FileImage

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f.name, f)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f.name, f)
  }

  if (fileName) {
    return (
      <div className="flex items-center gap-3 border border-brand-200 bg-brand-50/50 p-4">
        <span className="grid h-11 w-11 place-items-center border border-brand-200 bg-white text-brand-600">
          <FileIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{fileName}</p>
          <p className="text-xs text-muted">Ready to simulate · {modality}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear()
            if (inputRef.current) inputRef.current.value = ''
          }}
          aria-label="Remove file"
          className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-black/4 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'group flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
        dragging
          ? 'border-brand-400 bg-brand-50/60 shadow-glow'
          : 'border-line bg-canvas hover:border-brand-300 hover:bg-brand-50/40',
      )}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="sr-only" />
      <span
        className={cn(
          'grid h-12 w-12 place-items-center transition-colors',
          dragging
            ? 'bg-brand-600 text-white'
            : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white',
        )}
      >
        <UploadCloud className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">
          Drop your {modality} here, or <span className="text-brand-700">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          {modality === 'video' ? 'MP4, MOV up to 500MB' : 'PNG, JPG, WEBP up to 25MB'}
        </p>
      </div>
    </label>
  )
}
