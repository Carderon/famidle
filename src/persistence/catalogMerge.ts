/**
 * Fusion catalogue (fichiers `data/`) + état joueur (sauvegarde).
 *
 * Au chargement, les définitions (textes, coûts, effets, grilles) viennent toujours
 * du code à jour ; seuls les champs « runtime » sont repris de la sauvegarde.
 * Évite de recommencer une partie après chaque modification de contenu.
 */

import type { ActivityType } from '@/types/ActivityType'
import type { Building } from '@/types/BuildingType'
import type { EventType } from '@/types/EventType'
import type { GaugeType } from '@/types/GaugeType'
import type { ImprovementCategory, ImprovementType } from '@/types/ImprovementType'
import type { Monument, Tile, TileState } from '@/types/MonumentType'
import type { ResourceType } from '@/types/ResourceType'

import { activitiesData } from '@/data/activities'
import { improvementsData } from '@/data/improvements'
import { age1Resources } from '@/data/resources/age1'
import { age2Resources } from '@/data/resources/age2'
import { globalResources } from '@/data/resources/global'
import { globalGauges } from '@/data/gauges/global'
import { createBuildingsAge1 } from '@/data/buildings/age1'
import { createCabin } from '@/data/monuments/age1/house'
import { createHouse } from '@/data/monuments/age2/house'
import { EventLoader } from '@/engines/events/EventLoader'

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T
}

// ---------------------------------------------------------------------------
// Catalogues frais (miroir des stores au démarrage)
// ---------------------------------------------------------------------------

export function getFreshActivities(): ActivityType[] {
  return activitiesData.map((a) => ({ ...a }))
}

export function getFreshImprovements(): ImprovementType[] {
  return improvementsData.map((i) => ({ ...i }))
}

export function getFreshResources(): ResourceType[] {
  return [...globalResources, ...age1Resources, ...age2Resources].map((r) => ({
    ...r,
    baseMax: r.baseMax ?? r.max,
  }))
}

export function getFreshGauges(): GaugeType[] {
  return globalGauges.map((g) => ({ ...g, baseMax: g.max }))
}

export function getFreshMonuments(): Monument[] {
  return [createCabin(), createHouse()]
}

export function getFreshBuildings(): Building[] {
  return createBuildingsAge1()
}

// ---------------------------------------------------------------------------
// Fusions
// ---------------------------------------------------------------------------

/** Textes / règles data ; conserve visibilité calculée en jeu. */
export function mergeActivities(saved: readonly ActivityType[]): ActivityType[] {
  const savedBySlug = new Map(saved.map((a) => [a.slug, a]))
  return getFreshActivities().map((fresh) => {
    const prev = savedBySlug.get(fresh.slug)
    if (!prev) return fresh
    return { ...fresh, isVisible: prev.isVisible }
  })
}

const DEFAULT_IMPROVEMENT_CATEGORY: ImprovementCategory = 'introspection'

/** Textes / effets data ; conserve achat et visibilité. */
export function mergeImprovements(saved: readonly ImprovementType[]): ImprovementType[] {
  const savedBySlug = new Map(saved.map((i) => [i.slug, i]))
  return getFreshImprovements().map((fresh) => {
    const prev = savedBySlug.get(fresh.slug)
    const category = fresh.category ?? prev?.category ?? DEFAULT_IMPROVEMENT_CATEGORY
    if (!prev) return { ...fresh, category }
    return {
      ...fresh,
      category,
      isBought: prev.isBought,
      isVisible: prev.isVisible,
    }
  })
}

/** Stats data ; conserve quantités et visibilité. `max` recalculé après chargement. */
export function mergeResources(saved: readonly ResourceType[]): ResourceType[] {
  const savedBySlug = new Map(saved.map((r) => [r.slug, r]))
  return getFreshResources().map((fresh) => {
    const prev = savedBySlug.get(fresh.slug)
    const baseMax = fresh.baseMax ?? fresh.max
    if (!prev) return { ...fresh, baseMax }
    return {
      ...fresh,
      baseMax,
      quantity: prev.quantity,
      isVisible: prev.isVisible,
    }
  })
}

export function mergeGauges(saved: readonly GaugeType[]): GaugeType[] {
  const savedBySlug = new Map(saved.map((g) => [g.slug, g]))
  return getFreshGauges().map((fresh) => {
    const prev = savedBySlug.get(fresh.slug)
    const baseMax = fresh.baseMax ?? fresh.max
    if (!prev) return { ...fresh, baseMax }
    return {
      ...fresh,
      baseMax,
      current: prev.current,
    }
  })
}

function collectTileStates(monument: Monument): Map<string, TileState> {
  const map = new Map<string, TileState>()
  for (const room of monument.rooms) {
    for (const row of room.tiles) {
      for (const tile of row) {
        if (!tile.isVoid) map.set(tile.id, tile.state)
      }
    }
  }
  return map
}

function applyTileStates(monument: Monument, states: Map<string, TileState>): Monument {
  const rooms = monument.rooms.map((room) => ({
    ...room,
    tiles: room.tiles.map((row) =>
      row.map((tile: Tile): Tile => {
        const savedState = states.get(tile.id)
        return savedState != null ? { ...tile, state: savedState } : tile
      }),
    ),
  }))
  return { ...monument, rooms }
}

/**
 * Plan / coûts / assets depuis le data actuel ; états `broken` | `ready` depuis la sauvegarde.
 * Monuments absents du catalogue (id inconnu) sont ignorés.
 */
export function mergeMonuments(saved: readonly Monument[]): Monument[] {
  const savedById = new Map(saved.map((m) => [m.id, m]))
  return getFreshMonuments().map((fresh) => {
    const prev = savedById.get(fresh.id)
    if (!prev) return clone(fresh)
    const states = collectTileStates(prev)
    return applyTileStates(clone(fresh), states)
  })
}

/** Pas d’état runtime sur les bâtiments prod pour l’instant : toujours le catalogue actuel. */
export function mergeBuildings(_saved: readonly Building[]): Building[] {
  return getFreshBuildings()
}

/** File d’attente : définitions à jour ; événements retirés du jeu conservés tels quels. */
export function mergeQueuedEvents(saved: readonly EventType[]): EventType[] {
  const catalogById = new Map(EventLoader.getAllEvents().map((e) => [e.id, e]))
  return saved.map((prev) => {
    const fresh = catalogById.get(prev.id)
    return fresh ? clone(fresh) : clone(prev)
  })
}
