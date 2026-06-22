import type { GaugeCostBag } from '@/types/EventType'
import type { ResourceCostBag } from '@/types/ResourceType'

/**
 * Modèle unifié d’activité (voir `docs/ACTIVITY.md`).
 *
 * - `non_repeatable` : une exécution (peut avoir duration/cooldown)
 * - `repeatable` : se relance tant que ça a un effet sur les stocks + conditions/ coûts OK
 * - `alone` : autorisé seulement si aucune activité n’est en cours (prod ou cooldown)
 */
export type ActivityKind = 'non_repeatable' | 'repeatable' | 'alone'

/** Regroupement UI des activités (ordre d’affichage via `ACTIVITY_CATEGORY_ORDER`). */
export type ActivityCategory = 'gather' | 'rest' | 'travel'

export const ACTIVITY_CATEGORY_ORDER: readonly ActivityCategory[] = [
  'gather',
  'rest',
  'travel',
] as const

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  gather: 'Récolte',
  rest: 'Repos',
  travel: 'Voyages',
}

/** Variante visuelle pour `Cinematics.vue` pendant `blocksInterface`. */
export type ActivityCinematicVariant = 'sleep'

export interface ActiveCinematicState {
  /** Identifie l’origine (activité, event, monument, etc.). */
  source: string
  slug: string
  variant: ActivityCinematicVariant
  /** Fin prévue en temps sim (s). */
  endsAtSim: number
}

/** Libellés immersifs pour les activités en boucle (tooltips). */
export interface ActivityLoopStatusCopy {
  /** Ex. « Un convoi est en route. » — cycle en cours. */
  ongoing?: string
  /** Ex. « Plusieurs voyages d’affilée… » — boucle active. */
  looping?: string
  /** Ex. « Dernier voyage, puis pause. » — arrêt demandé au prochain retour. */
  stopPending?: string
}

export type RunningActivityPhase = 'producing' | 'cooldown'

/** Activité en cours (production) ou en récupération (cooldown). */
export interface RunningActivity {
  slug: string
  kind: ActivityKind
  phase: RunningActivityPhase
  /** Fin de la phase courante (temps sim). */
  endsAtSim: number
  /** Repeatable: arrêt demandé (fin de cycle puis cooldown → stop). */
  stopAfterThisCycle?: boolean
}

/**
 * Conditions pour qu'une activité soit visible / utilisable (ET logique).
 * Proche des améliorations, avec un flag optionnel (déblocage UI, quêtes…).
 */
export interface ActivityConditionType {
  requiredClass?: string
  requiredSpecialization?: string
  minLevel?: number
  minResourceQuantity?: Record<string, number>
  requiredImprovement?: string
  /** Le flag doit être `true` (ex. `ui.flag.activityShown`). */
  requiredFlag?: string
  /** Si ce flag est `true`, l’activité reste masquée (ex. cacher « Se reposer » quand « Dormir » est débloqué). */
  hiddenWhenFlag?: string
  /** Masque l’activité quand le compteur atteint `atLeast` (ex. crassier épuisé). */
  hiddenWhenCounterAtLeast?: { name: string; atLeast: number }
}

/** Effets one-shot appliqués au moment où l'activité est résolue. */
export type ActivityEffectType =
  | { kind: 'log'; message: string }
  /**
   * Journal : une seule fois par sauvegarde.
   * Clé de persistance : `log.once.<logKey>` (défaut : slug de l’activité).
   */
  | { kind: 'logOnce'; message: string; logKey?: string }
  | { kind: 'setFlag'; flag: string; value?: boolean }
  | { kind: 'incrementCounter'; counter: string; by?: number }
  | { kind: 'addResource'; resourceSlug: string; amount: number }
  | { kind: 'addGauge'; gaugeSlug: string; amount: number }
  | { kind: 'toggleFlag'; flag: string }

export interface ActivityType {
  slug: string
  name: string
  /** Section dans la liste d’activités. */
  category: ActivityCategory
  /** Tri dans la catégorie (croissant). */
  sortOrder?: number
  flavourText?: string
  /**
   * Bloque toute l’interface (`ui.flag.cinematicActive`) le temps de la cinématique.
   * Effets et cooldown appliqués à la fin de `cinematicDurationSeconds`.
   */
  blocksInterface?: boolean
  /** Durée réelle (s) de la cinématique si `blocksInterface`. */
  cinematicDurationSeconds?: number
  cinematicVariant?: ActivityCinematicVariant
  /** Textes tooltips pour boucle (repeatable). */
  timedStatus?: ActivityLoopStatusCopy
  kind?: ActivityKind
  /** Temps sim (s) jusqu’aux effets. Si absent/≤0 : résolution immédiate. */
  durationSeconds?: number
  /** Délai minimum entre deux **fin** d’utilisation (après effets pour instant, après complétion pour timed). */
  cooldownSeconds: number
  costs?: ResourceCostBag
  gaugeCosts?: GaugeCostBag
  conditions?: ActivityConditionType
  effects?: ActivityEffectType[]
  /** Mis à jour par `activityStore.updateActivityVisibility`. */
  isVisible: boolean
  // interdit tant que runningActivities.length > 0
  requiresIdle?: boolean
}
