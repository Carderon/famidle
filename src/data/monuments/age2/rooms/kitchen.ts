import type { Tile } from '@/types/MonumentType'
import { playableTile } from '../../tilePresets'

import br01 from '@/assets/monuments/age2/kitchen/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age2/kitchen/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age2/kitchen/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age2/kitchen/broken/tile-04.png?url'
import br05 from '@/assets/monuments/age2/kitchen/broken/tile-05.png?url'
import br06 from '@/assets/monuments/age2/kitchen/broken/tile-06.png?url'
import br07 from '@/assets/monuments/age2/kitchen/broken/tile-07.png?url'
import br08 from '@/assets/monuments/age2/kitchen/broken/tile-08.png?url'
import br09 from '@/assets/monuments/age2/kitchen/broken/tile-09.png?url'
import br10 from '@/assets/monuments/age2/kitchen/broken/tile-10.png?url'

import rd01 from '@/assets/monuments/age2/kitchen/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age2/kitchen/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age2/kitchen/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age2/kitchen/ready/tile-04.png?url'
import rd05 from '@/assets/monuments/age2/kitchen/ready/tile-05.png?url'
import rd06 from '@/assets/monuments/age2/kitchen/ready/tile-06.png?url'
import rd07 from '@/assets/monuments/age2/kitchen/ready/tile-07.png?url'
import rd08 from '@/assets/monuments/age2/kitchen/ready/tile-08.png?url'
import rd09 from '@/assets/monuments/age2/kitchen/ready/tile-09.png?url'
import rd10 from '@/assets/monuments/age2/kitchen/ready/tile-10.png?url'

export const kitchenTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.kitchen.1',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br01, ready: rd01 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.2',
      'Sol — coin nord-est',
      'broken',
      { broken: br02, ready: rd02 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.3',
      'Sol — coin sud-ouest',
      'broken',
      { broken: br03, ready: rd03 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.4',
      'Sol — coin sud-est',
      'broken',
      { broken: br04, ready: rd04 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.5',
      'Sol — coin centre',
      'broken',
      { broken: br05, ready: rd05 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.kitchen.6',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br06, ready: rd06 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.7',
      'Sol — coin nord-est',
      'broken',
      { broken: br07, ready: rd07 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.8',
      'Sol — coin sud-ouest',
      'broken',
      { broken: br08, ready: rd08 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.9',
      'Sol — coin sud-est',
      'broken',
      { broken: br09, ready: rd09 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
    playableTile(
      'age2.tile.kitchen.10',
      'Sol — coin centre',
      'broken',
      { broken: br10, ready: rd10 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
      ],
    ),
  ],
]
