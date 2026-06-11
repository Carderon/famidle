import type { ActivityType } from '@/types/ActivityType'

/**
 * Activités ère 2 :
 * - **timed** : bois, pierre, tissu (convois / boucle)
 * - **instant** : eau (puits), fibre végétale, plus tard verre & cristaux
 */
export const age2Activities: ActivityType[] = [
  {
    slug: 'age2.activity.timberRun',
    name: 'Couper du bois',
    category: 'gather',
    sortOrder: 10,
    flavourText: 'Partir plus loin demande du temps, mais les chargements sont plus lourds.',
    kind: 'timed',
    durationSeconds: 14,
    cooldownSeconds: 5,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 5 }],
    conditions: { requiredFlag: 'ui.flag.activityShown', minEra: 2 },
    timedStatus: {
      ongoing: 'Vous coupez du bois. Plus vous coupez, plus il y en a.',
      looping: 'Vous travaillez sans relâche. Le chariot revient chargé de bois.',
      stopPending: "Vous prenez le temps d'une pause.",
    },
    effects: [
      { kind: 'addResource', resourceSlug: 'age1.resource.wood', amount: 14 },
      { kind: 'logOnce', message: 'Le chariot revient chargé de bois.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age2.activity.stoneConvoy',
    name: 'Amasser de la pierre',
    category: 'gather',
    sortOrder: 20,
    flavourText:
      "Avec une charette, vous amassez plus de pierre. Pourvus que le tas de gravats n'en finisse pas.",
    kind: 'timed',
    durationSeconds: 18,
    cooldownSeconds: 6,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 6 }],
    conditions: { requiredFlag: 'ui.flag.activityShown', minEra: 2 },
    timedStatus: {
      ongoing: 'Vous amassez de la pierre. Plus vous amassez, plus il y en a.',
      looping: 'Vous travaillez sans relâche. Le chariot revient chargé de pierre.',
      stopPending: "Vous prenez le temps d'une pause.",
    },
    effects: [
      { kind: 'addResource', resourceSlug: 'age1.resource.stone', amount: 16 },
      { kind: 'logOnce', message: 'Les gravats sont triés et le convoi dépose la pierre.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age2.activity.drawWater',
    name: 'Puiser au puits',
    category: 'gather',
    sortOrder: 30,
    kind: 'instant',
    flavourText: 'La corde grince ; l’eau monte lentement, sans hâte.',
    cooldownSeconds: 12,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 5 }],
    conditions: { requiredFlag: 'age2.flag.waterUnlocked', minEra: 2 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age2.resource.water', amount: 8 },
      { kind: 'logOnce', message: 'Vous remontez une cruche d’eau du puits.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age2.activity.gatherPlantFiber',
    name: 'Récolter la fibre',
    category: 'gather',
    sortOrder: 40,
    kind: 'instant',
    flavourText: 'Couper, sécher, trier, un geste qui use vos mains.',
    cooldownSeconds: 10,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 5 }],
    conditions: { requiredFlag: 'age2.flag.canGatherPlantFiber', minEra: 2 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age2.resource.plantFiber', amount: 6 },
      { kind: 'logOnce', message: 'Vous récoltez de la fibre végétale au jardin.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age2.activity.clothWeaving',
    name: 'Tisser',
    category: 'gather',
    sortOrder: 25,
    flavourText: 'Le métier bat la mesure ; le rouleau remplit lentement, sans convoi.',
    kind: 'timed',
    durationSeconds: 16,
    cooldownSeconds: 6,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 5 }],
    costs: [
      { resourceSlug: 'age2.resource.plantFiber', quantity: 4 },
      { resourceSlug: 'age2.resource.water', quantity: 2 },
    ],
    conditions: { requiredFlag: 'age2.flag.canGatherCloth', minEra: 2 },
    timedStatus: {
      ongoing: 'Les fils courent sur le métier.',
      looping: 'En cours, plusieurs rouleaux d’affilée.',
      stopPending: 'Dernier rouleau, puis le métier s’arrête.',
    },
    effects: [
      { kind: 'addResource', resourceSlug: 'age1.resource.cloth', amount: 6 },
      { kind: 'logOnce', message: 'Un rouleau de tissu sort du métier.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age2.activity.craftGlass',
    name: 'Souffler le verre',
    category: 'gather',
    sortOrder: 45,
    kind: 'instant',
    flavourText: 'Chaleur, souffle, patience, rare et fragile',
    cooldownSeconds: 22,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 6 }],
    costs: [
      { resourceSlug: 'age1.resource.stone', quantity: 8 },
      { resourceSlug: 'age2.resource.water', quantity: 6 },
      { resourceSlug: 'age2.resource.plantFiber', quantity: 4 },
    ],
    conditions: { requiredFlag: 'age2.flag.canCraftGlass', minEra: 2 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age2.resource.glass', amount: 3 },
      { kind: 'logOnce', message: 'Une fine lame de verre sort du four.' },
    ],
    isVisible: false,
  },
  {
    slug: 'age2.activity.refineCrystal',
    name: 'Extraire les cristaux',
    category: 'gather',
    sortOrder: 50,
    kind: 'instant',
    flavourText:
      'Lent, méticuleux, sans filet, chaque éclat compte ; on ne précipite pas ce genre de trouvaille.',
    cooldownSeconds: 36,
    gaugeCosts: [{ gaugeSlug: 'stamina', quantity: 7 }],
    costs: [
      { resourceSlug: 'age2.resource.glass', quantity: 3 },
      { resourceSlug: 'age1.resource.stone', quantity: 10 },
      { resourceSlug: 'age2.resource.water', quantity: 8 },
    ],
    conditions: { requiredFlag: 'age2.flag.canGatherCrystal', minEra: 2 },
    effects: [
      { kind: 'addResource', resourceSlug: 'age2.resource.crystal', amount: 2 },
      { kind: 'logOnce', message: 'Quelques cristaux sortent du creuset, rares et nets.' },
    ],
    isVisible: false,
  },
]
