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

    <section v-if="acquiredImprovements.length && isFullHUDShown"
      class="space-y-3 border-t border-gray-300 pt-4 dark:border-neutral-600">
      <h3 class="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
        Acquis
      </h3>
      <ul class="space-y-2 flex gap-2 flex-wrap flex-row items-end">
        <li v-for="item in acquiredImprovements" :key="item.slug"
          class="rounded-md border border-gray-400/60 bg-neutral-800/40 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-900/50 group relative hover:bg-neutral-700">
          <p class="text-sm font-medium text-white">{{ item.name }}</p>
          <p v-if="item.roomLabel" class="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
            {{ item.roomLabel }}
          </p>
          <GameTooltip placement="below">
            <p v-if="item.flavourText" class="mt-1 text-[11px] italic">
              {{ item.flavourText }}
            </p>
          </GameTooltip>
        </li>
      </ul>
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
const gameState = useGameStateStore()

const isFullHUDShown = computed(() => gameState.getFlag('ui.flag.fullHUDShown'));

const improvementStore = useImprovementStore()
const monumentStore = useMonumentStore()

const improvementGroups = computed(() => improvementStore.visibleImprovementsByCategory())

const acquiredImprovements = computed(() => {
  return improvementStore.boughtImprovements().map((imp) => {
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
    return { slug: imp.slug, name: imp.name, flavourText: imp.flavourText, roomLabel }
  })
})
</script>
