import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useResourceStore } from '@/stores/resourceStore'
import { useGaugeStore } from '@/stores/gaugeStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useActivityStore } from '@/stores/activityStore'
import { useLogStore } from '@/stores/logStore'
import type { ImprovementType } from '@/types/ImprovementType.ts'
import {
  IMPROVEMENT_CATEGORY_LABELS,
  IMPROVEMENT_CATEGORY_ORDER,
  type ImprovementCategory,
} from '@/types/ImprovementType.ts'
import { improvementsData } from '@/data/improvements'
import {
  applyEffects,
  canAffordImprovement,
  getResourceRateBonus,
  getResourceMaxBonus,
  getGaugeMaxBonus,
  meetsConditions,
  spendImprovementCosts,
  type ImprovementEngineDeps,
} from '@/engines/improvements/improvementEngine'

/**
 * Improvements store: state + thin orchestration.
 *
 * All actual logic (conditions, effect application, resource bonuses) lives
 * in `improvementEngine.ts` as pure functions. This store just:
 * - holds the runtime state (`improvements` ref)
 * - exposes actions that delegate to the engine
 * - resolves Pinia stores to build the engine `deps`
 *
 * This mirrors the events architecture (`eventsSystem` ↔ `eventEngine`).
 */
export const useImprovementStore = defineStore('improvements', () => {
  const improvements = ref<ImprovementType[]>([...improvementsData])

  /** Temps sim (s), synchronisé par le clock — même référentiel que les cooldowns d’activités. */
  const gameTimeSim = ref(0)
  /** Fin de construction sim (s) : `buyImprovement` est appelé quand `gameTimeSim` l’atteint. */
  const pendingBuildCompleteAt = ref<Record<string, number>>({})

  function clearPendingBuilds() {
    pendingBuildCompleteAt.value = {}
  }

  /**
   * À chaque tick moteur : avance le temps sim et termine les constructions dues.
   */
  function applyGameTime(simElapsedSeconds: number) {
    gameTimeSim.value = simElapsedSeconds
    const pending = { ...pendingBuildCompleteAt.value }
    let changed = false
    for (const slug of Object.keys(pending)) {
      if (simElapsedSeconds >= pending[slug]) {
        buyImprovement(slug)
        delete pending[slug]
        changed = true
      }
    }
    if (changed) pendingBuildCompleteAt.value = pending
  }

  /**
   * Lance une construction alignée sur le temps sim (pause / vitesse).
   * `buildTime <= 0` achète immédiatement.
   */
  function scheduleBuild(slug: string): boolean {
    if (pendingBuildCompleteAt.value[slug] != null) return false
    const improvement = improvements.value.find((i) => i.slug === slug)
    if (!improvement || improvement.isBought) return false
    if (!canBuyImprovement(slug)) return false

    const duration = improvement.buildTime
    if (duration <= 0) {
      return buyImprovement(slug)
    }

    pendingBuildCompleteAt.value = {
      ...pendingBuildCompleteAt.value,
      [slug]: gameTimeSim.value + duration,
    }
    return true
  }

  function isPendingBuild(slug: string): boolean {
    return pendingBuildCompleteAt.value[slug] != null
  }

  /** Progression 0–1 de la barre de construction (temps sim). */
  function getBuildProgress01(slug: string, buildTimeSeconds: number): number {
    const end = pendingBuildCompleteAt.value[slug]
    if (end == null || buildTimeSeconds <= 0) return 0
    const start = end - buildTimeSeconds
    const t = gameTimeSim.value
    return Math.min(1, Math.max(0, (t - start) / buildTimeSeconds))
  }

  /**
   * Build the dependency object passed to engine functions.
   *
   * Stores are resolved lazily inside this function (not at module top level)
   * so that this store can be imported before Pinia is fully bootstrapped,
   * and so that each call sees fresh references (e.g. active character).
   */
  function buildDeps(): ImprovementEngineDeps {
    const characterStore = useCharacterStore()
    const resourceStore = useResourceStore()
    const gameState = useGameStateStore()
    const logStore = useLogStore()
    const activityStore = useActivityStore()

    return {
      addLog: (message, kind) => logStore.addLog(message, kind),
      setFlag: (flag, value) => gameState.setFlag(flag, value),
      getFlag: (flag) => gameState.getFlag(flag),
      incrementCounter: (counter, by) => gameState.incrementCounter(counter, by),
      addResource: (slug, amount) => resourceStore.addResource(slug, amount),
      spendResource: (costs) => resourceStore.spendResource(costs),
      setEra: (era) => {
        characterStore.setEra(era)
        activityStore.cancelActiveTimedAndRefund()
        activityStore.updateActivityVisibility()
      },
      getCharacterClass: () => characterStore.getActiveCharacter()?.classType,
      getCharacterSpecialization: () => characterStore.getActiveCharacter()?.specialization,
      getCharacterLevel: () => characterStore.getActiveCharacter()?.level,
      getResourceQuantity: (slug) => resourceStore.getQuantity(slug),
      canAfford: (costs) => resourceStore.canAfford(costs),
      isImprovementBought: (slug) => improvements.value.some((i) => i.slug === slug && i.isBought),
    }
  }

  /**
   * Buy an improvement.
   *
   * - no-op if the improvement doesn't exist, is already bought, doesn't
   *   meet its conditions, or its `costs` are unaffordable
   * - on success: debits the costs, marks as bought, applies one-shot effects,
   *   and refreshes resource rates (because passive `resourceRate` effects
   *   may have just become active)
   */
  function buyImprovement(slug: string): boolean {
    const improvement = improvements.value.find((i) => i.slug === slug)
    if (!improvement || improvement.isBought) return false

    const deps = buildDeps()
    if (!meetsConditions(improvement, deps)) return false
    if (!canAffordImprovement(improvement, deps)) return false

    if (!spendImprovementCosts(improvement, deps)) return false

    improvement.isBought = true
    applyEffects(improvement.effects, deps)
    const resourceStore = useResourceStore()
    const gaugeStore = useGaugeStore()
    resourceStore.getResourceRates()
    resourceStore.recomputeResourceCaps()
    gaugeStore.recomputeGaugeCaps()
    resourceStore.recomputeVisibility()
    useActivityStore().updateActivityVisibility()
    return true
  }

  /**
   * Pure read used by the UI to disable un-affordable buttons.
   * Returns `false` if the improvement doesn't exist or is already bought.
   */
  function canBuyImprovement(slug: string): boolean {
    const improvement = improvements.value.find((i) => i.slug === slug)
    if (!improvement || improvement.isBought) return false
    const deps = buildDeps()
    return meetsConditions(improvement, deps) && canAffordImprovement(improvement, deps)
  }

  /** Recompute `isVisible` for every improvement based on current state. */
  function updateImprovementVisibility() {
    const deps = buildDeps()
    improvements.value.forEach((imp) => {
      imp.isVisible = meetsConditions(imp, deps)
    })
  }

  /**
   * Sum of passive `resourceRate` bonuses for a given resource slug.
   * Consumed by `resourceStore.getResourceRates` to compute `finalRate`.
   */
  function getResourceImprovementEffects(resourceSlug: string): number {
    return getResourceRateBonus(improvements.value, resourceSlug)
  }

  function getResourceMaxImprovementBonus(resourceSlug: string): number {
    return getResourceMaxBonus(improvements.value, resourceSlug)
  }

  function getGaugeMaxImprovementBonus(gaugeSlug: string): number {
    return getGaugeMaxBonus(improvements.value, gaugeSlug)
  }

  function initializeImprovements() {
    updateImprovementVisibility()
  }

  function getImprovement(slug: string): ImprovementType | undefined {
    return improvements.value.find((i) => i.slug === slug)
  }

  function sortImprovementsInCategory(list: ImprovementType[]): ImprovementType[] {
    return [...list].sort(
      (a, b) =>
        (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
        a.name.localeCompare(b.name, 'fr'),
    )
  }

  /** Améliorations visibles et non achetées, regroupées par catégorie. */
  function visibleImprovementsByCategory(): {
    category: ImprovementCategory
    label: string
    improvements: ImprovementType[]
  }[] {
    const visible = improvements.value.filter((i) => i.isVisible && !i.isBought)
    return IMPROVEMENT_CATEGORY_ORDER.map((category) => ({
      category,
      label: IMPROVEMENT_CATEGORY_LABELS[category],
      improvements: sortImprovementsInCategory(visible.filter((i) => i.category === category)),
    })).filter((group) => group.improvements.length > 0)
  }

  /** Améliorations achetées avec `isShown`, triées par catégorie (panneau Acquis). */
  function boughtImprovements(): ImprovementType[] {
    const bought = improvements.value.filter((i) => i.isBought && i.isShown === true)
    return IMPROVEMENT_CATEGORY_ORDER.flatMap((category) =>
      sortImprovementsInCategory(bought.filter((i) => i.category === category)),
    )
  }

  return {
    improvements,
    gameTimeSim,
    pendingBuildCompleteAt,
    applyGameTime,
    scheduleBuild,
    isPendingBuild,
    getBuildProgress01,
    clearPendingBuilds,
    buyImprovement,
    canBuyImprovement,
    updateImprovementVisibility,
    getResourceImprovementEffects,
    getResourceMaxImprovementBonus,
    getGaugeMaxImprovementBonus,
    initializeImprovements,
    getImprovement,
    visibleImprovementsByCategory,
    boughtImprovements,
  }
})
