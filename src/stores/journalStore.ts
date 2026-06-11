import { defineStore } from 'pinia'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { EventType } from '@/types/EventType'
import type { JournalEntry } from '@/types/JournalType'
import { journalEntries } from '@/data/lore/journalEntries'
import { isEligible } from '@/engines/events/eventEngine'
import { useCharacterStore } from '@/stores/characterStore'
import { useClockStore } from '@/stores/clockStore'
import { useGameStateStore } from '@/stores/gameStateStore'

function toPseudoEvent(entry: JournalEntry): EventType {
  return {
    id: entry.id,
    trigger: entry.trigger,
    minEra: entry.minEra,
    maxEra: entry.maxEra,
  } as EventType
}

export const useJournalStore = defineStore('journal', () => {
  const clockStore = useClockStore()
  const characterStore = useCharacterStore()
  const gameState = useGameStateStore()
  const { elapsed, tick, uiTicksCount } = storeToRefs(clockStore)

  const unlockedEntries = computed((): JournalEntry[] => {
    void uiTicksCount.value
    const era = characterStore.getActiveCharacter()?.era ?? 0
    const ctx = { elapsed: elapsed.value, tick: tick.value, deltaTime: 0 }
    const deps = {
      getFlag: (flag: string) => gameState.getFlag(flag),
      getCounter: (counter: string) => gameState.getCounter(counter),
    }
    return journalEntries.filter((entry) => isEligible(toPseudoEvent(entry), ctx, era, deps))
  })

  return {
    unlockedEntries,
  }
})
