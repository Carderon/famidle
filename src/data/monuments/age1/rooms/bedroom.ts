import type { Tile, TileCost } from '@/types/MonumentType'
import { playableTile } from '@/data/monuments/tilePresets'

const BASE_COST: TileCost = [
  { resourceSlug: 'age1.resource.wood', quantity: 10 },
  { resourceSlug: 'age1.resource.stone', quantity: 10 },
  { resourceSlug: 'age1.resource.cloth', quantity: 10 },
]

const CENTER_COST: TileCost = [
  { resourceSlug: 'age1.resource.wood', quantity: 20 },
  { resourceSlug: 'age1.resource.stone', quantity: 20 },
  { resourceSlug: 'age1.resource.cloth', quantity: 20 },
]

/**
 * Chambre — âge 1
 *
 * Chaque case est décrite explicitement (pas de boucle, pas de glob).
 * Grille 3×3 : chaque ligne = un tableau de tuiles (même longueur par ligne pour le rendu).
 *
 * Pour une forme non rectangulaire : raccourcir une ligne et compléter avec
 * `voidCell('…id unique…')` (voir `tilePresets.ts`).
 *
 * Quand les PNG existent dans `src/assets/...`, remplace `devPlaceholderPair('…')` par :
 *   `import br01 from '@/assets/buildings/age1/bedroom/broken/tile-01.png?url'`
 *   puis `backgrounds: { broken: br01, ready: rd01 }`.
 */

import br01 from '@/assets/monuments/age1/bedroom/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age1/bedroom/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age1/bedroom/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age1/bedroom/broken/tile-04.png?url'
import br05 from '@/assets/monuments/age1/bedroom/broken/tile-05.png?url'
import br06 from '@/assets/monuments/age1/bedroom/broken/tile-06.png?url'
import br07 from '@/assets/monuments/age1/bedroom/broken/tile-07.png?url'
import br08 from '@/assets/monuments/age1/bedroom/broken/tile-08.png?url'
import br09 from '@/assets/monuments/age1/bedroom/broken/tile-09.png?url'

import rd01 from '@/assets/monuments/age1/bedroom/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age1/bedroom/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age1/bedroom/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age1/bedroom/ready/tile-04.png?url'
import rd05 from '@/assets/monuments/age1/bedroom/ready/tile-05.png?url'
import rd06 from '@/assets/monuments/age1/bedroom/ready/tile-06.png?url'
import rd07 from '@/assets/monuments/age1/bedroom/ready/tile-07.png?url'
import rd08 from '@/assets/monuments/age1/bedroom/ready/tile-08.png?url'
import rd09 from '@/assets/monuments/age1/bedroom/ready/tile-09.png?url'

/** Ligne 0 — nord */
const row0: Tile[] = [
  playableTile(
    'age1.tile.bedroom.1',
    'Sol — coin nord-ouest',
    'broken',
    { broken: br01, ready: rd01 },
    BASE_COST,
  ),
  playableTile(
    'age1.tile.bedroom.2',
    'Sol — nord',
    'broken',
    { broken: br02, ready: rd02 },
    BASE_COST,
  ),
  playableTile(
    'age1.tile.bedroom.3',
    'Sol — nord-est',
    'broken',
    { broken: br03, ready: rd03 },
    BASE_COST,
  ),
]

/** Ligne 1 — milieu (lit au centre) */
const row1: Tile[] = [
  playableTile(
    'age1.tile.bedroom.4',
    'Sol — ouest',
    'broken',
    { broken: br04, ready: rd04 },
    BASE_COST,
  ),
  playableTile(
    'age1.tile.bedroom.5',
    'Centre (lit)',
    'broken',
    { broken: br05, ready: rd05 },
    CENTER_COST,
  ),
  playableTile(
    'age1.tile.bedroom.6',
    'Sol — est',
    'broken',
    { broken: br06, ready: rd06 },
    BASE_COST,
  ),
]

/** Ligne 2 — sud */
const row2: Tile[] = [
  playableTile(
    'age1.tile.bedroom.7',
    'Sol — sud-ouest',
    'broken',
    { broken: br07, ready: rd07 },
    BASE_COST,
  ),
  playableTile(
    'age1.tile.bedroom.8',
    'Sol — sud',
    'broken',
    { broken: br08, ready: rd08 },
    BASE_COST,
  ),
  playableTile(
    'age1.tile.bedroom.9',
    'Sol — sud-est',
    'broken',
    { broken: br09, ready: rd09 },
    BASE_COST,
  ),
]

export const bedroomTileGrid: Tile[][] = [row0, row1, row2]
