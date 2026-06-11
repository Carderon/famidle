<template>
  <template v-for="(line, index) in lines" :key="line.gaugeSlug">
    <span v-if="index > 0"> · </span>
    <span :class="line.canAfford ? affordableClass : unaffordableClass">
      -{{ line.quantity }} {{ line.label }}
    </span>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGaugeStore } from '@/stores/gaugeStore'
import type { GaugeCostBag } from '@/types/EventType'

defineOptions({ name: 'GaugeCostLines' })

const props = withDefaults(
  defineProps<{
    costs?: GaugeCostBag
    affordableClass?: string
    unaffordableClass?: string
  }>(),
  {
    affordableClass: 'text-amber-200',
    unaffordableClass: 'text-red-300',
  },
)

const gaugeStore = useGaugeStore()
const { gauges } = storeToRefs(gaugeStore)

const lines = computed(() => {
  void gauges.value
  return gaugeStore.getGaugeCostAffordance(props.costs).map((line) => ({
    ...line,
    label: gaugeStore.getGauge(line.gaugeSlug)?.name.substring(0, 3) + '.' || line.gaugeSlug,
  }))
})
</script>
