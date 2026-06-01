import type { Tile } from '@/types/MonumentType'
import { backgroundPlaceholders, playableTile } from '../../tilePresets'

/**
 * Grille provisoire 2×3 (6 cases) — forme définitive à affiner.
 * Le verre sert aux coûts de réparation (vitrines, alambics, cloisons).
 */
export const laboratoryTileGridAge2: Tile[][] = [
  [
    playableTile(
      'age2.tile.laboratory.1',
      'Sol — nord-ouest',
      'broken',
      backgroundPlaceholders('L1'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 4 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.2',
      'Sol — nord',
      'broken',
      backgroundPlaceholders('L2'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 4 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.3',
      'Sol — nord-est',
      'broken',
      backgroundPlaceholders('L3'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 5 },
      ],
    ),
  ],
  [
    playableTile(
      'age2.tile.laboratory.4',
      'Sol — sud-ouest',
      'broken',
      backgroundPlaceholders('L4'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 4 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.5',
      'Sol — sud',
      'broken',
      backgroundPlaceholders('L5'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 5 },
      ],
    ),
    playableTile(
      'age2.tile.laboratory.6',
      'Sol — sud-est',
      'broken',
      backgroundPlaceholders('L6'),
      [
        { resourceSlug: 'age1.resource.wood', quantity: 25 },
        { resourceSlug: 'age1.resource.stone', quantity: 20 },
        { resourceSlug: 'age2.resource.glass', quantity: 6 },
      ],
    ),
  ],
]
