import type { LogKind, LogKindStyle } from '@/types/LogType'

export const LOG_KIND_ORDER: readonly LogKind[] = [
  'lore',
  'unlock',
  'activity',
  'gameplay',
  'system',
] as const

export const LOG_KIND_LABELS: Record<LogKind, string> = {
  system: 'Système',
  lore: 'Récit',
  activity: 'Action',
  unlock: 'Déblocage',
  gameplay: 'Jeu',
}

export const LOG_KIND_STYLES: Record<LogKind, LogKindStyle> = {
  system: {
    message: 'text-neutral-400 italic',
    dot: 'bg-neutral-500',
    tag: 'text-neutral-500',
  },
  lore: {
    message: 'text-amber-200/95 dark:text-amber-200/90',
    dot: 'bg-amber-400',
    tag: 'text-amber-600 dark:text-amber-400/80',
  },
  unlock: {
    message: 'text-emerald-700 dark:text-emerald-300/95',
    dot: 'bg-emerald-500',
    tag: 'text-emerald-600 dark:text-emerald-400/80',
  },
  activity: {
    message: 'text-sky-800 dark:text-sky-300/95',
    dot: 'bg-sky-500',
    tag: 'text-sky-700 dark:text-sky-400/80',
  },
  gameplay: {
    message: 'text-neutral-700 dark:text-neutral-300',
    dot: 'bg-neutral-400',
    tag: 'text-neutral-500 dark:text-neutral-500',
  },
}
