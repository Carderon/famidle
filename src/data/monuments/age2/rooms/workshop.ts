import type { Tile } from '@/types/MonumentType'
import { backgroundPlaceholders, playableTile } from '../../tilePresets'

import br01 from '@/assets/monuments/age2/workshop/broken/tile-01.png?url'
import br02 from '@/assets/monuments/age2/workshop/broken/tile-02.png?url'
import br03 from '@/assets/monuments/age2/workshop/broken/tile-03.png?url'
import br04 from '@/assets/monuments/age2/workshop/broken/tile-04.png?url'
import br05 from '@/assets/monuments/age2/workshop/broken/tile-05.png?url'
import br06 from '@/assets/monuments/age2/workshop/broken/tile-06.png?url'
import br07 from '@/assets/monuments/age2/workshop/broken/tile-07.png?url'
import br08 from '@/assets/monuments/age2/workshop/broken/tile-08.png?url'
import br09 from '@/assets/monuments/age2/workshop/broken/tile-09.png?url'
import br10 from '@/assets/monuments/age2/workshop/broken/tile-10.png?url'
import br11 from '@/assets/monuments/age2/workshop/broken/tile-11.png?url'
import br12 from '@/assets/monuments/age2/workshop/broken/tile-12.png?url'
import br13 from '@/assets/monuments/age2/workshop/broken/tile-13.png?url'
import br14 from '@/assets/monuments/age2/workshop/broken/tile-14.png?url'
import br15 from '@/assets/monuments/age2/workshop/broken/tile-15.png?url'
import br16 from '@/assets/monuments/age2/workshop/broken/tile-16.png?url'
import br17 from '@/assets/monuments/age2/workshop/broken/tile-17.png?url'
import br18 from '@/assets/monuments/age2/workshop/broken/tile-18.png?url'
import br19 from '@/assets/monuments/age2/workshop/broken/tile-19.png?url'
import br20 from '@/assets/monuments/age2/workshop/broken/tile-20.png?url'
import br21 from '@/assets/monuments/age2/workshop/broken/tile-21.png?url'
import br22 from '@/assets/monuments/age2/workshop/broken/tile-22.png?url'
import br23 from '@/assets/monuments/age2/workshop/broken/tile-23.png?url'
import br24 from '@/assets/monuments/age2/workshop/broken/tile-24.png?url'
import br25 from '@/assets/monuments/age2/workshop/broken/tile-25.png?url'
import br26 from '@/assets/monuments/age2/workshop/broken/tile-26.png?url'
import br27 from '@/assets/monuments/age2/workshop/broken/tile-27.png?url'
import br28 from '@/assets/monuments/age2/workshop/broken/tile-28.png?url'
import br29 from '@/assets/monuments/age2/workshop/broken/tile-29.png?url'
import br30 from '@/assets/monuments/age2/workshop/broken/tile-30.png?url'
import br31 from '@/assets/monuments/age2/workshop/broken/tile-31.png?url'
import br32 from '@/assets/monuments/age2/workshop/broken/tile-32.png?url'

import rd01 from '@/assets/monuments/age2/workshop/ready/tile-01.png?url'
import rd02 from '@/assets/monuments/age2/workshop/ready/tile-02.png?url'
import rd03 from '@/assets/monuments/age2/workshop/ready/tile-03.png?url'
import rd04 from '@/assets/monuments/age2/workshop/ready/tile-04.png?url'
import rd05 from '@/assets/monuments/age2/workshop/ready/tile-05.png?url'
import rd06 from '@/assets/monuments/age2/workshop/ready/tile-06.png?url'
import rd07 from '@/assets/monuments/age2/workshop/ready/tile-07.png?url'
import rd08 from '@/assets/monuments/age2/workshop/ready/tile-08.png?url'
import rd09 from '@/assets/monuments/age2/workshop/ready/tile-09.png?url'
import rd10 from '@/assets/monuments/age2/workshop/ready/tile-10.png?url'
import rd11 from '@/assets/monuments/age2/workshop/ready/tile-11.png?url'
import rd12 from '@/assets/monuments/age2/workshop/ready/tile-12.png?url'
import rd13 from '@/assets/monuments/age2/workshop/ready/tile-13.png?url'
import rd14 from '@/assets/monuments/age2/workshop/ready/tile-14.png?url'
import rd15 from '@/assets/monuments/age2/workshop/ready/tile-15.png?url'
import rd16 from '@/assets/monuments/age2/workshop/ready/tile-16.png?url'
import rd17 from '@/assets/monuments/age2/workshop/ready/tile-17.png?url'
import rd18 from '@/assets/monuments/age2/workshop/ready/tile-18.png?url'
import rd19 from '@/assets/monuments/age2/workshop/ready/tile-19.png?url'
import rd20 from '@/assets/monuments/age2/workshop/ready/tile-20.png?url'
import rd21 from '@/assets/monuments/age2/workshop/ready/tile-21.png?url'
import rd22 from '@/assets/monuments/age2/workshop/ready/tile-22.png?url'
import rd23 from '@/assets/monuments/age2/workshop/ready/tile-23.png?url'
import rd24 from '@/assets/monuments/age2/workshop/ready/tile-24.png?url'
import rd25 from '@/assets/monuments/age2/workshop/ready/tile-25.png?url'
import rd26 from '@/assets/monuments/age2/workshop/ready/tile-26.png?url'
import rd27 from '@/assets/monuments/age2/workshop/ready/tile-27.png?url'
import rd28 from '@/assets/monuments/age2/workshop/ready/tile-28.png?url'
import rd29 from '@/assets/monuments/age2/workshop/ready/tile-29.png?url'
import rd30 from '@/assets/monuments/age2/workshop/ready/tile-30.png?url'
import rd31 from '@/assets/monuments/age2/workshop/ready/tile-31.png?url'
import rd32 from '@/assets/monuments/age2/workshop/ready/tile-32.png?url'

export const workshopTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.workshop.1',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br01, ready: rd01 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.2',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br02, ready: rd02 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.3',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br03, ready: rd03 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.4',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br04, ready: rd04 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.5',
      'Sol — coin nord-est',
      'broken',
      { broken: br05, ready: rd05 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.6',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br06, ready: rd06 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.7',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br07, ready: rd07 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.8',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br08, ready: rd08 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.workshop.9',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br09, ready: rd09 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.10',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br10, ready: rd10 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.workshop.11',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br11, ready: rd11 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.12',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br12, ready: rd12 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.13',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br13, ready: rd13 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.14',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br14, ready: rd14 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.15',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br15, ready: rd15 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.16',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br16, ready: rd16 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.workshop.17',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br17, ready: rd17 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.18',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br18, ready: rd18 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.19',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br19, ready: rd19 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.20',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br20, ready: rd20 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.21',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br21, ready: rd21 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.22',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br22, ready: rd22 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.23',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br23, ready: rd23 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.24',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br24, ready: rd24 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.workshop.25',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br25, ready: rd25 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.26',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br26, ready: rd26 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.27',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br27, ready: rd27 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.28',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br28, ready: rd28 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.29',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br29, ready: rd29 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.30',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br30, ready: rd30 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.31',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br31, ready: rd31 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
    playableTile(
      'age2.tile.workshop.32',
      'Sol — coin nord-ouest',
      'broken',
      { broken: br32, ready: rd32 },
      [
        { resourceSlug: 'age1.resource.wood', quantity: 30 },
        { resourceSlug: 'age1.resource.stone', quantity: 30 },
      ],
    ),
  ],
]
