import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normalizeLogs } from '@/persistence/logNormalize'
import { useClockStore } from '@/stores/clockStore'
import { createLogEntry } from '@/utils/logEntries'
import type { GameLogEntry, LogKind } from '@/types/LogType'

const MAX_LOGS = 120

export const useLogStore = defineStore('log', () => {
  const logs = ref<GameLogEntry[]>([])

  function addLog(message: string, kind: LogKind = 'gameplay') {
    const simAt = useClockStore().elapsed
    logs.value.push(createLogEntry(message, kind, simAt))
    if (logs.value.length > MAX_LOGS) {
      logs.value.shift()
    }
  }

  function initializeLogs() {
    logs.value = []
  }

  /** Hydrate depuis sauvegarde (y compris anciens `string[]`). */
  function hydrateLogs(saved: unknown) {
    logs.value = normalizeLogs(saved)
  }

  return {
    logs,
    addLog,
    initializeLogs,
    hydrateLogs,
  }
})
