<template>
  <template v-for="(line, index) in lines" :key="line.resourceSlug">
    <span v-if="index > 0"> · </span>
    <span :class="line.canAfford ? affordableClass : unaffordableClass">
      -{{ line.quantity }} {{ line.label }}
    </span>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useResourceStore } from '@/stores/resourceStore'
import type { ResourceCostBag } from '@/types/ResourceType'

defineOptions({ name: 'ResourceCostLines' })

const props = withDefaults(
  defineProps<{
    costs?: ResourceCostBag
    affordableClass?: string
    unaffordableClass?: string
  }>(),
  {
    affordableClass: 'text-amber-200',
    unaffordableClass: 'text-red-300',
  },
)

const resourceStore = useResourceStore()
const { resources } = storeToRefs(resourceStore)

const lines = computed(() => {
  void resources.value
  return resourceStore.getResourceCostAffordance(props.costs).map((line) => ({
    ...line,
    label: resourceStore.getResource(line.resourceSlug)?.name ?? line.resourceSlug,
  }))
})
</script>
