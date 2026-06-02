import type { ActivityType } from '@/types/ActivityType'

/**
 * Activités âge 1 (BRIEF) — déclaratif : coûts, conditions, cooldown, effets.
 */
export const age1Activities: ActivityType[] = [
  {
    slug: 'age1.activity.gatherWood',
    name: 'Couper du bois',
    category: 'gather',
    sortOrder: 10,
    kind: 'instant',
    flavourText: "À l'orée de la forêt, du petit bois attend.",
    cooldownSeconds: 8,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 6 }],
    conditions: { requiredFlag: 'ui.flag.activityShown', maxEra: 1 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age1.resource.wood', amount: 5 },
      { kind: 'logOnce', message: "À l'orée de la forêt, vous ramassez du bois." },
    ],
    isVisible: false,
  },
  {
    slug: 'age1.activity.gatherStone',
    name: 'Récupérer de la pierre',
    category: 'gather',
    sortOrder: 20,
    kind: 'instant',
    flavourText: 'Un mur effondré laisse des gravats récupérables.',
    cooldownSeconds: 8,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 6 }],
    conditions: { requiredFlag: 'ui.flag.activityShown', maxEra: 1 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age1.resource.stone', amount: 5 },
      { kind: 'logOnce', message: 'Près du mur effondré, vous récupérez de la pierre.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age1.activity.scavenge',
    name: 'Fouiller',
    category: 'gather',
    sortOrder: 30,
    kind: 'instant',
    flavourText: 'Le crassier et la friche recèlent parfois des chutes de tissu.',
    cooldownSeconds: 8,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 6 }],
    conditions: { requiredFlag: 'ui.flag.activityShown', maxEra: 1 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age1.resource.cloth', amount: 5 },
      { kind: 'setFlag', flag: 'age1.flag.firstScavengeDone', value: true },
      { kind: 'logOnce', message: 'Vous fouillez le crassier et récupérez du tissu.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age1.activity.rest',
    name: 'Se reposer',
    category: 'rest',
    sortOrder: 10,
    kind: 'instant',
    flavourText: "Malgrés l'oeuvre en cours, vous finissez par vous reposer un peu.",
    cooldownSeconds: 20,
    conditions: {
      requiredFlag: 'ui.flag.activityShown',
      hiddenWhenFlag: 'game.flag.sleepUnlocked',
    },
    effects: [
      { kind: 'addGauge', gaugeSlug: 'health', amount: 10 },
      { kind: 'addGauge', gaugeSlug: 'stamina', amount: 10 },
      { kind: 'log', message: 'Vous vous reposez un peu. Le corps se détend.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age1.activity.sleep',
    name: 'Dormir',
    category: 'rest',
    sortOrder: 10,
    kind: 'instant',
    flavourText:
      'Quand la nuit passe sur les ruines, le corps accepte enfin de relâcher ce qu’il tenait.',
    cooldownSeconds: 20,
    blocksInterface: true,
    cinematicDurationSeconds: 5,
    cinematicVariant: 'sleep',
    conditions: { requiredFlag: 'game.flag.sleepUnlocked' },
    effects: [
      { kind: 'addGauge', gaugeSlug: 'health', amount: Number.MAX_SAFE_INTEGER },
      { kind: 'addGauge', gaugeSlug: 'stamina', amount: Number.MAX_SAFE_INTEGER },
      { kind: 'incrementCounter', counter: 'age1.counter.nightsSlept', by: 1 },
      { kind: 'toggleFlag', flag: 'age1.flag.isNight' },
      { kind: 'log', message: 'Vous dormez un peu. Le corps se détend.' },
    ],
    isVisible: false,
  },
]
