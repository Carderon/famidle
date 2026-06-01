import type { Tile } from '@/types/MonumentType'
import { backgroundPlaceholders, playableTile } from '../../tilePresets'

const br01 = backgroundPlaceholders('G1').broken
const br02 = backgroundPlaceholders('G2').broken
const br03 = backgroundPlaceholders('G3').broken
const br04 = backgroundPlaceholders('G4').broken
const br05 = backgroundPlaceholders('G5').broken
const br06 = backgroundPlaceholders('G6').broken
const br07 = backgroundPlaceholders('G7').broken
const br08 = backgroundPlaceholders('G8').broken
const rd01 = backgroundPlaceholders('G1').ready
const rd02 = backgroundPlaceholders('G2').ready
const rd03 = backgroundPlaceholders('G3').ready
const rd04 = backgroundPlaceholders('G4').ready
const rd05 = backgroundPlaceholders('G5').ready
const rd06 = backgroundPlaceholders('G6').ready
const rd07 = backgroundPlaceholders('G7').ready
const rd08 = backgroundPlaceholders('G8').ready

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
