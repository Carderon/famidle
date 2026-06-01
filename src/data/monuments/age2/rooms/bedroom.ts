import type { Tile, TileCost } from '@/types/MonumentType'
import { playableTile } from '@/data/monuments/tilePresets'

/**
 * Chambre — âge 2 (tuto terminé : tout est déjà « réparé »).
 * Même disposition 3×3, coûts vides, état `ready`.
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

const NO_COST: TileCost = []

const row0: Tile[] = [
  playableTile(
    'age2.tile.bedroom.1',
    'Sol — coin nord-ouest',
    'ready',
    { broken: br01, ready: rd01 },
    NO_COST,
  ),
  playableTile(
    'age2.tile.bedroom.2',
    'Sol — nord',
    'ready',
    { broken: br02, ready: rd02 },
    NO_COST,
  ),
  playableTile(
    'age2.tile.bedroom.3',
    'Sol — nord-est',
    'ready',
    { broken: br03, ready: rd03 },
    NO_COST,
  ),
]

const row1: Tile[] = [
  playableTile(
    'age2.tile.bedroom.4',
    'Sol — ouest',
    'ready',
    { broken: br04, ready: rd04 },
    NO_COST,
  ),
  playableTile(
    'age2.tile.bedroom.5',
    'Centre (lit)',
    'ready',
    { broken: br05, ready: rd05 },
    NO_COST,
  ),
  playableTile('age2.tile.bedroom.6', 'Sol — est', 'ready', { broken: br06, ready: rd06 }, NO_COST),
]

const row2: Tile[] = [
  playableTile(
    'age2.tile.bedroom.7',
    'Sol — sud-ouest',
    'ready',
    { broken: br07, ready: rd07 },
    NO_COST,
  ),
  playableTile('age2.tile.bedroom.8', 'Sol — sud', 'ready', { broken: br08, ready: rd08 }, NO_COST),
  playableTile(
    'age2.tile.bedroom.9',
    'Sol — sud-est',
    'ready',
    { broken: br09, ready: rd09 },
    NO_COST,
  ),
]

export const bedroomTileGridAge2: Tile[][] = [row0, row1, row2]
