import type { EventType } from '@/types/EventType'

/**
 * Ère 2 — un event `once` par pièce terminée (compteur tuiles réparées).
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
    id: 'age2.event.endBathroom',
    title: 'Les bains sont prêts',
    description:
      'Les bains sont prêts : l’eau chaude et la pierre polie invitent à retrouver son souffle.',
    trigger: { kind: 'counter', counter: 'age2.counter.bathroomTilesRepaired', atLeast: 4 },
    minEra: 2,
    effects: [
      { kind: 'log', message: 'Les bains sont prêts.' },
      { kind: 'setFlag', flag: 'age2.flag.bathroomComplete', value: true },
    ],
  },
  {
    id: 'age2.event.endKitchen',
    title: 'La cuisine est prête',
    description: "La cuisine est prête, son utilité n'est pas encore claire.",
    trigger: { kind: 'counter', counter: 'age2.counter.kitchenTilesRepaired', atLeast: 10 },
    minEra: 2,
    effects: [
      { kind: 'log', message: 'La cuisine est là, immobile.' },
      { kind: 'setFlag', flag: 'age2.flag.kitchenComplete', value: true },
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
  {
    id: 'age2.event.endLaboratory',
    title: 'Le laboratoire est prêt',
    description:
      'Les vitrines tiennent, les alambics sont à leur place. Enfin un endroit où extraire ce qui brille encore sous la poussière.',
    trigger: { kind: 'counter', counter: 'age2.counter.laboratoryTilesRepaired', atLeast: 9 },
    minEra: 2,
    effects: [
      {
        kind: 'log',
        message: 'Le laboratoire est opérationnel : vous pouvez récolter les cristaux.',
      },
      { kind: 'setFlag', flag: 'age2.flag.laboratoryComplete', value: true },
      { kind: 'setFlag', flag: 'age2.flag.canGatherCrystal', value: true },
    ],
  },
]
