/**
 * Types **monument** : lieu d’ère à reconstruire (pièces, tuiles, plan).
 *
 * Hiérarchie :
 *   Monument  →  Room[]  →  Tile[][] (grille 2D)
 *
 * Les **bâtiments de production** sont dans `BuildingType` + `buildingStore` (pas ici).
 */

import type { ResourceCostBag } from '@/types/ResourceType'

export type TileState = 'broken' | 'ready'

/**
 * Cost paid (in resources) to perform an action on a tile (e.g. repair).
 * Aliased on `ResourceCostBag` so every "spending" surface of the game
 * speaks the same shape.
 */
export type TileCost = ResourceCostBag

export interface Tile {
  /** Stable unique id, e.g. `age1.tile.bedroom.5`. */
  id: string
  /** Libellé pour tooltip / futurs textes (ex. nom de la zone réparée). */
  displayName?: string
  state: TileState
  /** Asset URL per state (placeholder data: URLs in dev are fine). */
  backgrounds: Record<TileState, string>
  /** Cost to repair this tile (slug → quantity). Empty = free. */
  repairCost?: TileCost
  /** Durée de « construction » en temps sim (s). Défaut côté store si absent. */
  repairDurationSeconds?: number
  /**
   * Case de remplissage (mur hors grille, trou, etc.) : pas de réparation, fond uni.
   * Les grilles irrégulières sont complétées avec ces tuiles côté data.
   */
  isVoid?: boolean
}

export interface Room {
  id: string
  name: string
  /** 2D grid of tiles. Outer = rows, inner = columns. */
  tiles: Tile[][]
}

/** Lieu d’ère à reconstruire (tuiles / pièces). Hors onglet Production. */
export interface Monument {
  id: string
  name: string
  /** Ère représentée par ce monument (sélection automatique dans l’UI). */
  era: number
  rooms: Room[]
  /**
   * Plan du monument : chaque ligne = une rangée, chaque cellule = `id` d’une pièce
   * (même id que dans `rooms`) ou `null` pour une case vide (cour, vide architectural).
   * Si absent, l’UI retombe sur la liste d’onglets classique.
   */
  roomLayout?: (string | null)[][]
}
