import type { EventType } from '@/types/EventType'

/**
 * Ère 2 — bâtiments producteurs, extensions (à brancher quand le data design est prêt).
 * Utiliser `minEra: 2` (ou `getEra() >= 2` via perso) pour cibler ces événements.
 */
export const age2Events: EventType[] = [
  {
    id: 'age2.event.endGarden',
    title: 'Le jardin est prêt',
    description:
      "Le jardin est prêt : de large zone de terre, vide, à l'aspect stérile. Vous y avez semé quelques graines et attendu les premiers résultats.",
    trigger: { kind: 'counter', counter: 'age2.counter.gardenTilesRepaired', atLeast: 9 },
    minEra: 2,
    effects: [
      { kind: 'log', message: 'Le jardin est prêt.' },
      { kind: 'setFlag', flag: 'age2.flag.gardenComplete', value: true },
    ],
  },
  {
    id: 'age2.event.endWorkshop',
    title: 'L’atelier est prêt',
    description:
      'Les murs tiennent, le sol est plat. Il reste à y installer ce qui fera à nouveau tourner les métiers.',
    trigger: { kind: 'counter', counter: 'age2.counter.workshopTilesRepaired', atLeast: 20 },
    minEra: 2,
    effects: [
      { kind: 'log', message: 'L’atelier est prêt à recevoir le métier à tisser.' },
      { kind: 'setFlag', flag: 'age2.flag.workshopComplete', value: true },
    ],
  },
  {
    id: 'age2.event.endLibrary',
    title: 'La bibliothèque est prête',
    description:
      'Les étagères tiennent enfin. Entre deux reliures effondrées, une feuille décrit comment fondre le sable en verre.',
    trigger: { kind: 'counter', counter: 'age2.counter.libraryTilesRepaired', atLeast: 8 },
    minEra: 2,
    effects: [
      { kind: 'log', message: 'Dans la bibliothèque, vous trouvez une recette du verre.' },
      { kind: 'setFlag', flag: 'age2.flag.libraryComplete', value: true },
    ],
  },
]
