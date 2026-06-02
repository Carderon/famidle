import type { ActivityEffectType, ActivityType } from '@/types/ActivityType'
import type { GaugeCostBag } from '@/types/EventType'
import type { ResourceCostBag } from '@/types/ResourceType'
import type { AddLogFn } from '@/types/LogType'

/**
 * Logique métier d’une **activité** (conditions, coûts, effets).
 *
 * Ce qu’il fait :
 * - décide si une activité est *éligible* (`meetsConditions`)
 * - décide si le joueur peut *payer* (`canAffordActivity`, `spendActivityCosts`)
 * - *applique* les effets déclaratifs (`applyActivityEffects`)
 * - estime les gains additifs après plafond (`effectiveResourceGain`, `hasNoUsefulAdditiveGain`)
 *
 * Ce qu’il ne fait pas :
 * - pas de cycle de jeu, pas de RAF, pas de liste d’activités ni de cooldowns
 * - tout accès au monde du jeu passe par `ActivityEngineDeps` (injecté par le store)
 *
 * Usage typique (ex. `activityStore`) :
 *
 * ```ts
 * const deps = buildDeps()
 * if (!meetsConditions(activity, deps)) return
 * if (!canAffordActivity(activity, deps)) return
 * if (!spendActivityCosts(activity, deps)) return
 * applyActivityEffects(activity.effects, deps, { activitySlug: activity.slug })
 * ```
 */

/**
 * Pont vers les stores (Pinia, etc.) sans importer les stores ici.
 * Chaque fonction n’exige que le sous-ensemble de méthodes dont elle a besoin (`Pick<…>`).
 */
export interface ActivityEngineDeps {
  addLog: AddLogFn
  setFlag: (flag: string, value?: boolean) => void
  getFlag: (flag: string) => boolean
  incrementCounter: (counter: string, by?: number) => void
  addResource: (slug: string, amount: number) => void
  spendResource: (costs: ResourceCostBag) => boolean
  canAfford: (costs: ResourceCostBag) => boolean
  getGaugeQuantity: (gaugeSlug: string) => number
  spendGauge: (gaugeSlug: string, quantity: number) => boolean
  addGauge: (gaugeSlug: string, amount: number) => void
  getGaugeMax: (gaugeSlug: string) => number
  getCharacterClass: () => string | undefined
  getCharacterSpecialization: () => string | null | undefined
  getCharacterLevel: () => number | undefined
  getResourceQuantity: (slug: string) => number
  getResourceMax: (slug: string) => number
  isImprovementBought: (slug: string) => boolean
  /** Ère du personnage actif (1, 2, …). */
  getCharacterEra: () => number
}

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

/**
 * `true` si toutes les conditions déclaratives de l’activité sont satisfaites.
 * Sans bloc `conditions` sur l’activité → toujours `true`.
 */
export function meetsConditions(
  activity: ActivityType,
  deps: Pick<
    ActivityEngineDeps,
    | 'getCharacterClass'
    | 'getCharacterSpecialization'
    | 'getCharacterLevel'
    | 'getResourceQuantity'
    | 'isImprovementBought'
    | 'getFlag'
    | 'getCharacterEra'
  >,
): boolean {
  const c = activity.conditions
  if (!c) return true

  if (c.requiredFlag && !deps.getFlag(c.requiredFlag)) return false
  if (c.hiddenWhenFlag && deps.getFlag(c.hiddenWhenFlag)) return false
  if (c.requiredClass && deps.getCharacterClass() !== c.requiredClass) return false
  if (c.requiredSpecialization && deps.getCharacterSpecialization() !== c.requiredSpecialization) {
    return false
  }
  if (c.minLevel != null && (deps.getCharacterLevel() ?? 0) < c.minLevel) return false

  if (c.minResourceQuantity) {
    for (const [slug, qty] of Object.entries(c.minResourceQuantity)) {
      if (deps.getResourceQuantity(slug) < qty) return false
    }
  }

  if (c.requiredImprovement && !deps.isImprovementBought(c.requiredImprovement)) return false

  const era = deps.getCharacterEra()
  if (c.minEra != null && era < c.minEra) return false
  if (c.maxEra != null && era > c.maxEra) return false

  return true
}

// ---------------------------------------------------------------------------
// Coûts (ressources + jauges)
// ---------------------------------------------------------------------------

/** Vérifie les coûts de jauges uniquement (les ressources passent par `canAfford`). */
function canAffordGaugeCosts(
  costs: GaugeCostBag | undefined,
  deps: Pick<ActivityEngineDeps, 'getGaugeQuantity'>,
): boolean {
  if (!costs?.length) return true
  for (const { gaugeSlug, quantity } of costs) {
    if (quantity <= 0) continue
    if (deps.getGaugeQuantity(gaugeSlug) < quantity) return false
  }
  return true
}

/**
 * `true` si le joueur peut payer à la fois les ressources et les jauges demandées.
 * Ne modifie rien (lecture seule).
 */
export function canAffordActivity(
  activity: ActivityType,
  deps: Pick<ActivityEngineDeps, 'canAfford' | 'getGaugeQuantity'>,
): boolean {
  if (activity.costs && !deps.canAfford(activity.costs)) return false
  if (!canAffordGaugeCosts(activity.gaugeCosts, deps)) return false
  return true
}

/**
 * Débite coûts ressources + jauges si tout est payable.
 * Retourne `false` si une étape échoue (état inchangé côté ressources si `canAfford` était déjà faux).
 */
export function spendActivityCosts(
  activity: ActivityType,
  deps: Pick<ActivityEngineDeps, 'spendResource' | 'spendGauge' | 'canAfford' | 'getGaugeQuantity'>,
): boolean {
  if (!canAffordActivity(activity, deps)) return false
  if (activity.costs && !deps.spendResource(activity.costs)) return false
  if (activity.gaugeCosts) {
    for (const { gaugeSlug, quantity } of activity.gaugeCosts) {
      if (quantity <= 0) continue
      if (!deps.spendGauge(gaugeSlug, quantity)) return false
    }
  }
  return true
}

// ---------------------------------------------------------------------------
// Effets
// ---------------------------------------------------------------------------

export interface ApplyActivityEffectsContext {
  /** Slug de l’activité — clé par défaut pour `logOnce`. */
  activitySlug: string
}

/** Flag gameState : message journal déjà affiché pour cette clé. */
export function logOnceFlagKey(logKey: string): string {
  return `log.once.${logKey}`
}

/**
 * Exécute la liste d’effets dans l’ordre (log, flags, compteurs, ressources, jauges).
 * Les montants `addGauge` avec `Number.MAX_SAFE_INTEGER` remplissent la jauge au max (`getGaugeMax`).
 */
export function applyActivityEffects(
  effects: readonly ActivityEffectType[] | undefined,
  deps: Pick<
    ActivityEngineDeps,
    | 'addLog'
    | 'setFlag'
    | 'getFlag'
    | 'incrementCounter'
    | 'addResource'
    | 'addGauge'
    | 'getGaugeMax'
  >,
  context: ApplyActivityEffectsContext,
): void {
  if (!effects) return
  for (const effect of effects) {
    switch (effect.kind) {
      case 'log':
        deps.addLog(effect.message, 'activity')
        break
      case 'logOnce': {
        const key = effect.logKey ?? context.activitySlug
        const flag = logOnceFlagKey(key)
        if (!deps.getFlag(flag)) {
          deps.addLog(effect.message, 'activity')
          deps.setFlag(flag, true)
        }
        break
      }
      case 'setFlag':
        deps.setFlag(effect.flag, effect.value ?? true)
        break
      case 'incrementCounter':
        deps.incrementCounter(effect.counter, effect.by ?? 1)
        break
      case 'addResource':
        deps.addResource(effect.resourceSlug, effect.amount)
        break
      case 'addGauge':
        deps.addGauge(
          effect.gaugeSlug,
          effect.amount === Number.MAX_SAFE_INTEGER
            ? deps.getGaugeMax(effect.gaugeSlug)
            : effect.amount,
        )
        break
      case 'toggleFlag':
        deps.setFlag(effect.flag, !deps.getFlag(effect.flag))
        break
    }
  }
}

// ---------------------------------------------------------------------------
// Gains additifs (lecture seule, aligné sur les caps des stores)
// ---------------------------------------------------------------------------

type AdditiveGainDeps = Pick<
  ActivityEngineDeps,
  'getResourceQuantity' | 'getResourceMax' | 'getGaugeQuantity' | 'getGaugeMax'
>

/** Gain ressource effectif après `min(quantity + amount, max)` (comme `resourceStore.addResource`). */
export function effectiveResourceGain(
  resourceSlug: string,
  amount: number,
  deps: AdditiveGainDeps,
): number {
  if (amount <= 0) return 0
  const headroom = deps.getResourceMax(resourceSlug) - deps.getResourceQuantity(resourceSlug)
  return Math.max(0, Math.min(amount, headroom))
}

/** Gain jauge effectif après cap (y compris `Number.MAX_SAFE_INTEGER` → remplissage au max). */
export function effectiveGaugeGain(
  gaugeSlug: string,
  amount: number,
  deps: AdditiveGainDeps,
): number {
  if (amount <= 0) return 0
  const resolved = amount === Number.MAX_SAFE_INTEGER ? deps.getGaugeMax(gaugeSlug) : amount
  const headroom = deps.getGaugeMax(gaugeSlug) - deps.getGaugeQuantity(gaugeSlug)
  return Math.max(0, Math.min(resolved, headroom))
}

/**
 * `true` si au moins un effet `addResource` / `addGauge` n’ajouterait rien (stock ou jauge plein).
 * Les effets non additifs (log, flags…) ne sont pas pris en compte.
 */
export function hasNoUsefulAdditiveGain(activity: ActivityType, deps: AdditiveGainDeps): boolean {
  const gains = (activity.effects ?? []).map((effect) => {
    switch (effect.kind) {
      case 'addResource':
        return effectiveResourceGain(effect.resourceSlug, effect.amount, deps)
      case 'addGauge':
        return effectiveGaugeGain(effect.gaugeSlug, effect.amount, deps)
      default:
        return undefined
    }
  })

  const additiveGains = gains.filter((g): g is number => g != null)
  if (!additiveGains.length) return false
  return additiveGains.every((gain) => gain === 0)
}
