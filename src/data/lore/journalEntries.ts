import type { JournalEntry } from '@/types/JournalType'

/**
 * Journal intime : trois pages, une par phase de la démo.
 * Le personnage est pris dans une boucle ; la mémoire revient par étapes.
 */
export const journalEntries: JournalEntry[] = [
  {
    id: 'journal.beginning',
    title: "Déni - Rien de tout cela n'est réel",
    body: "Les planches craquent comme si la maison se souvenait encore des pas qui ne sont plus là. Suis-je seul encore une fois ? Comme si tout ça devait recommencer, pourtant j'ai les mains vident. Les souvenirs sont rares seul persiste la sensation que tout devait recommencer, encore. Qu'ai je fais encore ? Dois-je reconstruire une fois de plus ?",
    trigger: { kind: 'time', atSeconds: 1 },
    minEra: 1,
  },
  {
    id: 'journal.age1',
    title: 'Colère - Pourquoi moi ? Pourquoi ici ?!',
    body: "La chambre tient à nouveau. Je comprends un peu mieux : je ne suis pas né ici, j'ai été laissé ici. Une famille m'attendait, ou m'attend encore. Reconstruire n'est pas un passe-temps, c'est un message. Je ne sais pas encore s'ils l'entendront.",
    trigger: { kind: 'flag', flag: 'age1.flag.era1Complete' },
    minEra: 1,
  },
  {
    id: 'journal.age2',
    title: 'Devoir - Fait ce que dois',
    body: "J'ai allumé les petites lumières pour ceux qui reviennent vers moi. Chaque pièce, chaque lieu résonne pour une autre comme une mécanique prévue à cet effet par avance. Je l'ai déjà fait. La maison dépasse la chambre, il y a des endroits qui m'attendent et qui demandent mon intérêt. Pourtant, ça ne suffira pas, quelques choses de plus vaste et de plus grand attend une conclusion",
    trigger: { kind: 'flag', flag: 'age2.flag.allRoomsComplete' },
    minEra: 2,
  },
]
