import { createLogEntry } from '@/utils/logEntries'
import type { GameLogEntry, LogKind } from '@/types/LogType'

function isLogKind(value: unknown): value is LogKind {
  return (
    value === 'system' ||
    value === 'lore' ||
    value === 'activity' ||
    value === 'unlock' ||
    value === 'gameplay'
  )
}

/** Migration sauvegardes v1 (`string[]`) → entrées structurées. */
export function normalizeLogs(saved: unknown): GameLogEntry[] {
  if (!Array.isArray(saved)) return []
  return saved.map((entry, index) => {
    if (typeof entry === 'string') {
      return createLogEntry(entry, 'gameplay', 0)
    }
    if (entry && typeof entry === 'object') {
      const raw = entry as Partial<GameLogEntry>
      const kind = isLogKind(raw.kind) ? raw.kind : 'gameplay'
      return {
        id: typeof raw.id === 'string' ? raw.id : `legacy-${index}`,
        message: String(raw.message ?? ''),
        kind,
        simAt: typeof raw.simAt === 'number' ? raw.simAt : 0,
      }
    }
    return createLogEntry(String(entry), 'gameplay', 0)
  })
}
