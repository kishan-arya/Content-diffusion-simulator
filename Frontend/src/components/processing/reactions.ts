import { Heart, MessageCircle, Share2, Bookmark, UserPlus, type LucideIcon } from 'lucide-react'

export interface ReactionAction {
  verb: string
  Icon: LucideIcon
  color: string
}

export interface Reaction {
  id: number
  persona: string
  action: ReactionAction
}

const ACTIONS: { action: ReactionAction; weight: number }[] = [
  { action: { verb: 'liked', Icon: Heart, color: 'text-rose-500' }, weight: 44 },
  { action: { verb: 'commented', Icon: MessageCircle, color: 'text-sky-600' }, weight: 20 },
  { action: { verb: 'shared', Icon: Share2, color: 'text-brand-600' }, weight: 16 },
  { action: { verb: 'saved', Icon: Bookmark, color: 'text-amber-600' }, weight: 12 },
  { action: { verb: 'followed', Icon: UserPlus, color: 'text-teal-600' }, weight: 8 },
]
const WEIGHT_TOTAL = ACTIONS.reduce((n, a) => n + a.weight, 0)

// weighted pick of a reaction, biased toward likes (like a real feed)
export function pickAction(): ReactionAction {
  let r = Math.random() * WEIGHT_TOTAL
  for (const a of ACTIONS) {
    if ((r -= a.weight) <= 0) return a.action
  }
  return ACTIONS[0].action
}
