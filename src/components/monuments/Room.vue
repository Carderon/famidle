<template>
  <div>
    <div v-if="imagesLoaded"
      class="relative z-0 mx-auto grid w-max max-w-full gap-0 border border-gray-400 dark:border-gray-600"
      :style="gridStyle">
      <template v-for="(row, y) in tiles" :key="y">
        <div v-for="(tile, x) in row" :key="`${x}-${y}`"
          class="group relative z-0 cursor-default border overflow-visible border-gray-400 dark:border-gray-600 hover:z-[120]"
          :style="cellStyle" :class="tileWrapperClass(tile)" @click="handleTileClick(tile.id)">
          <template v-if="tile.isVoid">
            <div class="absolute inset-0 bg-neutral-950" aria-hidden="true" />
          </template>
          <template v-else>
            <!-- Calque visuel seul : le filtre hover ne s’applique pas au tooltip (évite les bugs d’empilement). -->
            <div class="absolute inset-0 overflow-hidden" :class="tileVisualHoverClass(tile)">
              <!-- État cassé (pas de chantier en cours) -->
              <template v-if="tile.state !== 'ready' && !isRepairing(tile.id)">
                <div class="absolute inset-0 bg-cover bg-center transition-all duration-100 hover:brightness-125"
                  :style="{ backgroundImage: `url(${tile.backgrounds.broken})` }" />
              </template>

              <!-- Réparation : fondu entre image cassée et image réparée -->
              <template v-else-if="isRepairing(tile.id)">
                <div class="absolute inset-0">
                  <div class="absolute inset-0 bg-cover bg-center will-change-opacity"
                    :style="repairBlendReadyStyle(tile)" />
                  <div class="absolute inset-0 bg-cover bg-center will-change-opacity"
                    :style="repairBlendBrokenStyle(tile)" />
                </div>
                <span
                  class="relative z-[2] flex h-full items-center justify-center text-[10px] font-medium tabular-nums text-white drop-shadow">
                  {{ Math.round(repairProgressPct(tile.id)) }}%
                </span>
              </template>

              <!-- Réparé -->
              <template v-else>
                <div class="absolute inset-0 bg-cover bg-center"
                  :style="{ backgroundImage: `url(${tile.backgrounds.ready})` }" />
              </template>
            </div>

            <GameTooltip placement="above">
              <p class="text-sm font-semibold text-white">{{ tile.displayName ?? tile.id }}</p>
              <template v-if="tile.state !== 'ready'">
                <p v-if="hasCost(tile)" class="mt-1 text-[11px]">
                  Coût :
                  <span :class="canAffordTile(tile) ? 'text-amber-200' : 'text-red-300'">
                    {{ formatCost(tile) }}
                  </span>
                </p>
                <p v-else class="mt-1 text-[11px]">Coût : gratuit</p>
                <p class="mt-1 text-[11px] text-gray-300">Durée : {{ tileDurSeconds(tile) }}s</p>
                <p v-if="isRepairing(tile.id)" class="mt-1 text-[11px] text-emerald-300">
                  Réparation en cours…
                </p>
              </template>
              <p v-else class="mt-1 text-[11px] text-emerald-300">Réparé</p>
            </GameTooltip>
          </template>
        </div>
      </template>
    </div>
    <div v-else class="text-sm text-gray-500">Chargement …</div>
  </div>
</template>

<script setup lang="ts">
import GameTooltip from '@/components/ui/GameTooltip.vue'
import type { Tile } from '@/types/MonumentType'
import { useClockStore } from '@/stores/clockStore'
import { useResourceStore } from '@/stores/resourceStore'
import { useMonumentStore } from '@/stores/monumentStore'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

/** Taille fixe des cases (px) — identique pour toutes les pièces / grilles. */
const TILE_PX = 150

defineOptions({ name: 'MonumentRoom' })

const props = defineProps<{
  monumentId: string
  roomId: string
}>()

const monumentStore = useMonumentStore()
const resourceStore = useResourceStore()
const clockStore = useClockStore()
const { tick } = storeToRefs(clockStore)

const room = computed(() => monumentStore.getRoom(props.monumentId, props.roomId))
const tiles = computed(() => room.value?.tiles || [])

const maxCols = computed(() => {
  const rows = tiles.value
  if (!rows.length) return 1
  return Math.max(1, ...rows.map((r) => r.length))
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${maxCols.value}, ${TILE_PX}px)`,
  gridAutoRows: `${TILE_PX}px`,
}))

const cellStyle = {
  width: `${TILE_PX}px`,
  height: `${TILE_PX}px`,
  minWidth: `${TILE_PX}px`,
  minHeight: `${TILE_PX}px`,
}

function isRepairing(tileId: string): boolean {
  void tick.value
  return monumentStore.isTileRepairing(tileId)
}

function repairProgressPct(tileId: string): number {
  void tick.value
  return monumentStore.getTileRepairProgress01(tileId) * 100
}

/** Fondu : ready apparaît avec p, cassé disparaît avec (1 − p). */
function repairBlendReadyStyle(tile: Tile) {
  void tick.value
  const p = monumentStore.getTileRepairProgress01(tile.id)
  return {
    backgroundImage: `url(${tile.backgrounds.ready})`,
    opacity: p,
  }
}

function repairBlendBrokenStyle(tile: Tile) {
  void tick.value
  const p = monumentStore.getTileRepairProgress01(tile.id)
  return {
    backgroundImage: `url(${tile.backgrounds.broken})`,
    opacity: 1 - p,
  }
}

function tileDurSeconds(tile: Tile): number {
  return tile.repairDurationSeconds != null && tile.repairDurationSeconds > 0 ? tile.repairDurationSeconds : 6
}

function hasCost(tile: Tile): boolean {
  if (!tile.repairCost) return false
  return tile.repairCost.some(({ quantity }) => quantity > 0)
}

function formatCost(tile: Tile): string {
  if (!tile.repairCost) return ''
  return tile.repairCost
    .filter(({ quantity }) => quantity > 0)
    .map(
      ({ resourceSlug, quantity }) =>
        `${quantity} ${resourceStore.getResource(resourceSlug)?.name ?? resourceSlug}`,
    )
    .join(', ')
}

function canAffordTile(tile: Tile): boolean {
  if (!tile.repairCost || !hasCost(tile)) return true
  return resourceStore.canAfford(tile.repairCost)
}

/** Curseur / opacité sur la cellule entière (pas de hover:brightness ici). */
function tileWrapperClass(tile: Tile) {
  void tick.value
  if (tile.isVoid) return ''
  if (tile.state === 'ready' && !isRepairing(tile.id)) return ''
  if (isRepairing(tile.id)) return 'cursor-wait'
  if (monumentStore.canRepairTile(props.monumentId, props.roomId, tile.id)) {
    return 'cursor-pointer'
  }
  return 'cursor-not-allowed'
}

/** Luminosité au survol uniquement sur le visuel, pour ne pas créer un contexte d’empilement qui masque le tooltip. */
function tileVisualHoverClass(tile: Tile) {
  if (tile.isVoid) return ''
  if (tile.state === 'ready' && !isRepairing(tile.id)) return ''
  if (isRepairing(tile.id)) return ''
  if (monumentStore.canRepairTile(props.monumentId, props.roomId, tile.id)) {
    return 'transition-[filter] duration-100 hover:brightness-110'
  }
  return ''
}

function handleTileClick(tileId: string) {
  const tile = monumentStore.findTile(props.monumentId, props.roomId, tileId)
  if (tile?.isVoid) return
  if (!monumentStore.canRepairTile(props.monumentId, props.roomId, tileId)) return
  monumentStore.startRepairTile(props.monumentId, props.roomId, tileId)
}

const imagesLoaded = ref(false)

onMounted(() => {
  const sources = tiles.value.flatMap((row) =>
    row.flatMap((tile) => [tile.backgrounds.broken, tile.backgrounds.ready]),
  )

  if (!sources.length) {
    imagesLoaded.value = true
    return
  }

  const preload = sources.map(
    (src) =>
      new Promise<void>((resolve) => {
        const image = new Image()
        image.onload = () => resolve()
        image.onerror = () => resolve()
        image.src = src
      }),
  )

  Promise.all(preload).then(() => {
    imagesLoaded.value = true
  })
})
</script>
