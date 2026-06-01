<template>
  <div class="flex max-w-2xl flex-col gap-4 h-full">
    <header>
      <h2 class="text-lg font-semibold text-black dark:text-white">Journal intime</h2>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Fragments qui s’empilent au fil de ce que vous vivez.
      </p>
    </header>

    <ul v-if="entries.length" class="flex flex-col gap-6 border-l border-amber-200/60 pl-4 dark:border-amber-900/50">
      <li v-for="entry in entries" :key="entry.id" class="relative">
        <span
          class="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-amber-400/80 bg-amber-100 dark:border-amber-600 dark:bg-amber-950"
          aria-hidden="true" />
        <p v-if="entry.title" class="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200/90">
          {{ entry.title }}
        </p>
        <p class="mt-1 whitespace-pre-wrap text-sm italic leading-relaxed text-gray-800 dark:text-gray-200">
          {{ entry.body }}
        </p>
      </li>
    </ul>

    <p v-else class="text-sm italic text-gray-500 dark:text-gray-400">
      Encore vide. Avancez un peu : les pages se découvrent seules.
    </p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useJournalStore } from '@/stores/journalStore'

defineOptions({ name: 'JournalPanel' })

const journalStore = useJournalStore()
const { unlockedEntries: entries } = storeToRefs(journalStore)
</script>
