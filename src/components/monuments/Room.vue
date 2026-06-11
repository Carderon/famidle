<template>
  <div>
    <div v-if="imagesLoaded" class="relative z-0 mx-auto grid gap-0 border border-gray-400 dark:border-gray-600"
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
                  <ResourceCostLines :costs="tile.repairCost" />
                </p>
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
import ResourceCostLines from '@/components/ui/ResourceCostLines.vue'
import type { Tile } from '@/types/MonumentType'
import { useClockStore } from '@/stores/clockStore'
import { useMonumentStore } from '@/stores/monumentStore'
import { useResourceStore } from '@/stores/resourceStore'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

const monumentStore = useMonumentStore()
const resourceStore = useResourceStore()
const clockStore = useClockStore()
const { uiTicksCount } = storeToRefs(clockStore)

const props = defineProps<{
  monumentId: string
  roomId: string
}>()

/** Largeur totale max de la grille ; taille d’une case = min(plafond case, largeur / colonnes). */
const ROOM_MAX_WIDTH_PX = 800
const TILE_MAX_PX = 150

defineOptions({ name: 'MonumentRoom' })

const room = computed(() => monumentStore.getRoom(props.monumentId, props.roomId))
const tiles = computed(() => room.value?.tiles || [])

const maxCols = computed(() => {
  const rows = tiles.value
  if (!rows.length) return 1
  return Math.max(1, ...rows.map((r) => r.length))
})

/** Répartit la largeur sur les colonnes, sans dépasser 150px par case ni 800px au total. */
const tilePx = computed(() => {
  const cols = maxCols.value
  if (cols <= 0) return TILE_MAX_PX
  return Math.min(TILE_MAX_PX, ROOM_MAX_WIDTH_PX / cols)
})

const gridStyle = computed(() => {
  const size = tilePx.value
  const width = maxCols.value * size
  return {
    gridTemplateColumns: `repeat(${maxCols.value}, ${size}px)`,
    gridAutoRows: `${size}px`,
    width: `${width}px`,
    maxWidth: `${ROOM_MAX_WIDTH_PX}px`,
  }
})

const cellStyle = computed(() => {
  const size = `${tilePx.value}px`
  return {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  }
})

function isRepairing(tileId: string): boolean {
  void uiTicksCount.value
  return monumentStore.isTileRepairing(tileId)
}

function repairProgressPct(tileId: string): number {
  void uiTicksCount.value
  return monumentStore.getTileRepairProgress01(tileId) * 100
}

/** Fondu : ready apparaît avec p, cassé disparaît avec (1 − p). */
function repairBlendReadyStyle(tile: Tile) {
  void uiTicksCount.value
  const p = monumentStore.getTileRepairProgress01(tile.id)
  return {
    backgroundImage: `url(${tile.backgrounds.ready})`,
    opacity: p,
  }
}

function repairBlendBrokenStyle(tile: Tile) {
  void uiTicksCount.value
  const p = monumentStore.getTileRepairProgress01(tile.id)
  return {
    backgroundImage: `url(${tile.backgrounds.broken})`,
    opacity: 1 - p,
  }
}

function hasCost(tile: Tile): boolean {
  return resourceStore.hasPositiveResourceCosts(tile.repairCost)
}

/** Curseur / opacité sur la cellule entière (pas de hover:brightness ici). */
function tileWrapperClass(tile: Tile) {
  void uiTicksCount.value
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
  if (!tile || tile.isVoid) return
  if (!monumentStore.canRepairTile(props.monumentId, props.roomId, tileId)) return
  const secondary = tileSecondarySrc(tile)
  if (secondary) void preloadImage(secondary)
  monumentStore.startRepairTile(props.monumentId, props.roomId, tileId)
}

const imagesLoaded = ref(false)
const loadedSrc = new Set<string>()

function preloadImage(src: string): Promise<void> {
  if (loadedSrc.has(src)) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => {
      loadedSrc.add(src)
      resolve()
    }
    image.onerror = () => resolve()
    image.src = src
  })
}

function tilePrimarySrc(tile: Tile): string {
  if (tile.isVoid) return ''
  return tile.state === 'ready' ? tile.backgrounds.ready : tile.backgrounds.broken
}

function tileSecondarySrc(tile: Tile): string | null {
  if (tile.isVoid) return null
  const secondary = tile.state === 'ready' ? tile.backgrounds.broken : tile.backgrounds.ready
  return secondary !== tilePrimarySrc(tile) ? secondary : null
}

onMounted(() => {
  const playable = tiles.value.flatMap((row) => row.filter((tile) => !tile.isVoid))
  const primary = [...new Set(playable.map(tilePrimarySrc).filter(Boolean))]
  const secondary = [...new Set(playable.map(tileSecondarySrc).filter((s): s is string => Boolean(s)))]

  if (!primary.length) {
    imagesLoaded.value = true
    return
  }

  Promise.all(primary.map(preloadImage)).then(() => {
    imagesLoaded.value = true
    secondary.forEach((src) => void preloadImage(src))
  })
})
</script>
