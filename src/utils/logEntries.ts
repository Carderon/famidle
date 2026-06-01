import type { GameLogEntry, LogKind } from '@/types/LogType'

let logIdSeq = 0

export function createLogEntry(
  message: string,
  kind: LogKind,
  simAt: number,
): GameLogEntry {
  logIdSeq += 1
  return {
    id: `log-${simAt}-${logIdSeq}`,
    message,
    kind,
    simAt,
  }
}
