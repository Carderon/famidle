import type { ActivityType } from '@/types/ActivityType'
import type { EventType } from '@/types/EventType'
import type { GaugeType } from '@/types/GaugeType'
import type { ImprovementType } from '@/types/ImprovementType'
import type { ResourceType } from '@/types/ResourceType'
import type { Building } from '@/types/WorldType'

import { useActivityStore } from '@/stores/activityStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useClockStore } from '@/stores/clockStore'
import { useEventStore } from '@/stores/eventStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useGaugeStore } from '@/stores/gaugeStore'
import { useImprovementStore } from '@/stores/improvementStore'
import { useLogStore } from '@/stores/logStore'
import { useResourceStore } from '@/stores/resourceStore'
import { useWorldStore } from '@/stores/worldStore'

/**
 * Sauvegarde / chargement (`localStorage`, clé {@link SAVE_KEY}).
 *
 * **Sauver** — instantané JSON : perso, flags, ressources, jauges, monde, améliorations,
 * activités, logs, file d’événements interactifs, temps sim + horloge UI,
 * et les IDs des événements `once` déjà déclenchés (`onceFiredEventIds`).
 *
 * **Charger** — au montage de `Game.vue`, si une sauvegarde existe : `applyGameSnapshot` puis
 * `clock.start({ skipGameStateReset: true })` pour ne pas réinitialiser flags / chantiers /
 * événements déjà tirés. `syncSimulationElapsed` réaligne le moteur sur le temps sauvé.
 *
 * **Réinitialiser** — menu Paramètres : suppression de la clé puis rechargement de la page.
 */

export const SAVE_KEY = 'famidleSave'

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
  world: {
    buildings: Building[]
    pendingRepairs: Record<
      string,
      { completeAt: number; refundCosts: { resourceSlug: string; quantity: number }[] }
    >
    gameTimeSim: number
  }
  improvements: ImprovementType[]
  improvementPending: Record<string, number>
  improvementGameTimeSim: number
  activities: ActivityType[]
  activityCooldowns: Record<string, number>
  activityGameTimeSim: number
  logs: string[]
  queuedEvents: EventType[]
}

function cloneJson<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T
}

export function collectSnapshot(): GameSnapshotV1 {
  const clockStore = useClockStore()
  const characterStore = useCharacterStore()
  const gameState = useGameStateStore()
  const resourceStore = useResourceStore()
  const gaugeStore = useGaugeStore()
  const worldStore = useWorldStore()
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
      buildings: worldStore.buildings,
      pendingRepairs: worldStore.pendingRepairs,
      gameTimeSim: worldStore.gameTimeSim,
    }) as GameSnapshotV1['world'],
    improvements: cloneJson(improvementStore.improvements),
    improvementPending: cloneJson(improvementStore.pendingBuildCompleteAt),
    improvementGameTimeSim: improvementStore.gameTimeSim,
    activities: cloneJson(activityStore.activities),
    activityCooldowns: cloneJson(activityStore.cooldownUntilSim),
    activityGameTimeSim: activityStore.gameTimeSim,
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
  const worldStore = useWorldStore()
  const improvementStore = useImprovementStore()
  const activityStore = useActivityStore()
  const logStore = useLogStore()
  const eventStore = useEventStore()
  const clockStore = useClockStore()

  characterStore.$patch({
    characters: cloneJson(data.character.characters),
    activeCharacterIndex: data.character.activeCharacterIndex,
  })

  gameState.$patch({
    flags: cloneJson(data.gameState.flags),
    counters: cloneJson(data.gameState.counters),
  })

  resourceStore.$patch({ resources: cloneJson(data.resources) })
  gaugeStore.$patch({ gauges: cloneJson(data.gauges) })

  worldStore.$patch({
    buildings: cloneJson(data.world.buildings),
    pendingRepairs: cloneJson(data.world.pendingRepairs),
    gameTimeSim: data.world.gameTimeSim,
  })

  improvementStore.$patch({
    improvements: cloneJson(data.improvements),
    pendingBuildCompleteAt: cloneJson(data.improvementPending),
    gameTimeSim: data.improvementGameTimeSim,
  })

  activityStore.$patch({
    activities: cloneJson(data.activities),
    cooldownUntilSim: cloneJson(data.activityCooldowns),
    gameTimeSim: data.activityGameTimeSim,
  })

  logStore.$patch({ logs: cloneJson(data.logs) })
  eventStore.$patch({ queuedEvents: cloneJson(data.queuedEvents) })

  const mergedOnceFired = new Set<string>(data.onceFiredEventIds ?? [])
  for (const ev of data.queuedEvents) mergedOnceFired.add(ev.id)
  clockStore.restoreOnceFiredEventIds([...mergedOnceFired])

  resourceStore.getResourceRates()
  gaugeStore.getGaugeRates()
  improvementStore.updateImprovementVisibility()
  activityStore.updateActivityVisibility()
  resourceStore.recomputeVisibility()
}

export function clearSavedGame(): void {
  localStorage.removeItem(SAVE_KEY)
}
