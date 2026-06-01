<template>
  <div class="flex-1 space-y-4">
    <h2 class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
      Activités
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      Actions du quotidien : récolter, fouiller, se reposer.
    </p>
    <section v-for="group in activityGroups" :key="group.category" class="space-y-3">
      <h3 class="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
        {{ group.label }}
      </h3>
      <ul class="flex flex-row flex-wrap items-start gap-3">
        <li v-for="activity in group.activities" :key="activity.slug">
          <ActivityButton :activity="activity" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ActivityButton from '@/components/activities/ActivityButton.vue'
import { useActivityStore } from '@/stores/activityStore'

const activityStore = useActivityStore()

const activityGroups = computed(() => {
  return activityStore.visibleActivitiesByCategory()
})
</script>
