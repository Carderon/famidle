import type { EventType } from '@/types/EventType'

/** +1 à chaque event « pièce terminée » ; à 6 → intro lanterne. */
export const AGE2_ROOMS_COMPLETE_COUNTER = 'age2.counter.era2RoomsComplete'

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
      { kind: 'incrementCounter', counter: AGE2_ROOMS_COMPLETE_COUNTER },
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
      { kind: 'incrementCounter', counter: AGE2_ROOMS_COMPLETE_COUNTER },
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
      { kind: 'incrementCounter', counter: AGE2_ROOMS_COMPLETE_COUNTER },
    ],
  },
  {
    id: 'age2.event.endWorkshop',
    title: 'L’atelier est prêt',
    description:
      'Les murs tiennent, le sol est plat. Il reste à y installer ce qui fera à nouveau tourner les métiers.',
    trigger: { kind: 'counter', counter: 'age2.counter.workshopTilesRepaired', atLeast: 32 },
    minEra: 2,
    effects: [
      { kind: 'log', message: 'L’atelier est prêt à recevoir le métier à tisser.' },
      { kind: 'setFlag', flag: 'age2.flag.workshopComplete', value: true },
      { kind: 'incrementCounter', counter: AGE2_ROOMS_COMPLETE_COUNTER },
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
      { kind: 'incrementCounter', counter: AGE2_ROOMS_COMPLETE_COUNTER },
    ],
  },
  {
    id: 'age2.event.endLaboratory',
    title: 'Le laboratoire est prêt',
    description:
      'Les vitrines tiennent, les alambics sont à leur place. Enfin un endroit où extraire ce qui brille encore sous la poussière.',
    trigger: { kind: 'counter', counter: 'age2.counter.laboratoryTilesRepaired', atLeast: 8 },
    minEra: 2,
    effects: [
      {
        kind: 'log',
        message: 'Le laboratoire est opérationnel : vous pouvez récolter les cristaux.',
      },
      { kind: 'setFlag', flag: 'age2.flag.laboratoryComplete', value: true },
      { kind: 'setFlag', flag: 'age2.flag.canGatherCrystal', value: true },
      { kind: 'incrementCounter', counter: AGE2_ROOMS_COMPLETE_COUNTER },
    ],
  },
  {
    id: 'age2.event.allRoomsComplete',
    title: 'Toutes les pièces sont prêtes',
    description:
      'Les murs tiennent, les sols sont stables. Au bord du jardin, l’emplacement d’une vieille lanterne se devine encore, un socle de pierre, un crochet rouillé. Si vous la reconstruisez et l’allumez, peut-être verront-elles la maison depuis loin.',
    trigger: { kind: 'counter', counter: AGE2_ROOMS_COMPLETE_COUNTER, atLeast: 6 },
    minEra: 2,
    effects: [
      {
        kind: 'log',
        message:
          'La maison est reconstruite. Il reste une lanterne à ériger au jardin, pour guider ceux qui reviendraient.',
      },
      { kind: 'setFlag', flag: 'age2.flag.allRoomsComplete', value: true },
    ],
    choices: [
      {
        id: 'lantern',
        label: 'Je m’en occuperai',
        description: 'Verre, cristaux, bois, et une flamme qui tienne la nuit.',
        effects: [],
      },
    ],
  },
  {
    id: 'age2.event.lanternLit',
    title: 'Une petite lumière',
    description: 'Je laisserais une petite lumière allumée pour que vous retrouviez votre chemin.',
    trigger: { kind: 'flag', flag: 'age2.flag.lanternLit' },
    minEra: 2,
    effects: [
      {
        kind: 'log',
        message:
          'La flamme vacille, mais elle tient. Quelque part, peut-être, sera-t-elle visible.',
      },
    ],
    choices: [
      {
        id: 'ack',
        label: 'Je laisserai la lumière allumée',
        description: 'Pour qu’ils sachent où revenir.',
        effects: [],
      },
    ],
  },
  {
    id: 'age2.event.demoThankYou',
    title: 'Fin de la démo',
    description:
      'Merci d’avoir joué à la démo. L’âge 3 n’est pas encore disponible, la maison, elle, commence à retrouver sa forme.',
    trigger: { kind: 'flag', flag: 'age2.flag.demoEndRequested' },
    minEra: 2,
    effects: [
      {
        kind: 'log',
        message: 'Merci d’avoir joué à la démo. À bientôt pour la suite.',
      },
    ],
    choices: [
      {
        id: 'close',
        label: 'Continuer à explorer',
        description: 'La partie reste ouverte ; seule la suite de l’histoire attend.',
        effects: [],
      },
    ],
  },
]
