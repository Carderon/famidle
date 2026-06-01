import type { Building } from '@/types/BuildingType'

/** Bâtiments de production (âge 1) — données initiales. */
export function createBuildingsAge1(): Building[] {
  return [
    {
      id: 'age1.production.wood-pile',
      name: 'Réserve de bois',
      detail: 'À brancher sur le moteur de production',
    },
  ]
}
