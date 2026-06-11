import type { ResourceType } from '@/types/ResourceType'

/**
 * Ressources ère 2.
 *
 * - **Eau** : visible après `age2.improvement.buildWell` (`age2.flag.waterUnlocked`).
 * - **Fibre végétale** : après arrosage du jardin (`age2.flag.canGatherPlantFiber`).
 * - **Verre** : après fourneau (`age2.flag.canCraftGlass`).
 * - **Cristaux** : après laboratoire terminé (`age2.flag.canGatherCrystal`).
 */
export const age2Resources: ResourceType[] = [
  {
    slug: 'age2.resource.water',
    name: 'Eau',
    quantity: 0,
    baseRate: 0,
    max: 80,
    finalRate: 0,
    flavourText: 'Tirée du puits une cruche à la fois, chaque goutte compte.',
    conditions: { requiredFlag: 'age2.flag.waterUnlocked' },
    isVisible: false,
  },
  {
    slug: 'age2.resource.plantFiber',
    name: 'Fibre végétale',
    quantity: 0,
    baseRate: 0,
    max: 100,
    finalRate: 0,
    flavourText: 'Tiges séchées, écorces, filaments, ce que le jardin rend enfin récoltable.',
    conditions: { requiredFlag: 'age2.flag.canGatherPlantFiber' },
    isVisible: false,
  },
  {
    slug: 'age2.resource.glass',
    name: 'Verre',
    quantity: 0,
    baseRate: 0,
    max: 40,
    finalRate: 0,
    flavourText: 'Bulles figées, bords tranchants, chaque lame compte pour les vitrines du laboratoire.',
    conditions: { requiredFlag: 'age2.flag.canCraftGlass' },
    isVisible: false,
  },
  {
    slug: 'age2.resource.crystal',
    name: 'Cristaux',
    quantity: 0,
    baseRate: 0,
    max: 24,
    finalRate: 0,
    flavourText:
      'Facettes froides, presque lumière, on ne les trouve qu’une fois le laboratoire rendu à neuf.',
    conditions: { requiredFlag: 'age2.flag.canGatherCrystal' },
    isVisible: false,
  },
]
