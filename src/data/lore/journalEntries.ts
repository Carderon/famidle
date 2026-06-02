import type { JournalEntry } from '@/types/JournalType'

/**
 * Lore « intime » : débloquée par triggers (indépendante des logs de jeu).
 * Ordre = ordre de lecture conseillé une fois tout déverrouillé.
 */
export const journalEntries: JournalEntry[] = [
  {
    id: 'journal.age1.wake',
    title: 'Première page',
    body: "Les planches craquent comme si la maison se souvenait encore des pas qui ne sont plus là. Suis-je seul encore une fois ? Comme si tout ça devait recommencer, pourtant j'ai les mains vident",
    trigger: { kind: 'time', atSeconds: 2 },
    minEra: 1,
  },
  {
    id: 'journal.age1.fire',
    title: 'Lumière',
    body: "Un courant d’air ramène une odeur de cendre froide et de poussière ancienne. La flamme ne suffit pas à tout nommer. C'est à peine une étincelle dans le néant afin de me guider dans ce qu'il faut faire une fois de plus.",
    trigger: { kind: 'flag', flag: 'age1.flag.firecampLit' },
    minEra: 1,
  },
  {
    id: 'journal.age1.floor',
    title: 'Sous les pieds',
    body: "Sous vos pieds, le sol ne craque plus au même endroit. Une pièce se souvient. C'était un lieu d'amour, d'échange, de tendresse. Où sont elles parties ?",
    trigger: { kind: 'flag', flag: 'age1.flag.bedroomComplete' },
    minEra: 1,
  },
  {
    id: 'journal.age1.depart',
    title: 'Fermer le cahier',
    body: 'La chambre a repris ses droits. Que reste-t-il au delà de sa porte ? Dois-je me lancer dans la reconstruction de tout cela. Oui, afin de les rappeler à moi.',
    trigger: { kind: 'flag', flag: 'age1.flag.tutorialComplete' },
    minEra: 1,
  },
]
