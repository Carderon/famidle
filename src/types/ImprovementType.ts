import type { ResourceCostBag } from '@/types/ResourceType'

/** Regroupement UI des améliorations (ordre via `IMPROVEMENT_CATEGORY_ORDER`). */
export type ImprovementCategory = 'introspection' | 'reconstruction' | 'era' | 'production'

export const IMPROVEMENT_CATEGORY_ORDER: readonly ImprovementCategory[] = [
  'introspection',
  'reconstruction',
  'era',
  'production',
] as const

export const IMPROVEMENT_CATEGORY_LABELS: Record<ImprovementCategory, string> = {
  introspection: 'Introspection',
  reconstruction: 'Reconstruction',
  era: 'Ère',
  production: 'Production',
}

/** Jalons narratifs (ère, révélations…) — style de bouton renforcé. */
export type ImprovementImportance = 'normal' | 'milestone'

/** `true` si `importance === 'milestone'` ou effet `setEra` (passage d’ère). */
export function isMilestoneImprovement(improvement: ImprovementType): boolean {
  if (improvement.importance === 'milestone') return true
  return improvement.effects?.some((e) => e.kind === 'setEra') ?? false
}

/**
 * Conditions that gate an improvement (visibility + buyability).
 *
 * Every field is optional: a missing field means the constraint doesn't apply.
 * All present fields must be satisfied (logical AND) for the improvement to
 * appear in the UI / be buyable.
 */
export interface ImprovementConditionType {
  /** Restrict to a specific class slug (e.g. `warrior`). */
  requiredClass?: string
  /** Restrict to a specific specialization (e.g. `fantassin`). */
  requiredSpecialization?: string
  /** Minimum character level. */
  minLevel?: number
  /** Minimum quantity per resource slug, e.g. `{ wood: 5, stone: 2 }`. */
  minResourceQuantity?: Record<string, number>
  /** Slug of an improvement that must already be bought. */
  requiredImprovement?: string
  /** Flag that must be set to true. */
  requiredFlag?: string
}

/**
 * Effect produced by an improvement.
 *
 * Discriminated union (mirrors `EventEffect`). Two natures of effect coexist:
 *
 * - **One-shot effects** (`log`, `setFlag`, `incrementCounter`):
 *   applied EXACTLY ONCE, when the improvement is bought.
 *   Handled by `improvementEngine.applyEffects`.
 *
 * - **Passive effects** (`resourceRate`, `resourceMaxBonus`):
 *   applied CONTINUOUSLY for as long as the improvement is bought.
 *   Read on demand by `getResourceRateBonus` / `getResourceMaxBonus`
 *   (called from `resourceStore`).
 *
 * Splitting "what is an effect" from "when is it applied" lets us keep both
 * the engine and the data (`globalImprovements`) declarative.
 */
export type ImprovementEffectType =
  /** Passive: flat additive bonus on a resource's production rate. */
  | { kind: 'resourceRate'; resourceSlug: string; amount: number }
  /** Passive: augmente le plafond d’inventaire d’une ressource. */
  | { kind: 'resourceMaxBonus'; resourceSlug: string; amount: number }
  /** Passive: flat additive bonus on a gauge's production rate. */
  | { kind: 'gaugeRate'; gaugeSlug: string; amount: number }
  /** One-shot: append a message to the log feed. */
  | { kind: 'log'; message: string }
  /** One-shot: set a flag (default `true`). */
  | { kind: 'setFlag'; flag: string; value?: boolean }
  /** One-shot: increment a counter by `by` (default 1). */
  | { kind: 'incrementCounter'; counter: string; by?: number }
  /** One-shot: credit a positive `amount` of a resource (capped at max). */
  | { kind: 'addResource'; resourceSlug: string; amount: number }
  /** One-shot: pass the character to the given era. */
  | { kind: 'setEra'; era: number }

/**
 * Resource costs paid atomically when the improvement is bought.
 *
 * Aliased on `ResourceCostBag` (one canonical shape across every "spending"
 * surface of the game: events, improvements, tiles). Gauge costs will live
 * on a separate type if/when they're needed, to keep this one narrow.
 */
export type ImprovementCost = ResourceCostBag

export interface ImprovementType {
  name: string
  slug: string
  /** Section dans la liste d’améliorations. */
  category: ImprovementCategory
  /** Tri dans la catégorie (croissant). */
  sortOrder?: number
  /**
   * `milestone` : bouton et tooltip mis en avant (ères, tournants narratifs).
   * Défaut déduit si un effet `setEra` est présent (`isMilestoneImprovement`).
   */
  importance?: ImprovementImportance
  /**
   * Free-form short text shown to the player (tooltip, lore).
   * Pure UI, never read by the engine.
   */
  flavourText?: string
  /**
   * Pièce monument liée (affichage « Acquis » uniquement).
   * Absent = amélioration générale (puits, stockage, ère…).
   */
  linkedRoomId?: string
  /** Time (in seconds) the player must wait before the improvement is bought. */
  buildTime: number
  effects?: ImprovementEffectType[]
  conditions?: ImprovementConditionType
  /** Resources debited at purchase time. */
  costs?: ImprovementCost
  isBought: boolean
  isVisible: boolean
}
