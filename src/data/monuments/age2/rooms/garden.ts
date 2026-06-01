import type { Tile } from '@/types/MonumentType'
import { backgroundPlaceholders, playableTile } from '../../tilePresets'

/** Grille 3×3 — 9 cases réparables (assets placeholder en attendant). */
export const gardenTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.garden.1',
      'Parcelle — nord-ouest',
      'broken',
      backgroundPlaceholders('G1'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile('age2.tile.garden.2', 'Parcelle — nord', 'broken', backgroundPlaceholders('G2'), [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
    playableTile(
      'age2.tile.garden.3',
      'Parcelle — nord-est',
      'broken',
      backgroundPlaceholders('G3'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
  ],
  [
    playableTile('age2.tile.garden.4', 'Parcelle — ouest', 'broken', backgroundPlaceholders('G4'), [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
    playableTile(
      'age2.tile.garden.5',
      'Parcelle — centre',
      'broken',
      backgroundPlaceholders('G5'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile('age2.tile.garden.6', 'Parcelle — est', 'broken', backgroundPlaceholders('G6'), [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
  ],
  [
    playableTile(
      'age2.tile.garden.7',
      'Parcelle — sud-ouest',
      'broken',
      backgroundPlaceholders('G7'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
    playableTile('age2.tile.garden.8', 'Parcelle — sud', 'broken', backgroundPlaceholders('G8'), [
      { resourceSlug: 'age1.resource.wood', quantity: 25 },
      { resourceSlug: 'age1.resource.stone', quantity: 25 },
    ]),
    playableTile(
      'age2.tile.garden.9',
      'Parcelle — sud-est',
      'broken',
      backgroundPlaceholders('G9'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 25 },
      ],
    ),
  ],
]
