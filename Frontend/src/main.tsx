import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

{
  const w = window as unknown as { ScrollTimeline?: unknown; ViewTimeline?: unknown }
  w.ScrollTimeline = undefined
  w.ViewTimeline = undefined
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
