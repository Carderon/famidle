import type { ActivityType, ActiveTimedActivity } from '@/types/ActivityType'
import type { EventType } from '@/types/EventType'
import type { GaugeType } from '@/types/GaugeType'
import type { ImprovementType, PendingImprovementBuild } from '@/types/ImprovementType'
import { parseImprovementPending } from '@/persistence/improvementPending'
import type { GameLogEntry } from '@/types/LogType'
import type { ResourceType } from '@/types/ResourceType'
import type { Monument } from '@/types/MonumentType'
import type { Building } from '@/types/BuildingType'

import { useActivityStore } from '@/stores/activityStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useClockStore } from '@/stores/clockStore'
import { useEventStore } from '@/stores/eventStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useGaugeStore } from '@/stores/gaugeStore'
import { useImprovementStore } from '@/stores/improvementStore'
import { useLogStore } from '@/stores/logStore'
import { useResourceStore } from '@/stores/resourceStore'
import { useMonumentStore } from '@/stores/monumentStore'
import { useBuildingStore } from '@/stores/buildingStore'
import { createBuildingsAge1 } from '@/data/buildings/age1'
import { createCabin } from '@/data/monuments/age1/house'
import { createHouse } from '@/data/monuments/age2/house'
import {
  mergeActivities,
  mergeBuildings,
  mergeGauges,
  mergeImprovements,
  mergeMonuments,
  mergeQueuedEvents,
  mergeResources,
} from '@/persistence/catalogMerge'
import {
  reconcileAge1ScavengeFlags,
  scavengeOnceFiredIdsForCounter,
} from '@/persistence/age1SaveReconcile'
import { reconcileEra2RoomsCounter } from '@/persistence/era2SaveReconcile'

/**
 * Sauvegarde / chargement (`localStorage`, clé {@link SAVE_KEY}).
 *
 * **Sauver** — snapshot JSON (progression + état runtime).
 *
 * **Charger** — fusion avec les catalogues `data/` actuels (`catalogMerge`) : textes, coûts,
 * effets et grilles viennent du code ; quantités, flags, tuiles `ready`, achats, etc. viennent
 * de la sauvegarde. Permet de tester et de patcher le contenu sans effacer la partie.
 *
 * **Réinitialiser** — menu Paramètres : suppression de la clé puis rechargement de la page.
 */

export const SAVE_KEY = 'famidleSave'

export type WorldSnapshotV1 = {
  monuments: Monument[]
  /** Bâtiments de production (lignes onglet Production), distinct des monuments. */
  buildings: Building[]
  pendingRepairs: Record<
    string,
    { completeAt: number; refundCosts: { resourceSlug: string; quantity: number }[] }
  >
  gameTimeSim: number
}

export type GameSnapshotV1 = {
  version: 1
  elapsed: number
  /** IDs des événements `once` déjà exécutés (évite de les relancer après chargement). */
  onceFiredEventIds?: string[]
  character: {
    characters: {
      name: string
      classType: string
      level: number
      specialization: string | null
      isNew: boolean
      era: number
    }[]
    activeCharacterIndex: number
  }
  gameState: { flags: Record<string, boolean>; counters: Record<string, number> }
  resources: ResourceType[]
  gauges: GaugeType[]
  world: WorldSnapshotV1
  improvements: ImprovementType[]
  improvementPending: Record<string, PendingImprovementBuild | number>
  improvementGameTimeSim: number
  activities: ActivityType[]
  activityCooldowns: Record<string, number>
  activityGameTimeSim: number
  /** Activités « sur la durée » en cours (ère 2). */
  activityActiveTimed?: ActiveTimedActivity[]
  /** Boucle auto : relance après chaque cooldown (activités `timed`). */
  activityTimedRelaunchEnabled?: Record<string, boolean>
  /** Second clic : fin de cycle puis pas de relance. */
  activityTimedRelaunchStopPending?: Record<string, boolean>
  logs: GameLogEntry[]
  queuedEvents: EventType[]
}

function cloneJson<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T
}

/** Anciens formats (clé `monuments` imbriquée, ou `world.buildings` = liste de monuments). */
function resolveWorldFromSnapshot(data: GameSnapshotV1 & Record<string, unknown>): WorldSnapshotV1 {
  const w = data.world as (Partial<WorldSnapshotV1> & { productionSites?: Building[] }) | undefined
  if (w && Array.isArray(w.monuments) && typeof w.gameTimeSim === 'number') {
    const mon = w.monuments.length ? w.monuments : [createCabin(), createHouse()]
    const b = w.buildings ?? w.productionSites
    return {
      monuments: mon,
      buildings: Array.isArray(b) ? b : createBuildingsAge1(),
      pendingRepairs: w.pendingRepairs ?? {},
      gameTimeSim: w.gameTimeSim,
    }
  }

  const nested = data.monuments as
    | (Partial<WorldSnapshotV1> & { productionSites?: Building[] })
    | undefined
  if (nested && Array.isArray(nested.monuments)) {
    const mon = nested.monuments.length ? nested.monuments : [createCabin(), createHouse()]
    return {
      monuments: mon,
      buildings: Array.isArray(nested.buildings)
        ? nested.buildings
        : Array.isArray(nested.productionSites)
          ? nested.productionSites
          : createBuildingsAge1(),
      pendingRepairs: nested.pendingRepairs ?? {},
      gameTimeSim: nested.gameTimeSim ?? 0,
    }
  }

  const legacyWorld = data.world as
    | (Partial<WorldSnapshotV1> & { buildings?: Monument[] })
    | undefined
  if (legacyWorld && Array.isArray(legacyWorld.buildings) && legacyWorld.buildings.length) {
    const first = legacyWorld.buildings[0] as Monument | Building
    if ('era' in first || 'rooms' in first) {
      return {
        monuments: legacyWorld.buildings as Monument[],
        buildings: createBuildingsAge1(),
        pendingRepairs: legacyWorld.pendingRepairs ?? {},
        gameTimeSim: legacyWorld.gameTimeSim ?? 0,
      }
    }
  }

  return {
    monuments: [createCabin(), createHouse()],
    buildings: createBuildingsAge1(),
    pendingRepairs: {},
    gameTimeSim: 0,
  }
}

export function collectSnapshot(): GameSnapshotV1 {
  const clockStore = useClockStore()
  const characterStore = useCharacterStore()
  const gameState = useGameStateStore()
  const resourceStore = useResourceStore()
  const gaugeStore = useGaugeStore()
  const monumentStore = useMonumentStore()
  const buildingStore = useBuildingStore()
  const improvementStore = useImprovementStore()
  const activityStore = useActivityStore()
  const logStore = useLogStore()
  const eventStore = useEventStore()

  return {
    version: 1,
    elapsed: clockStore.elapsed,
    onceFiredEventIds: clockStore.getOnceFiredEventIdsSnapshot(),
    character: cloneJson({
      characters: characterStore.characters,
      activeCharacterIndex: characterStore.activeCharacterIndex,
    }),
    gameState: cloneJson({
      flags: gameState.flags,
      counters: gameState.counters,
    }),
    resources: cloneJson(resourceStore.resources),
    gauges: cloneJson(gaugeStore.gauges),
    world: cloneJson({
      monuments: monumentStore.monuments,
      buildings: buildingStore.buildings,
      pendingRepairs: monumentStore.pendingRepairs,
      gameTimeSim: monumentStore.gameTimeSim,
    }) as WorldSnapshotV1,
    improvements: cloneJson(improvementStore.improvements),
    improvementPending: cloneJson(improvementStore.pendingBuilds),
    improvementGameTimeSim: improvementStore.gameTimeSim,
    activities: cloneJson(activityStore.activities),
    activityCooldowns: cloneJson(activityStore.cooldownUntilSim),
    activityGameTimeSim: activityStore.gameTimeSim,
    activityActiveTimed: cloneJson(activityStore.activeTimed),
    activityTimedRelaunchEnabled: cloneJson(activityStore.timedRelaunchEnabled),
    activityTimedRelaunchStopPending: cloneJson(activityStore.timedRelaunchStopPending),
    logs: cloneJson(logStore.logs),
    queuedEvents: cloneJson(eventStore.queuedEvents),
  }
}

export function saveGameToStorage(): void {
  const snap = collectSnapshot()
  localStorage.setItem(SAVE_KEY, JSON.stringify(snap))
}

export function loadSnapshotFromStorage(): GameSnapshotV1 | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as GameSnapshotV1
    if (data?.version !== 1) return null
    return data
  } catch {
    return null
  }
}

export function applyGameSnapshot(data: GameSnapshotV1): void {
  const characterStore = useCharacterStore()
  const gameState = useGameStateStore()
  const resourceStore = useResourceStore()
  const gaugeStore = useGaugeStore()
  const monumentStore = useMonumentStore()
  const buildingStore = useBuildingStore()
  const improvementStore = useImprovementStore()
  const activityStore = useActivityStore()
  const logStore = useLogStore()
  const eventStore = useEventStore()
  const clockStore = useClockStore()

  characterStore.$patch({
    characters: cloneJson(data.character.characters),
    activeCharacterIndex: data.character.activeCharacterIndex,
  })

  const counters = reconcileEra2RoomsCounter(
    cloneJson(data.gameState.flags),
    cloneJson(data.gameState.counters),
  )
  const flags = reconcileAge1ScavengeFlags(cloneJson(data.gameState.flags), counters)
  gameState.$patch({ flags, counters })

  resourceStore.$patch({ resources: mergeResources(data.resources) })
  gaugeStore.$patch({ gauges: mergeGauges(data.gauges) })

  const resolved = resolveWorldFromSnapshot(data as GameSnapshotV1 & Record<string, unknown>)
  const monuments = mergeMonuments(resolved.monuments)

  const buildings = mergeBuildings(
    resolved.buildings?.length ? resolved.buildings : createBuildingsAge1(),
  )

  monumentStore.$patch({
    monuments,
    pendingRepairs: cloneJson(resolved.pendingRepairs),
    gameTimeSim: resolved.gameTimeSim,
  })

  buildingStore.$patch({
    buildings,
  })

  improvementStore.$patch({
    improvements: mergeImprovements(data.improvements),
    pendingBuilds: parseImprovementPending(
      data.improvementPending as Record<string, unknown> | undefined,
    ),
    gameTimeSim: data.improvementGameTimeSim,
  })

  const relaunchEnabled = cloneJson(data.activityTimedRelaunchEnabled ?? {})
  const relaunchStop = cloneJson(data.activityTimedRelaunchStopPending ?? {})
  for (const slot of data.activityActiveTimed ?? []) {
    if (relaunchEnabled[slot.slug] === undefined) relaunchEnabled[slot.slug] = true
  }

  activityStore.hydrateFromSave({
    activities: mergeActivities(data.activities),
    cooldownUntilSim: cloneJson(data.activityCooldowns),
    gameTimeSim: data.activityGameTimeSim,
    activeTimed: cloneJson(data.activityActiveTimed ?? []),
    timedRelaunchEnabled: relaunchEnabled,
    timedRelaunchStopPending: relaunchStop,
  })

  logStore.hydrateLogs(data.logs)
  eventStore.$patch({ queuedEvents: mergeQueuedEvents(data.queuedEvents) })

  const mergedOnceFired = new Set<string>(data.onceFiredEventIds ?? [])
  for (const id of scavengeOnceFiredIdsForCounter(counters)) mergedOnceFired.add(id)
  for (const ev of data.queuedEvents) mergedOnceFired.add(ev.id)
  clockStore.restoreOnceFiredEventIds([...mergedOnceFired])

  resourceStore.getResourceRates()
  resourceStore.recomputeResourceCaps()
  gaugeStore.getGaugeRates()
  gaugeStore.recomputeGaugeCaps()
  improvementStore.updateImprovementVisibility()
  activityStore.updateActivityVisibility()
  resourceStore.recomputeVisibility()
}

export function clearSavedGame(): void {
  localStorage.removeItem(SAVE_KEY)
}
