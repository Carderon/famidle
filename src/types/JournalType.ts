import type { EventTrigger } from '@/types/EventType'

/**
 * Entrée du journal intime : texte révélé quand le trigger est satisfait
 * (même logique d’éligibilité que les événements : temps, flag, compteur).
 */
export interface JournalEntry {
  id: string
  title?: string
  body: string
  trigger: EventTrigger
  minEra?: number
  maxEra?: number
}
