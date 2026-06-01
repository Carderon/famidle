<template>
  <section class="h-full">
    <header class="mb-4">
      <p class="text-xs uppercase tracking-[0.3em] text-gray-500">Production</p>
      <h2 class="text-2xl font-bold text-black dark:text-white">Bâtiments</h2>
    </header>

    <ul
      class="divide-y divide-gray-300 rounded-lg border border-gray-300 dark:divide-neutral-600 dark:border-neutral-600"
    >
      <li
        v-for="building in buildings"
        :key="building.id"
        class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
      >
        <span class="font-medium text-black dark:text-white">{{ building.name }}</span>
        <span v-if="building.detail" class="text-sm text-gray-600 dark:text-gray-400">{{ building.detail }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBuildingStore } from '@/stores/buildingStore'

defineOptions({ name: 'BuildingList' })

const buildingStore = useBuildingStore()
const { buildings } = storeToRefs(buildingStore)
</script>
