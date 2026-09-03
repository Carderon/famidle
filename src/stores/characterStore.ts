import { defineStore } from 'pinia'
import { useResourceStore } from './resourceStore'
import { useLogStore } from './logStore'
import { useGaugeStore } from './gaugeStore'
import { ref } from 'vue'

interface CharacterType {
  name: string
  classType: string
  level: number
  specialization: string | null
  isNew: boolean
  age: number
}

export const useCharacterStore = defineStore('character', () => {
  const characters = ref<CharacterType[]>([])

  const activeCharacterIndex = ref(0) // Index du personnage actuellement sélectionné

  const addCharacter = (classType: string) => {
    const resourceStore = useResourceStore()
    const logStore = useLogStore()
    const gaugeStore = useGaugeStore()

    const newCharacter: CharacterType = {
      name: '',
      classType,
      isNew: true,
      level: 0,
      specialization: null,
      // Le joueur démarre dans l'âge 1. La progression d'ère sera pilotée
      // plus tard par les events / improvements.
      age: 1,
    }

    // edit data of store regarding the localstorage, one per character ?
    resourceStore.initializeResources()
    logStore.initializeLogs()
    gaugeStore.initializeGauges()

    characters.value.push(newCharacter)
  }

  const getActiveCharacter = () => {
    return characters.value[activeCharacterIndex.value]
  }

  /** Nouvelle partie ou save corrompue : garantit au moins un personnage (ère 1). */
  function ensureDefaultCharacter(): void {
    if (characters.value.length > 0) return
    characters.value.push({
      name: '',
      classType: 'unset',
      isNew: true,
      level: 0,
      specialization: null,
      age: 1,
    })
    activeCharacterIndex.value = 0
  }

  function setAge(age: number) {
    const c = getActiveCharacter()
    if (c) c.age = age
  }

  return {
    characters,
    addCharacter,
    activeCharacterIndex,
    getActiveCharacter,
    ensureDefaultCharacter,
    setAge,
  }
})
