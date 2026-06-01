import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Monument, Tile, TileCost } from '@/types/MonumentType'
import { createCabin } from '@/data/monuments/age1/house'
import { createHouse } from '@/data/monuments/age2/house'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useLogStore } from '@/stores/logStore'
import { useResourceStore } from '@/stores/resourceStore'

const DEFAULT_REPAIR_DURATION_SECONDS = 6

type PendingRepair = {
  completeAt: number
  /** Pour rembourser si la partie est arrêtée pendant la construction. */
  refundCosts: TileCost
}

/**
 * **Monuments** : reconstruction tuile par tuile (pièces, plan).
 * Les bâtiments de production sont dans `buildingStore`.
 */
export const useMonumentStore = defineStore('monument', () => {
  const monuments = ref<Monument[]>([createCabin(), createHouse()])

  /** Temps sim aligné sur `ClockEngine.elapsed` */
  const gameTimeSim = ref(0)
  /** Tuile en cours de réparation → instant sim de fin + coût à rembourser si annulation */
  const pendingRepairs = ref<Record<string, PendingRepair>>({})

  const getMonument = (id: string) => monuments.value.find((m) => m.id === id)

  function getMonumentIdForEra(era: number): string {
    const match = monuments.value.find((m) => m.era === era)
    if (match) return match.id
    if (era >= 2) return 'age2.building.house-2'
    return 'age1.building.house-1'
  }

  const getRoom = (monumentId: string, roomId: string) => {
    const monument = monuments.value.find((m) => m.id === monumentId)
    return monument?.rooms.find((r) => r.id === roomId)
  }

  const findTile = (monumentId: string, roomId: string, tileId: string) => {
    const room = getRoom(monumentId, roomId)
    return room?.tiles.flat().find((t) => t.id === tileId)
  }

  function findTileContext(
    tileId: string,
  ): { monumentId: string; roomId: string; tile: Tile } | null {
    for (const m of monuments.value) {
      for (const r of m.rooms) {
        for (const row of r.tiles) {
          for (const t of row) {
            if (t.id === tileId) return { monumentId: m.id, roomId: r.id, tile: t }
          }
        }
      }
    }
    return null
  }

  const hasRepairCost = (tile: Tile): boolean => {
    if (!tile.repairCost) return false
    return tile.repairCost.some(({ quantity }) => quantity > 0)
  }

  function refundCosts(costs: TileCost) {
    const resourceStore = useResourceStore()
    for (const { resourceSlug, quantity } of costs) {
      if (quantity > 0) resourceStore.addResource(resourceSlug, quantity)
    }
  }

  /**
   * À chaque tick du clock : termine les réparations dues.
   */
  function applyGameTime(simElapsedSeconds: number) {
    gameTimeSim.value = simElapsedSeconds

    for (const tileId of Object.keys(pendingRepairs.value)) {
      if (simElapsedSeconds >= pendingRepairs.value[tileId].completeAt) {
        completeRepair(tileId)
      }
    }
  }

  function completeRepair(tileId: string) {
    const ctx = findTileContext(tileId)
    const next = { ...pendingRepairs.value }
    delete next[tileId]
    pendingRepairs.value = next

    if (!ctx || ctx.tile.state === 'ready') return

    ctx.tile.state = 'ready'
    const gameState = useGameStateStore()
    // maybe not the best place to put this
    gameState.incrementCounter('age1.counter.tilesRepaired')
    if (ctx.tile.id.startsWith('age2.tile.garden.')) {
      gameState.incrementCounter('age2.counter.gardenTilesRepaired')
    }
    if (ctx.tile.id.startsWith('age2.tile.workshop.')) {
      gameState.incrementCounter('age2.counter.workshopTilesRepaired')
    }
    if (ctx.tile.id.startsWith('age2.tile.library.')) {
      gameState.incrementCounter('age2.counter.libraryTilesRepaired')
    }
    if (ctx.tile.id.startsWith('age2.tile.laboratory.')) {
      gameState.incrementCounter('age2.counter.laboratoryTilesRepaired')
    }
  }

  /** Annule les chantiers en cours et rembourse (stop partie / nouvelle run). */
  function cancelPendingRepairsAndRefund() {
    for (const tileId of Object.keys(pendingRepairs.value)) {
      refundCosts(pendingRepairs.value[tileId].refundCosts)
    }
    pendingRepairs.value = {}
  }

  const isTileRepairing = (tileId: string): boolean => pendingRepairs.value[tileId] != null

  function getTileRepairProgress01(tileId: string): number {
    const pending = pendingRepairs.value[tileId]
    const ctx = findTileContext(tileId)
    if (!pending || !ctx) return 0

    const duration =
      ctx.tile.repairDurationSeconds != null && ctx.tile.repairDurationSeconds > 0
        ? ctx.tile.repairDurationSeconds
        : DEFAULT_REPAIR_DURATION_SECONDS

    const start = pending.completeAt - duration
    const t = gameTimeSim.value
    return Math.min(1, Math.max(0, (t - start) / duration))
  }

  const canRepairTile = (monumentId: string, roomId: string, tileId: string): boolean => {
    if (isTileRepairing(tileId)) return false
    const tile = findTile(monumentId, roomId, tileId)
    if (!tile || tile.state === 'ready' || tile.isVoid) return false
    if (!tile.repairCost || !hasRepairCost(tile)) return true
    const resourceStore = useResourceStore()
    return resourceStore.canAfford(tile.repairCost)
  }

  /**
   * Lance la réparation : paie tout de suite, barre de progression jusqu’à `completeAt` (temps sim).
   */
  function startRepairTile(monumentId: string, roomId: string, tileId: string): boolean {
    if (!canRepairTile(monumentId, roomId, tileId)) return false

    const tile = findTile(monumentId, roomId, tileId)
    if (!tile || tile.state === 'ready' || tile.isVoid) return false

    const duration =
      tile.repairDurationSeconds != null && tile.repairDurationSeconds > 0
        ? tile.repairDurationSeconds
        : DEFAULT_REPAIR_DURATION_SECONDS

    let paidCosts: TileCost = []
    if (tile.repairCost && hasRepairCost(tile)) {
      const resourceStore = useResourceStore()
      if (!resourceStore.spendResource(tile.repairCost)) {
        useLogStore().addLog('Pas assez de ressources pour réparer.', 'system')
        return false
      }
      paidCosts = tile.repairCost.map((c) => ({ ...c }))
    }

    pendingRepairs.value = {
      ...pendingRepairs.value,
      [tileId]: {
        completeAt: gameTimeSim.value + duration,
        refundCosts: paidCosts,
      },
    }
    return true
  }

  return {
    monuments,
    gameTimeSim,
    pendingRepairs,
    getMonument,
    getMonumentIdForEra,
    getRoom,
    findTile,
    findTileContext,
    canRepairTile,
    startRepairTile,
    applyGameTime,
    cancelPendingRepairsAndRefund,
    isTileRepairing,
    getTileRepairProgress01,
  }
})
