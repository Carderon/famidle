import type { Tile } from '@/types/MonumentType'
import { playableTile } from '../../tilePresets'

/**
 * Grille 2×3 — six cases.
 * Le verre finance vitrines, alambics et cloisons ; le centre demande plus de lames.
 */

import br01 from '@/assets/monuments/age2/laboratory/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age2/laboratory/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age2/laboratory/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age2/laboratory/broken/tile-04.png?url'
import br05 from '@/assets/monuments/age2/laboratory/broken/tile-05.png?url'
import br06 from '@/assets/monuments/age2/laboratory/broken/tile-06.png?url'
import br07 from '@/assets/monuments/age2/laboratory/broken/tile-07.png?url'
import br08 from '@/assets/monuments/age2/laboratory/broken/tile-08.png?url'

import rd01 from '@/assets/monuments/age2/laboratory/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age2/laboratory/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age2/laboratory/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age2/laboratory/ready/tile-04.png?url'
import rd05 from '@/assets/monuments/age2/laboratory/ready/tile-05.png?url'
import rd06 from '@/assets/monuments/age2/laboratory/ready/tile-06.png?url'
import rd07 from '@/assets/monuments/age2/laboratory/ready/tile-07.png?url'
import rd08 from '@/assets/monuments/age2/laboratory/ready/tile-08.png?url'

export const laboratoryTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.laboratory.1',
      'Laboratoire - coin nord-ouest',
      'broken',
      { broken: br01, ready: rd01 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 4 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.2',
      'Laboratoire — mur nord-ouest',
      'broken',
      { broken: br02, ready: rd02 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 4 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.3',
      'Laboratoire — mur nord-est',
      'broken',
      { broken: br03, ready: rd03 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 5 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.4',
      'Laboratoire — coin nord-est',
      'broken',
      { broken: br04, ready: rd04 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 4 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.laboratory.5',
      'Laboratoire — coin sud-ouest',
      'broken',
      { broken: br05, ready: rd05 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 5 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.6',
      'Laboratoire — mur sud-ouest',
      'broken',
      { broken: br06, ready: rd06 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 6 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.7',
      'Laboratoire — mur sud-est',
      'broken',
      { broken: br07, ready: rd07 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 7 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.8',
      'Laboratoire — coin sud-est',
      'broken',
      { broken: br08, ready: rd08 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 8 },
      ],
    ),
  ],
]
