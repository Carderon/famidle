import type { Building } from '@/types/BuildingType'

/**
 * Logique temps sim des bâtiments de production (débits, travailleurs, bonus, etc.).
 * Appelé depuis `buildingStore.applyGameTime` pour rester aligné sur l’horloge.
 */
export function tickBuildings(_buildings: Building[], _simElapsedSeconds: number): void {
  // TODO: production par bâtiment
}
