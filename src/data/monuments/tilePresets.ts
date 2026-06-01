import type { Tile, TileCost, TileState } from '@/types/MonumentType'

/** Carré noir (cassé = réparé visuellement identique). */
const BLACK_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0a0a0a"/></svg>`,
)}`

/**
 * Case « vide » / remplissage de grille (pas de gameplay réparation).
 * @param id — doit rester unique dans tout le monde (ex. `age1.tile.void.bedroom.r0c3`).
 */
export function voidCell(id: string, displayName = '—'): Tile {
  return {
    id,
    displayName,
    state: 'ready',
    backgrounds: { broken: BLACK_SVG, ready: BLACK_SVG },
    repairCost: [],
    repairDurationSeconds: 0,
    isVoid: true,
  }
}

/**
 * Paires d’images explicites pour le dev (SVG) — remplace par de vraies URLs
 * (`import toto from '...png?url'`) quand les assets existent.
 */
export function backgroundPlaceholders(code: string): Record<TileState, string> {
  const broken = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#3d2b1f"/><text x="50" y="58" font-size="22" text-anchor="middle" fill="#fca5a5" font-family="system-ui">×</text><text x="50" y="88" font-size="11" text-anchor="middle" fill="#d6c4b5" font-family="system-ui">${escapeXml(
      code,
    )}</text></svg>`,
  )}`
  const ready = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#2d4a3a"/><text x="50" y="58" font-size="22" text-anchor="middle" fill="#86efac" font-family="system-ui">✓</text><text x="50" y="88" font-size="11" text-anchor="middle" fill="#c8e6d5" font-family="system-ui">${escapeXml(
      code,
    )}</text></svg>`,
  )}`
  return { broken, ready }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

/** Fabrique une tuile réparable : une ligne par case dans la grille pièce. */
export function playableTile(
  id: string,
  displayName: string,
  state: TileState,
  backgrounds: Record<TileState, string>,
  repairCost: TileCost,
  repairDurationSeconds = 6,
): Tile {
  return {
    id,
    displayName,
    state,
    backgrounds,
    repairCost,
    repairDurationSeconds,
  }
}
