import { globalGauges } from '@/data/gauges/global'
import type { GaugeCostAffordanceLine, GaugeType } from '@/types/GaugeType'
import type { GaugeCostBag } from '@/types/EventType'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGaugeMaxBonus, getGaugeRateBonus } from '@/engines/improvements/improvementEngine'
import { useImprovementStore } from '@/stores/improvementStore'

export const useGaugeStore = defineStore('gauge', () => {
  const gauges = ref<GaugeType[]>(
    globalGauges.map((g) => ({
      ...g,
      baseMax: g.max,
    })),
  )

  const getGauge = (gaugeSlug: string) => gauges.value.find((g) => g.slug === gaugeSlug)

  const getGaugeMax = (gaugeSlug: string): number => getGauge(gaugeSlug)?.max ?? 0

  /** `true` si le panier contient au moins une jauge avec `quantity > 0`. */
  const hasPositiveGaugeCosts = (costs: GaugeCostBag | undefined): boolean =>
    !!costs?.some(({ quantity }) => quantity > 0)

  /**
   * `true` si les jauges couvrent tous les coûts demandés.
   * Une entrée de `quantity <= 0` est ignorée.
   * Un slug inconnu => coût impayable.
   */
  const canAfford = (costs: GaugeCostBag | undefined): boolean => {
    if (!costs?.length) return true
    for (const { gaugeSlug, quantity } of costs) {
      if (quantity <= 0) continue
      const gauge = getGauge(gaugeSlug)
      if (!gauge || gauge.current < quantity) return false
    }
    return true
  }

  /**
   * Détail affichage : chaque jauge du panier, payabilité ligne par ligne.
   * Agrège les doublons de slug. Pour tooltips / panneaux — pas pour la logique gameplay (`canAfford`).
   */
  const getGaugeCostAffordance = (costs: GaugeCostBag | undefined): GaugeCostAffordanceLine[] => {
    if (!costs?.length) return []

    const totals = new Map<string, number>()
    for (const { gaugeSlug, quantity } of costs) {
      if (quantity <= 0) continue
      totals.set(gaugeSlug, (totals.get(gaugeSlug) ?? 0) + quantity)
    }

    const lines: GaugeCostAffordanceLine[] = []
    for (const [gaugeSlug, quantity] of totals) {
      const gauge = getGauge(gaugeSlug)
      const owned = gauge?.current ?? 0
      lines.push({
        gaugeSlug,
        quantity,
        owned,
        canAfford: gauge != null && owned >= quantity,
      })
    }
    return lines
  }

  const getGaugeRates = () => {
    const improvements = useImprovementStore().improvements
    gauges.value.forEach((gauge) => {
      const bonus = getGaugeRateBonus(improvements, gauge.slug)
      gauge.finalRegenRate = gauge.regenRate + bonus
    })
  }

  const recomputeGaugeCaps = () => {
    gauges.value.forEach((gauge) => {
      const base = gauge.baseMax ?? gauge.max
      if (gauge.baseMax == null) gauge.baseMax = base
      const bonus = getGaugeMaxBonus(useImprovementStore().improvements, gauge.slug)
      gauge.max = base + bonus
      if (gauge.current > gauge.max) {
        gauge.current = gauge.max
      }
    })
  }

  const getGaugeQuantity = (gaugeSlug: string): number => getGauge(gaugeSlug)?.current ?? 0

  const updateGauge = (gaugeSlug: string, amount: number) => {
    const gauge = gauges.value.find((g) => g.slug === gaugeSlug)
    if (!gauge) return
    gauge.current = Math.max(0, Math.min(gauge.current + amount, getGaugeMax(gaugeSlug)))
  }

  const addGauge = (gaugeSlug: string, amount: number) => {
    if (amount <= 0) return
    updateGauge(gaugeSlug, amount)
  }

  const trySpendGauge = (gaugeSlug: string, quantity: number): boolean => {
    if (quantity <= 0) return true
    const gauge = gauges.value.find((g) => g.slug === gaugeSlug)
    if (!gauge || gauge.current < quantity) return false
    gauge.current -= quantity
    return true
  }

  const regenGauges = (dt: number) => {
    if (dt <= 0) return
    gauges.value.forEach((gauge) => {
      const amountToRegen = gauge.finalRegenRate * dt
      if (amountToRegen !== 0) {
        updateGauge(gauge.slug, amountToRegen)
      }
    })
  }

  const initializeGauges = () => {
    //
  }

  return {
    gauges,
    getGauge,
    getGaugeRates,
    recomputeGaugeCaps,
    hasPositiveGaugeCosts,
    canAfford,
    getGaugeCostAffordance,
    getGaugeQuantity,
    updateGauge,
    addGauge,
    trySpendGauge,
    getGaugeMax,
    regenGauges,
    initializeGauges,
  }
})
