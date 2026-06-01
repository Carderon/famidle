import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Building } from '@/types/BuildingType'
import { tickBuildings } from '@/engines/buildings/buildingEngine'
import { createBuildingsAge1 } from '@/data/buildings/age1'

export const useBuildingStore = defineStore('building', () => {
  const buildings = ref<Building[]>(createBuildingsAge1())

  function getBuilding(id: string) {
    return buildings.value.find((b) => b.id === id)
  }

  function applyGameTime(simElapsedSeconds: number) {
    tickBuildings(buildings.value, simElapsedSeconds)
  }

  return {
    buildings,
    getBuilding,
    applyGameTime,
  }
})
