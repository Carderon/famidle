import type { Tile } from '@/types/MonumentType'
import { playableTile } from '../../tilePresets'

import br01 from '@/assets/monuments/age2/bathroom/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age2/bathroom/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age2/bathroom/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age2/bathroom/broken/tile-04.png?url'

import rd01 from '@/assets/monuments/age2/bathroom/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age2/bathroom/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age2/bathroom/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age2/bathroom/ready/tile-04.png?url'

export const bathroomTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.bathroom.1',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br01, ready: rd01 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
        { resourceSlug: 'age1.resource.cloth', quantity: 10 },
      ],
    ),
    playableTile(
      'age2.tile.bathroom.2',
      'Sol — coin nord-est',
      'broken',
      { broken: br02, ready: rd02 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
        { resourceSlug: 'age1.resource.cloth', quantity: 10 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.bathroom.3',
      'Sol — coin sud-ouest',
      'broken',
      { broken: br03, ready: rd03 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
        { resourceSlug: 'age1.resource.cloth', quantity: 10 },
      ],
    ),
    playableTile(
      'age2.tile.bathroom.4',
      'Sol — coin sud-est',
      'broken',
      { broken: br04, ready: rd04 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
        { resourceSlug: 'age1.resource.cloth', quantity: 10 },
      ],
    ),
  ],
]
