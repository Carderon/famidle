import type { Tile } from '@/types/MonumentType'
import { playableTile } from '../../tilePresets'

import br01 from '@/assets/monuments/age2/library/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age2/library/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age2/library/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age2/library/broken/tile-04.png?url'
import br05 from '@/assets/monuments/age2/library/broken/tile-05.png?url'
import br06 from '@/assets/monuments/age2/library/broken/tile-06.png?url'
import br07 from '@/assets/monuments/age2/library/broken/tile-07.png?url'
import br08 from '@/assets/monuments/age2/library/broken/tile-08.png?url'

import rd01 from '@/assets/monuments/age2/library/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age2/library/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age2/library/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age2/library/ready/tile-04.png?url'
import rd05 from '@/assets/monuments/age2/library/ready/tile-05.png?url'
import rd06 from '@/assets/monuments/age2/library/ready/tile-06.png?url'
import rd07 from '@/assets/monuments/age2/library/ready/tile-07.png?url'
import rd08 from '@/assets/monuments/age2/library/ready/tile-08.png?url'

export const libraryTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.library.1',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br01, ready: rd01 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
    playableTile(
      'age2.tile.library.2',
      'Sol — coin nord-est',
      'broken',
      { broken: br02, ready: rd02 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.library.3',
      'Sol — coin sud-ouest',
      'broken',
      { broken: br03, ready: rd03 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
    playableTile(
      'age2.tile.library.4',
      'Sol — coin sud-est',
      'broken',
      { broken: br04, ready: rd04 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.library.5',
      'Sol — coin centre',
      'broken',
      { broken: br05, ready: rd05 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
    playableTile(
      'age2.tile.library.6',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br06, ready: rd06 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.library.7',
      'Sol — coin nord-est',
      'broken',
      { broken: br07, ready: rd07 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
    playableTile(
      'age2.tile.library.8',
      'Sol — coin sud-ouest',
      'broken',
      { broken: br08, ready: rd08 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 20 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.plantFiber', quantity: 10 },
      ],
    ),
  ],
]
