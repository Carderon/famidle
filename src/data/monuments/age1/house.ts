import type { Monument } from '@/types/MonumentType'
import { bedroomTileGrid } from '@/data/monuments/age1/rooms/bedroom'

export function createCabin(): Monument {
  return {
    id: 'age1.building.house-1',
    name: 'Cabane',
    era: 1,
    rooms: [
      {
        id: 'age1.room.bedroom',
        name: 'Chambre',
        tiles: bedroomTileGrid,
      },
    ],
    roomLayout: [['age1.room.bedroom']],
  }
}
