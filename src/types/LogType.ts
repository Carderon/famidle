/** Catégories de journal. */
export type LogKind = 'system' | 'lore' | 'activity' | 'unlock' | 'gameplay'

export interface GameLogEntry {
  id: string
  message: string
  kind: LogKind
  /** Temps sim écoulé depuis le début de la partie (s). */
  simAt: number
}

export type AddLogFn = (message: string, kind?: LogKind) => void

/** Classes Tailwind par catégorie (message, pastille, légende). */
export interface LogKindStyle {
  message: string
  dot: string
  tag: string
}
