import type { Tile } from '@/types/MonumentType'
import { playableTile } from '../../tilePresets'

import br01 from '@/assets/monuments/age2/garden/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age2/garden/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age2/garden/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age2/garden/broken/tile-04.png?url'
import br05 from '@/assets/monuments/age2/garden/broken/tile-05.png?url'
import br06 from '@/assets/monuments/age2/garden/broken/tile-06.png?url'
import br07 from '@/assets/monuments/age2/garden/broken/tile-07.png?url'
import br08 from '@/assets/monuments/age2/garden/broken/tile-08.png?url'
import br09 from '@/assets/monuments/age2/garden/broken/tile-09.png?url'

import rd01 from '@/assets/monuments/age2/garden/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age2/garden/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age2/garden/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age2/garden/ready/tile-04.png?url'
import rd05 from '@/assets/monuments/age2/garden/ready/tile-05.png?url'
import rd06 from '@/assets/monuments/age2/garden/ready/tile-06.png?url'
import rd07 from '@/assets/monuments/age2/garden/ready/tile-07.png?url'
import rd08 from '@/assets/monuments/age2/garden/ready/tile-08.png?url'
import rd09 from '@/assets/monuments/age2/garden/ready/tile-09.png?url'

export const gardenTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.garden.1',
      'Parcelle — nord-ouest',
      'broken',
      { broken: br01, ready: rd01 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile('age2.tile.garden.2', 'Parcelle — nord', 'broken', { broken: br02, ready: rd02 }, [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
    playableTile(
      'age2.tile.garden.3',
      'Parcelle — nord-est',
      'broken',
      { broken: br03, ready: rd03 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.garden.4',
      'Parcelle — ouest',
      'broken',
      { broken: br04, ready: rd04 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile(
      'age2.tile.garden.5',
      'Parcelle — centre',
      'broken',
      { broken: br05, ready: rd05 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile('age2.tile.garden.6', 'Parcelle — est', 'broken', { broken: br06, ready: rd06 }, [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
  ],
  [
    playableTile(
      'age2.tile.garden.7',
      'Parcelle — sud-ouest',
      'broken',
      { broken: br07, ready: rd07 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile('age2.tile.garden.8', 'Parcelle — sud', 'broken', { broken: br08, ready: rd08 }, [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
    playableTile(
      'age2.tile.garden.9',
      'Parcelle — sud-est',
      'broken',
      { broken: br09, ready: rd09 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
  ],
]
