<template>
  <div class="relative flex h-full min-h-0 flex-col xl:p-4 border-l border-gray-300 dark:border-gray-600">
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 bg-gradient-to-t from-white to-transparent dark:from-gray-800 xl:block"
      aria-hidden="true" />

    <header v-if="showLegend"
      class="mb-2 hidden shrink-0 flex-wrap gap-x-3 gap-y-1 border-b border-neutral-300/60 pb-2 dark:border-neutral-700 xl:flex">
      <span v-for="kind in legendKinds" :key="kind"
        class="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide" :class="LOG_KIND_STYLES[kind].tag">
        <span class="h-1.5 w-1.5 rounded-full" :class="LOG_KIND_STYLES[kind].dot" />
        {{ LOG_KIND_LABELS[kind] }}
      </span>
    </header>

    <ul v-if="displayedLogs.length" class="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1 text-xs leading-snug"
      :class="showLegend ? '' : 'pt-1'">
      <li v-for="entry in displayedLogs" :key="entry.id"
        class="group flex items-baseline gap-2 rounded px-1 py-0.5 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50">
        <time v-if="isFullHUDShown"
          class="shrink-0 font-mono text-[10px] tabular-nums text-neutral-500 dark:text-neutral-500"
          :datetime="`${entry.simAt}s`" :title="`Temps sim : ${formatLogSimTime(entry.simAt)}`">
          {{ formatLogSimTime(entry.simAt) }}
        </time>
        <span class="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
          :class="isFullHUDShown ? LOG_KIND_STYLES[entry.kind].dot : 'hidden'" :title="LOG_KIND_LABELS[entry.kind]" />
        <p class="min-w-0 flex-1" :class="isFullHUDShown ? LOG_KIND_STYLES[entry.kind].message : 'text-white'">
          {{ entry.message }}
        </p>
      </li>
    </ul>

    <p v-if="!displayedLogs.length" class="py-4 text-center text-[11px] text-neutral-500 dark:text-neutral-500">
      Le journal est vide.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLogStore } from '@/stores/logStore'
import { LOG_KIND_LABELS, LOG_KIND_ORDER, LOG_KIND_STYLES } from '@/data/logs/kindMeta'
import { formatLogSimTime } from '@/utils/logFormat'
import type { LogKind } from '@/types/LogType'
import { useGameStateStore } from '@/stores/gameStateStore'

const props = withDefaults(
  defineProps<{
    /** Affiche la légende des catégories (panneau central). */
    showLegend?: boolean
  }>(),
  { showLegend: false },
)

const gameState = useGameStateStore()
const isFullHUDShown = computed(() => gameState.getFlag('ui.flag.fullHUDShown'));

const logStore = useLogStore()
const { logs } = storeToRefs(logStore)

/** Les plus récents en haut. */
const displayedLogs = computed(() => logs.value.slice().reverse())

const legendKinds = LOG_KIND_ORDER.filter((k) => k !== 'gameplay') as LogKind[]
</script>
