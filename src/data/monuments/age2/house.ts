import type { Monument } from '@/types/MonumentType'
import { bedroomTileGridAge2 } from '@/data/monuments/age2/rooms/bedroom'
import { kitchenTileGridAge2 } from '@/data/monuments/age2/rooms/kitchen'
import { libraryTileGridAge2 } from '@/data/monuments/age2/rooms/library'
import { bathroomTileGridAge2 } from '@/data/monuments/age2/rooms/bathroom'
import { workshopTileGridAge2 } from '@/data/monuments/age2/rooms/workshop'
import { gardenTileGridAge2 } from '@/data/monuments/age2/rooms/garden'
import { laboratoryTileGridAge2 } from '@/data/monuments/age2/rooms/laboratory'

export function createHouse(): Monument {
  return {
    id: 'age2.building.house-2',
    name: 'Maison',
    era: 2,
    rooms: [
      {
        id: 'age2.room.bedroom',
        name: 'Chambre',
        tiles: bedroomTileGridAge2,
      },
      { id: 'age2.room.kitchen', name: 'Cuisine', tiles: kitchenTileGridAge2 },
      { id: 'age2.room.library', name: 'Bibliothèque', tiles: libraryTileGridAge2 },
      { id: 'age2.room.bathroom', name: 'Bains', tiles: bathroomTileGridAge2 },
      { id: 'age2.room.workshop', name: 'Atelier', tiles: workshopTileGridAge2 },
      { id: 'age2.room.garden', name: 'Jardin', tiles: gardenTileGridAge2 },
      { id: 'age2.room.laboratory', name: 'Laboratoire', tiles: laboratoryTileGridAge2 },
    ],
    /**
     * Plan étage (exemple) — modifie le tableau pour placer les pièces les unes par rapport aux autres.
     * Chaque chaîne doit correspondre à un `rooms[].id`.
     */
    roomLayout: [
      ['age2.room.bedroom', 'age2.room.bathroom', null],
      [null, 'age2.room.kitchen', null],
      ['age2.room.library', 'age2.room.workshop', 'age2.room.garden'],
      ['age2.room.laboratory', null, null],
    ],
  }
}
