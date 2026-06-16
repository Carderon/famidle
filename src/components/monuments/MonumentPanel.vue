<template>
  <section v-if="monument" class="relative h-full">
    <header class="z-10 mb-4 flex items-start justify-between gap-4 h-[200px]">
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-[0.3em] text-gray-500">
          {{ monument.name }}
        </p>
        <h2 class="text-3xl font-bold uppercase text-black dark:text-white">
          {{ activeRoom?.name ?? '—' }}
        </h2>
      </div>

      <div v-if="useRoomPlan" id="monument-map-panel" role="dialog" aria-modal="true"
        aria-labelledby="monument-map-title" class="" :class="{
          'absolute right-0 top-0 z-50 px-10 py-10 overflow-y-auto rounded-xl border border-gray-400 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:border-neutral-600 dark:bg-neutral-900/95': isMapOpen,
          'flex shrink-0 flex-col items-end gap-2': !isMapOpen
        }" @click.stop>
        <button type="button"
          class="z-[60] inline-flex items-center gap-1.5 rounded-lg border border-gray-400 bg-white px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-black transition hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
          :class="{ 'absolute left-[8px] top-[8px] width-[7.5em]': isMapOpen }" :aria-expanded="isMapOpen"
          aria-controls="monument-map-panel" @click="handleToggleMap">
          <svg class="h-4 w-4 shrink-0 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 20l-5.447-2.724A2 2 0 014 15.382V6.618a2 2 0 011.553-1.947L12 2l6.447 2.671A2 2 0 0120 6.618v8.764a2 2 0 01-1.553 1.894L12 20l-3-1.5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v17.5M12 2l6.447 2.671M12 2L5.553 4.671" />
          </svg>
          {{ isMapOpen ? 'Fermer' : 'Carte' }}
        </button>
        <p v-if="isMapOpen" id="monument-map-title"
          class="mb-3 text-right text-[10px] uppercase tracking-[0.25em] text-gray-500">
          Plan — {{ monument.name }}
        </p>
        <MonumentMinimap :monument="monument" :active-room="activeRoom" :size="isMapOpen ? 'large' : 'small'"
          @select-room="handleSelectRoom" />
      </div>
    </header>

    <transition name="fade">
      <div v-if="useRoomPlan && isMapOpen" class="absolute inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        aria-hidden="true" @click="handleCloseMap" />
    </transition>

    <Room v-if="activeRoom" :monument-id="monumentId" :room-id="activeRoom.id" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMonumentStore } from '@/stores/monumentStore'
import Room from '@/components/monuments/Room.vue'
import MonumentMinimap from '@/components/monuments/MonumentMinimap.vue'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'MonumentPanel' })

const props = defineProps<{ monumentId: string }>()

const monumentStore = useMonumentStore()
const monument = computed(() => monumentStore.getMonument(props.monumentId))
const { activeRoomId } = storeToRefs(monumentStore)
const isMapOpen = ref(false)

const activeRoom = computed(() => {
  const m = monument.value
  if (!m) return null
  const wanted = activeRoomId.value ?? m.rooms[0]?.id
  return m.rooms.find((r) => r.id === wanted) ?? m.rooms[0] ?? null
})

const useRoomPlan = computed(() => {
  const layout = monument.value?.roomLayout
  return Boolean(layout?.length && layout.some((row) => row.length > 0))
})

const handleSelectRoom = (roomId: string) => {
  activeRoomId.value = roomId
  isMapOpen.value = false
}

const handleToggleMap = () => {
  isMapOpen.value = !isMapOpen.value
}

const handleCloseMap = () => {
  isMapOpen.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.map-expand-enter-active,
.map-expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top right;
}

.map-expand-enter-from,
.map-expand-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
