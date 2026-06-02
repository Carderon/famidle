import { globalGauges } from '@/data/gauges/global'
import type { GaugeType } from '@/types/GaugeType'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGaugeMaxBonus } from '@/engines/improvements/improvementEngine'
import { useImprovementStore } from '@/stores/improvementStore'

export const useGaugeStore = defineStore('gauge', () => {
  const gauges = ref<GaugeType[]>(
    globalGauges.map((g) => ({
      ...g,
      baseMax: g.max,
    })),
  )

  const getGaugeMax = (gaugeSlug: string): number => {
    return gauges.value.find((g) => g.slug === gaugeSlug)?.max ?? 0
  }

  const getGaugeRates = () => {
    gauges.value.forEach((gauge) => {
      const improvementEffect = 0
      gauge.finalRegenRate = gauge.regenRate + improvementEffect
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

  const getGaugeQuantity = (gaugeSlug: string): number => {
    return gauges.value.find((g) => g.slug === gaugeSlug)?.current ?? 0
  }

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
    getGaugeRates,
    recomputeGaugeCaps,
    getGaugeQuantity,
    updateGauge,
    addGauge,
    trySpendGauge,
    getGaugeMax,
    regenGauges,
    initializeGauges,
  }
})
