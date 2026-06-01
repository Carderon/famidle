<template>
  <section v-if="monument" class="h-full">
    <header class="mb-4 flex items-baseline justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-gray-500">Monument</p>
        <h2 class="text-3xl font-bold text-black dark:text-white">{{ monument.name }}</h2>
      </div>
      <div class="text-right text-xs uppercase tracking-wider text-gray-500">
        <div>{{ activeRoom?.name ?? '—' }}</div>
        <div v-if="monumentProgress != null">{{ monumentProgress }}%</div>
      </div>
    </header>
    <div class="flex">
      <div class="w-1/5">
        <nav v-if="useRoomPlan" class="mb-4 grid max-w-md gap-2 w-[20rem] absolute"
          :style="{ gridTemplateColumns: `repeat(${layoutColCount}, minmax(0, 1fr))` }">
          <template v-for="(row, ri) in monument.roomLayout" :key="ri">
            <template v-for="(cell, ci) in row" :key="`${ri}-${ci}`">
              <div v-if="cell === null"
                class="h-[6rem] w-[6rem] rounded-lg border border-dashed border-gray-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900/40"
                aria-hidden="true" />
              <button v-else-if="roomById(cell)" type="button"
                class="flex h-[6rem] w-[6rem] flex-col justify-center items-center rounded-lg border px-3 py-2 text-left text-sm transition"
                :class="cell === activeRoomId
                  ? 'border-neutral-800 bg-neutral-800 text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-gray-400 bg-white text-black hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800'
                  " @click="activeRoomId = cell">
                <span class="font-medium">{{ roomById(cell)!.name }}</span>
                <span class="text-xs opacity-80">{{ roomRepairLabel(cell) }}</span>
              </button>
              <div v-else
                class="flex h-[6rem] w-[6rem] items-center justify-center rounded-lg border border-amber-400 bg-amber-50 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                :title="`Pièce inconnue : ${cell}`">
                ?
              </div>
            </template>
          </template>
        </nav>

        <nav v-else-if="monument.rooms.length > 1" class="mb-4 flex flex-wrap gap-2">
          <button v-for="room in monument.rooms" :key="room.id" type="button"
            class="rounded-lg border border-gray-400 px-3 py-1 text-sm transition" :class="room.id === activeRoomId
              ? 'bg-neutral-800 text-white'
              : 'bg-white text-black hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800'
              " @click="activeRoomId = room.id">
            {{ room.name }}
          </button>
        </nav>
      </div>
      <div class="w-4/5">
        <Room v-if="activeRoom" :monument-id="monumentId" :room-id="activeRoom.id" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMonumentStore } from '@/stores/monumentStore'
import type { Room as RoomType } from '@/types/MonumentType'
import Room from '@/components/monuments/Room.vue'

defineOptions({ name: 'MonumentPanel' })

const props = defineProps<{ monumentId: string }>()

const monumentStore = useMonumentStore()
const monument = computed(() => monumentStore.getMonument(props.monumentId))

const activeRoomId = ref<string | null>(null)

watch(
  () => props.monumentId,
  () => {
    activeRoomId.value = null
  },
)

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

const layoutColCount = computed(() => {
  const layout = monument.value?.roomLayout
  if (!layout?.length) return 1
  return Math.max(...layout.map((row) => row.length), 1)
})

function roomById(roomId: string): RoomType | undefined {
  return monument.value?.rooms.find((r) => r.id === roomId)
}

function roomRepairPercent(roomId: string): number | null {
  const room = roomById(roomId)
  if (!room) return null
  const tiles = room.tiles.flat().filter((t) => !t.isVoid)
  if (!tiles.length) return null
  const repaired = tiles.filter((t) => t.state === 'ready').length
  return Math.round((repaired / tiles.length) * 100)
}

function roomRepairLabel(roomId: string): string {
  const p = roomRepairPercent(roomId)
  if (p == null) return '—'
  return `${p}%`
}

const monumentProgress = computed(() => {
  const m = monument.value
  if (!m) return null
  const tiles = m.rooms.flatMap((r) => r.tiles.flat()).filter((t) => !t.isVoid)
  if (!tiles.length) return 0
  const repaired = tiles.filter((t) => t.state === 'ready').length
  return Math.round((repaired / tiles.length) * 100)
})
</script>
