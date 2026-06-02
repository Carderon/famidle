import type { GaugeCostBag } from '@/types/EventType'
import type { ResourceCostBag } from '@/types/ResourceType'

/** Clic immédiat vs production sur la durée (ère 2, slots limités). */
export type ActivityKind = 'instant' | 'timed'

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
  slug: string
  variant: ActivityCinematicVariant
}

/** Libellés immersifs pour les activités timed en boucle (tooltips, pas de pastilles UI). */
export interface ActivityTimedStatusCopy {
  /** Ex. « Un convoi est en route. » — cycle en cours. */
  ongoing?: string
  /** Ex. « Plusieurs voyages d’affilée… » — boucle active. */
  looping?: string
  /** Ex. « Dernier voyage, puis pause. » — arrêt demandé au prochain retour. */
  stopPending?: string
}

/**
 * Slot d’activité **timed** en cours (coûts payés au démarrage, remboursés si annulation).
 */
export interface ActiveTimedActivity {
  slug: string
  completeAt: number
  paidResourceCosts: ResourceCostBag
  paidGaugeCosts?: GaugeCostBag
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
  /** Ère minimale du personnage actif (`era >= minEra`). */
  minEra?: number
  /** Ère maximale du personnage actif (`era <= maxEra`). */
  maxEra?: number
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
  /** Textes tooltips pour timed en boucle (remplace les pastilles « auto » / « stop »). */
  timedStatus?: ActivityTimedStatusCopy
  /**
   * `instant` (défaut) : un clic applique tout de suite coûts + effets, puis cooldown.
   * `timed` : coûts au démarrage, effets à la fin de `durationSeconds` (ère 2, concurrence limitée).
   * Les `timed` relancent un nouveau cycle tout seuls après le cooldown ; un second clic
   * demande l’arrêt : le cycle en cours (jusqu’à récompense + pause) se termine, sans relance.
   */
  kind?: ActivityKind
  /** Obligatoire si `kind === 'timed'`. Temps sim (s) jusqu’aux effets. */
  durationSeconds?: number
  /** Délai minimum entre deux **fin** d’utilisation (après effets pour instant, après complétion pour timed). */
  cooldownSeconds: number
  costs?: ResourceCostBag
  gaugeCosts?: GaugeCostBag
  conditions?: ActivityConditionType
  effects?: ActivityEffectType[]
  /** Mis à jour par `activityStore.updateActivityVisibility`. */
  isVisible: boolean
}
