import type { JournalEntry } from '@/types/JournalType'

/**
 * Lore « intime » : débloquée par triggers (indépendante des logs de jeu).
 * Ordre = ordre de lecture conseillé une fois tout déverrouillé.
 */
export const journalEntries: JournalEntry[] = [
  {
    id: 'journal.age1.wake',
    title: 'Première page',
    body: 'Les planches craquent comme si la maison se souvenait encore des pas qui ne sont plus là.',
    trigger: { kind: 'time', atSeconds: 2 },
    minEra: 1,
  },
  {
    id: 'journal.age1.fire',
    title: 'Lumière',
    body: 'Un courant d’air ramène une odeur de cendre froide et de poussière ancienne. La flamme ne suffit pas à tout nommer.',
    trigger: { kind: 'flag', flag: 'age1.flag.firecampLit' },
    minEra: 1,
  },
  {
    id: 'journal.age1.floor',
    title: 'Sous les pieds',
    body: 'Sous vos pieds, le sol ne craque plus au même endroit. Une pièce se souvient.',
    trigger: { kind: 'counter', counter: 'age1.counter.tilesRepaired', atLeast: 9 },
    minEra: 1,
  },
  {
    id: 'journal.age1.depart',
    title: 'Fermer le cahier',
    body: 'Ce lieu ne vous retient plus. Il ne vous reste plus qu’à choisir où bâtir après les ruines.',
    trigger: { kind: 'flag', flag: 'age1.flag.tutorialComplete' },
    minEra: 1,
  },
]
