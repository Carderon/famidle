import type { ImprovementType } from '@/types/ImprovementType'

export const age2Improvements: ImprovementType[] = [
  {
    slug: 'age2.improvement.storageShed',
    name: 'Abri de stockage',
    category: 'production',
    sortOrder: 3,
    buildTime: 12,
    isBought: false,
    isVisible: false,
    conditions: { requiredImprovement: 'age1.improvement.getToEra2' },
    costs: [
      { resourceSlug: 'age1.resource.wood', quantity: 20 },
      { resourceSlug: 'age1.resource.stone', quantity: 10 },
    ],
    effects: [
      { kind: 'resourceMaxBonus', resourceSlug: 'age1.resource.wood', amount: 40 },
      { kind: 'resourceMaxBonus', resourceSlug: 'age1.resource.stone', amount: 40 },
      {
        kind: 'log',
        message: 'Un abri rudimentaire : le bois et la pierre trouvent plus de place.',
      },
    ],
    flavourText: "Planches empilées, blocs rangés - Comme la promesse d'un ordre nouveau",
  },
  {
    slug: 'age2.improvement.buildWell',
    name: 'Construire un puits',
    category: 'production',
    sortOrder: 5,
    buildTime: 20,
    isBought: false,
    isVisible: false,
    conditions: { requiredFlag: 'age2.flag.gardenComplete' },
    costs: [
      { resourceSlug: 'age1.resource.wood', quantity: 12 },
      { resourceSlug: 'age1.resource.stone', quantity: 8 },
    ],
    effects: [
      { kind: 'setFlag', flag: 'age2.flag.wellBuilt', value: true },
      { kind: 'setFlag', flag: 'age2.flag.waterUnlocked', value: true },
      {
        kind: 'log',
        message: 'Le puits est creusé : l’eau remonte enfin à la surface.',
      },
    ],
    flavourText: "Creuser plus profond que les ruines, jusqu'à ce qu'une nappe tiède émerge.",
  },
  {
    slug: 'age2.improvement.plantFiberGathering',
    name: 'Arroser le jardin',
    category: 'production',
    sortOrder: 10,
    linkedRoomId: 'age2.room.garden',
    buildTime: 10,
    isBought: false,
    isVisible: false,
    conditions: { requiredFlag: 'age2.flag.wellBuilt' },
    costs: [{ resourceSlug: 'age2.resource.water', quantity: 25 }],
    effects: [
      { kind: 'setFlag', flag: 'age2.flag.canGatherPlantFiber', value: true },
      {
        kind: 'log',
        message: 'Le jardin reprend vie : vous pouvez récolter la fibre végétale.',
      },
    ],
    flavourText: 'Le jardin a besoin d’eau pour que les premières pousses deviennent récoltables.',
  },
  {
    slug: 'age2.improvement.loom',
    name: 'Installer le métier à tisser',
    category: 'production',
    sortOrder: 15,
    linkedRoomId: 'age2.room.workshop',
    buildTime: 15,
    isBought: false,
    isVisible: false,
    conditions: { requiredFlag: 'age2.flag.workshopComplete' },
    costs: [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 15 },
    ],
    effects: [
      { kind: 'setFlag', flag: 'age2.flag.canGatherCloth', value: true },
      {
        kind: 'log',
        message: 'Le métier est en place : vous pouvez tisser à nouveau.',
      },
    ],
    flavourText:
      'L’atelier retrouve son cœur — fil, cadre, pédale. Le tissu ne viendra plus du crassier.',
  },
  {
    slug: 'age2.improvement.glassRecipe',
    name: 'Recette du verre',
    category: 'production',
    sortOrder: 20,
    linkedRoomId: 'age2.room.library',
    buildTime: 12,
    isBought: false,
    isVisible: false,
    conditions: { requiredFlag: 'age2.flag.libraryComplete' },
    costs: [
      { resourceSlug: 'age1.resource.wood', quantity: 10 },
      { resourceSlug: 'age2.resource.plantFiber', quantity: 15 },
    ],
    effects: [
      { kind: 'setFlag', flag: 'age2.flag.glassRecipeKnown', value: true },
      {
        kind: 'log',
        message: 'Vous maîtrisez la recette : il faudra un bas fourneau pour fondre le sable.',
      },
    ],
    flavourText:
      'Sable, chaleur, soufflage — la bibliothèque garde les proportions ; l’atelier devra fournir la flamme.',
  },
  {
    slug: 'age2.improvement.blastFurnace',
    name: 'Installer un bas fourneau',
    category: 'production',
    sortOrder: 22,
    linkedRoomId: 'age2.room.workshop',
    buildTime: 18,
    isBought: false,
    isVisible: false,
    conditions: {
      requiredImprovement: 'age2.improvement.glassRecipe',
      requiredFlag: 'age2.flag.workshopComplete',
    },
    costs: [
      { resourceSlug: 'age1.resource.stone', quantity: 30 },
      { resourceSlug: 'age1.resource.wood', quantity: 20 },
      { resourceSlug: 'age1.resource.cloth', quantity: 8 },
    ],
    effects: [
      { kind: 'setFlag', flag: 'age2.flag.canCraftGlass', value: true },
      {
        kind: 'log',
        message: 'Le bas fourneau chauffe : vous pouvez souffler le verre.',
      },
    ],
    flavourText: 'Boue, fibre, tuyère, soufflet . La recette prend enfin corps dans l’atelier.',
  },
]
