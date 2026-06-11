/** Une ligne de coût jauge pour l’affichage (niveau actuel vs besoin). */
export type GaugeCostAffordanceLine = {
  gaugeSlug: string
  quantity: number
  owned: number
  canAfford: boolean
}

export type GaugeType = {
  name: string
  slug: string
  current: number
  /** Plafond de base (data). `max` est recalculé avec les bonus d’améliorations. */
  baseMax?: number
  max: number
  regenRate: number
  finalRegenRate: number
  flavourText: string
  color: string
}
