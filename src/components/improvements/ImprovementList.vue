<template>
  <div class="flex-1 h-full space-y-4">
    <h2 v-if="isFullHUDShown" class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
      Améliorations
    </h2>

    <section v-for="group in improvementGroups" :key="group.category" class="space-y-3"
      :class="group.category === 'era' ? 'rounded-lg border border-amber-500/35 bg-amber-950/15 px-3 py-3 dark:border-amber-400/25 dark:bg-amber-950/25' : ''">
      <h3 v-if="isFullHUDShown" class="text-[11px] font-semibold uppercase tracking-[0.15em]" :class="group.category === 'era'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-gray-500 dark:text-gray-400'
        ">
        {{ group.label }}
      </h3>
      <ul class="flex flex-row flex-wrap items-start gap-3">
        <li v-for="improvement in group.improvements" :key="improvement.slug">
          <ImprovementButton :improvement="improvement" />
        </li>
      </ul>
    </section>

    <section v-if="acquiredGroups.length && isFullHUDShown"
      class="space-y-3 border-t border-gray-300 pt-4 dark:border-neutral-600">
      <h3 class="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
        Acquis
      </h3>
      <div v-for="group in acquiredGroups" :key="group.category" class="space-y-2">
        <h4 class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-neutral-500">
          {{ group.label }}
        </h4>
        <ul class="flex flex-row flex-wrap items-end gap-2">
          <li v-for="item in group.items" :key="item.slug"
            class="group relative rounded-md border border-gray-400/60 bg-neutral-800/40 px-3 py-2 hover:bg-neutral-700 dark:border-neutral-600 dark:bg-neutral-900/50">
            <p class="text-sm font-medium text-white">{{ item.name }}</p>
            <p v-if="item.roomLabel" class="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
              {{ item.roomLabel }}
            </p>
            <GameTooltip v-if="item.bonus || item.flavourText" placement="below">
              <p class="text-[11px] italic text-white">{{ item.flavourText }}</p>
              <p class="mt-1 text-[11px] italic text-orange-400/95">{{ item.bonus }}</p>
            </GameTooltip>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useImprovementStore } from '@/stores/improvementStore'
import { useMonumentStore } from '@/stores/monumentStore'
import ImprovementButton from '@/components/improvements/ImprovementButton.vue'
import GameTooltip from '@/components/ui/GameTooltip.vue'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useResourceStore } from '@/stores/resourceStore'
import { formatAcquiredImprovementBonus } from '@/utils/improvementEffectLabels'
import { IMPROVEMENT_CATEGORY_LABELS, IMPROVEMENT_CATEGORY_ORDER } from '@/types/ImprovementType'
import type { ImprovementCategory } from '@/types/ImprovementType'

const gameState = useGameStateStore()

const isFullHUDShown = computed(() => gameState.getFlag('ui.flag.fullHUDShown'));

const improvementStore = useImprovementStore()
const monumentStore = useMonumentStore()
const resourceStore = useResourceStore()

const improvementGroups = computed(() => improvementStore.visibleImprovementsByCategory())

const acquiredGroups = computed(() => {
  const byCategory = new Map<ImprovementCategory, { slug: string; name: string; flavourText?: string; roomLabel?: string; bonus: string }[]>()

  for (const imp of improvementStore.boughtImprovements()) {
    let roomLabel: string | undefined
    if (imp.linkedRoomId) {
      for (const monument of monumentStore.monuments) {
        const room = monument.rooms.find((r) => r.id === imp.linkedRoomId)
        if (room) {
          roomLabel = room.name
          break
        }
      }
    }
    const bonus = formatAcquiredImprovementBonus(imp.effects, {
      resourceName: (slug) => resourceStore.getResource(slug)?.name,
    })
    const entry = { slug: imp.slug, name: imp.name, flavourText: imp.flavourText ?? '', roomLabel, bonus }
    const list = byCategory.get(imp.category) ?? []
    list.push(entry)
    byCategory.set(imp.category, list)
  }

  return IMPROVEMENT_CATEGORY_ORDER.map((category) => ({
    category,
    label: IMPROVEMENT_CATEGORY_LABELS[category],
    items: byCategory.get(category) ?? [],
  })).filter((group) => group.items.length > 0)
})
</script>
