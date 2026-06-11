export type ResourceType = {
  slug: string
  name: string
  quantity: number
  baseRate: number
  baseMax?: number
  max: number
  finalRate: number
  flavourText: string
  conditions: ResourceConditionType
  isVisible: boolean
}

export interface ResourceConditionType {
  /** Le flag `gameState` doit être `true` pour afficher la ressource. */
  requiredFlag?: string
  requiredClass?: string
  requiredSpecialization?: string
  minLevel?: number
  minResourceQuantity?: [{ resourceSlug: string; quantity: number }]
  requiredImprovement?: string
}

export type ResourceCostBag = Readonly<{ resourceSlug: string; quantity: number }[]>

/** Une ligne de coût pour l’affichage (stock vs besoin). */
export type ResourceCostAffordanceLine = {
  resourceSlug: string
  quantity: number
  owned: number
  canAfford: boolean
}
