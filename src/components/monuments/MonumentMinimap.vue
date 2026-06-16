<template>
  <nav class="mx-auto grid w-fit gap-2" aria-label="Plan du monument"
    :style="{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }">
    <template v-for="(row, ri) in monument.roomLayout" :key="ri">
      <template v-for="(cell, ci) in row" :key="`${ri}-${ci}`">
        <div v-if="cell === null"
          class="rounded-lg border border-dashed border-gray-800 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-900/40"
          :class="{ 'h-[2rem] w-[2rem] border-0': size === 'small', 'h-[4rem] w-[4rem] border-1': size === 'medium', 'h-[6rem] w-[6rem] border-2': size === 'large' }"
          aria-hidden="true" />
        <button v-else-if="getRoomById(cell)" type="button"
          class="flex flex-col items-center justify-center rounded-lg border-2 px-2 py-2 text-center text-sm transition dark:text-white text-black border-gray-200 dark:border-neutral-600"
          :class="[getCellButtonClass(cell), { 'h-[2rem] w-[2rem] border-0': size === 'small', 'h-[4rem] w-[4rem] border-1': size === 'medium', 'h-[6rem] w-[6rem] border-2': size === 'large' }]"
          @click="handleSelectRoom(cell)">
          <template v-if="size === 'large'">
            <span class="font-medium leading-tight">{{ getRoomById(cell)!.name }}</span>
            <span class="mt-0.5 text-xs opacity-80">{{ getCellRepairPercentage(cell) }} %</span>
          </template>
        </button>
        <div v-else
          class="flex h-[2em] w-[2em] items-center justify-center rounded-lg border border-amber-400 bg-amber-50 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
          :title="`Pièce inconnue : ${cell}`">
          ?
        </div>
      </template>
    </template>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Monument, Room } from '@/types/MonumentType'

const props = defineProps<{
  monument: Monument,
  activeRoom: Room | null,
  size: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits<{
  (e: 'selectRoom', roomId: string): void
}>()

const colsCount = computed(() => {
  const layout = props.monument.roomLayout
  if (!layout?.length) return 1
  return Math.max(...layout.map((row) => row.length), 1)
})

const getRoomById = (cell: string | null) => {
  return props.monument.rooms.find((r) => r.id === cell)
}

const getCellRepairPercentage = (roomId: string): number | null => {
  const tiles = getRoomById(roomId)?.tiles.flat().filter((t) => !t.isVoid)
  if (tiles && tiles.length > 0) {
    const repaired = tiles.filter((t) => t.state === 'ready').length
    return Math.round((repaired / tiles.length) * 100)
  }

  return null
}

const getCellBackgroundClass = (roomId: string): string => {
  const p = getCellRepairPercentage(roomId)
  if (p == null) return 'bg-gray-400'
  if (p < 25) return 'bg-red-500'
  if (p < 50) return 'bg-amber-500'
  if (p < 75) return 'bg-orange-500'
  return 'bg-emerald-600'
}

const getCellButtonClass = (roomId: string): string => {
  const background = getCellBackgroundClass(roomId)
  const isActive = roomId === props.activeRoom?.id
  if (isActive) {
    return `${background} text-white dark:text-black opacity-100 hover:scale-110 transition-all duration-100`
  }
  return `${background} text-black dark:text-white opacity-75 hover:scale-110 transition-all duration-100`
}

const handleSelectRoom = (roomId: string) => {
  emit('selectRoom', roomId)
}

</script>
