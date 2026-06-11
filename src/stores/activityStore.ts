import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activitiesData } from '@/data/activities'
import type { ActiveCinematicState, ActiveTimedActivity, ActivityType } from '@/types/ActivityType'
import {
  ACTIVITY_CATEGORY_LABELS,
  ACTIVITY_CATEGORY_ORDER,
  type ActivityCategory,
} from '@/types/ActivityType'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useGaugeStore } from '@/stores/gaugeStore'
import { useImprovementStore } from '@/stores/improvementStore'
import { useLogStore } from '@/stores/logStore'
import { useResourceStore } from '@/stores/resourceStore'
import {
  applyActivityEffects,
  canAffordActivity,
  hasNoUsefulAdditiveGain,
  meetsConditions,
  spendActivityCosts,
  type ActivityEngineDeps,
} from '@/engines/activities/activityEngine'

/** Nombre max d’activités **timed** en parallèle (ère 2). */
export const MAX_CONCURRENT_TIMED_ACTIVITIES = 2

export type TimedRelaunchUiState = 'looping' | 'stop_pending'

function getActivityKind(activity: ActivityType): 'instant' | 'timed' {
  return activity.kind ?? 'instant'
}

function cloneResourceCosts(
  costs: ActivityType['costs'],
): { resourceSlug: string; quantity: number }[] {
  return costs ? costs.map((c) => ({ resourceSlug: c.resourceSlug, quantity: c.quantity })) : []
}

function cloneGaugeCosts(
  costs: ActivityType['gaugeCosts'],
): { gaugeSlug: string; quantity: number }[] | undefined {
  if (!costs?.length) return undefined
  return costs.map((c) => ({ gaugeSlug: c.gaugeSlug, quantity: c.quantity }))
}

function clearRelaunchKeys(
  enabled: Record<string, boolean>,
  pending: Record<string, boolean>,
  slugs: readonly string[],
): { enabled: Record<string, boolean>; pending: Record<string, boolean> } {
  const e = { ...enabled }
  const p = { ...pending }
  for (const slug of slugs) {
    delete e[slug]
    delete p[slug]
  }
  return { enabled: e, pending: p }
}

export const useActivityStore = defineStore('activities', () => {
  const activities = ref<ActivityType[]>(activitiesData.map((a) => ({ ...a })))
  /**
   * Temps de simulation (s) — synchronisé par `clockStore` depuis le `ClockEngine`.
   * Les cooldowns sont exprimés dans ce référentiel (pause / vitesse ×2 inclus).
   */
  const gameTimeSim = ref(0)
  /** Fin de cooldown en temps sim (s) : actif tant que `gameTimeSim < valeur`. */
  const cooldownUntilSim = ref<Record<string, number>>({})
  /** Activités **timed** en cours (ère 2). */
  const activeTimed = ref<ActiveTimedActivity[]>([])
  /**
   * Activité `timed` avec boucle : après récompense + cooldown, un nouveau cycle démarre tout seul
   * (si payable / conditions / slots). Désactivé après un second clic (fin de cycle en cours).
   */
  const timedRelaunchEnabled = ref<Record<string, boolean>>({})
  /** Second clic : terminer récompense + pause puis ne plus relancer. */
  const timedRelaunchStopPending = ref<Record<string, boolean>>({})
  /** Cinématique d’activité en cours (`blocksInterface`). */
  const activeCinematic = ref<ActiveCinematicState | null>(null)

  let cinematicEndTimer: ReturnType<typeof setTimeout> | null = null

  function buildDeps(): ActivityEngineDeps {
    const characterStore = useCharacterStore()
    const resourceStore = useResourceStore()
    const gameState = useGameStateStore()
    const logStore = useLogStore()
    const gaugeStore = useGaugeStore()
    const improvementStore = useImprovementStore()

    return {
      addLog: (message, kind) => logStore.addLog(message, kind),
      setFlag: (flag, value) => gameState.setFlag(flag, value ?? true),
      getFlag: (flag) => gameState.getFlag(flag),
      getCounter: (counter) => gameState.getCounter(counter),
      incrementCounter: (counter, by) => gameState.incrementCounter(counter, by),
      addResource: (slug, amount) => resourceStore.addResource(slug, amount),
      spendResource: (costs) => resourceStore.spendResource(costs),
      canAfford: (costs) => resourceStore.canAfford(costs),
      getGaugeQuantity: (slug) => gaugeStore.getGaugeQuantity(slug),
      addGauge: (slug, amt) => gaugeStore.addGauge(slug, amt),
      spendGauge: (slug, qty) => gaugeStore.trySpendGauge(slug, qty),
      getGaugeMax: (slug) => gaugeStore.getGaugeMax(slug),

      getCharacterClass: () => characterStore.getActiveCharacter()?.classType,
      getCharacterSpecialization: () => characterStore.getActiveCharacter()?.specialization,
      getCharacterLevel: () => characterStore.getActiveCharacter()?.level,
      getResourceQuantity: (slug) => resourceStore.getQuantity(slug),
      getResourceMax: (slug) => resourceStore.getResourceMax(slug),
      isImprovementBought: (slug) =>
        improvementStore.improvements.some((i) => i.slug === slug && i.isBought),
      getCharacterEra: () => characterStore.getActiveCharacter()?.era ?? 1,
    }
  }

  function effectDepsFromEngine(deps: ActivityEngineDeps) {
    return {
      addLog: deps.addLog,
      setFlag: deps.setFlag,
      getFlag: deps.getFlag,
      incrementCounter: deps.incrementCounter,
      addResource: deps.addResource,
      addGauge: deps.addGauge,
      getGaugeMax: deps.getGaugeMax,
    }
  }

  function isInterfaceBlocked(): boolean {
    return useGameStateStore().getFlag('ui.flag.cinematicActive')
  }

  function clearCinematicTimer(): void {
    if (cinematicEndTimer != null) {
      clearTimeout(cinematicEndTimer)
      cinematicEndTimer = null
    }
  }

  function endCinematic(): void {
    clearCinematicTimer()
    activeCinematic.value = null
    useGameStateStore().setFlag('ui.flag.cinematicActive', false)
  }

  function sortActivitiesInCategory(list: ActivityType[]): ActivityType[] {
    return [...list].sort(
      (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name, 'fr'),
    )
  }

  /** Activités visibles regroupées par catégorie (ordre déclaratif). */
  function visibleActivitiesByCategory(): {
    category: ActivityCategory
    label: string
    activities: ActivityType[]
  }[] {
    const visible = activities.value.filter((a) => a.isVisible)
    return ACTIVITY_CATEGORY_ORDER.map((category) => ({
      category,
      label: ACTIVITY_CATEGORY_LABELS[category],
      activities: sortActivitiesInCategory(visible.filter((a) => a.category === category)),
    })).filter((group) => group.activities.length > 0)
  }

  /**
   * Activité instantanée bloquante : coûts au début, effets + cooldown à la fin de la cinématique.
   */
  function performBlockingInstant(activity: ActivityType, deps: ActivityEngineDeps): boolean {
    const durationSec = activity.cinematicDurationSeconds ?? 3
    if (durationSec <= 0) return false

    if (!spendActivityCosts(activity, deps)) return false

    const variant = activity.cinematicVariant ?? 'sleep'
    activeCinematic.value = { slug: activity.slug, variant }
    useGameStateStore().setFlag('ui.flag.cinematicActive', true)

    clearCinematicTimer()
    cinematicEndTimer = setTimeout(() => {
      cinematicEndTimer = null
      const fx = effectDepsFromEngine(deps)
      applyActivityEffects(activity.effects, fx, { activitySlug: activity.slug })
      if (activity.cooldownSeconds > 0) {
        cooldownUntilSim.value = {
          ...cooldownUntilSim.value,
          [activity.slug]: gameTimeSim.value + activity.cooldownSeconds,
        }
      }
      endCinematic()
      updateActivityVisibility()
    }, durationSec * 1000)

    return true
  }

  function refundTimedSlot(slot: ActiveTimedActivity, deps: ActivityEngineDeps) {
    for (const { resourceSlug, quantity } of slot.paidResourceCosts) {
      if (quantity > 0) deps.addResource(resourceSlug, quantity)
    }
    for (const { gaugeSlug, quantity } of slot.paidGaugeCosts ?? []) {
      if (quantity > 0) deps.addGauge(gaugeSlug, quantity)
    }
  }

  function isTimedSlotRunning(slug: string): boolean {
    return activeTimed.value.some((s) => s.slug === slug)
  }

  function clearRelaunchForSlug(slug: string) {
    const { enabled, pending } = clearRelaunchKeys(
      timedRelaunchEnabled.value,
      timedRelaunchStopPending.value,
      [slug],
    )
    timedRelaunchEnabled.value = enabled
    timedRelaunchStopPending.value = pending
  }

  function clearAllRelaunchState() {
    timedRelaunchEnabled.value = {}
    timedRelaunchStopPending.value = {}
  }

  /**
   * Annule les slots timed en cours dont les gains additifs seraient nuls (ex. inventaire plein),
   * rembourse les coûts et coupe la boucle auto pour ces slugs.
   */
  function abortTimedWithNoUsefulGain(deps: ActivityEngineDeps): void {
    const toRefund: ActiveTimedActivity[] = []
    const still: ActiveTimedActivity[] = []

    for (const slot of activeTimed.value) {
      const activity = activities.value.find((a) => a.slug === slot.slug)
      if (activity && hasNoUsefulAdditiveGain(activity, deps)) {
        toRefund.push(slot)
      } else {
        still.push(slot)
      }
    }

    if (!toRefund.length) return

    for (const slot of toRefund) {
      refundTimedSlot(slot, deps)
      clearRelaunchForSlug(slot.slug)
    }
    activeTimed.value = still
    updateActivityVisibility()
  }

  /** Démarre un slot timed (coûts payés). Retourne false si impossible. */
  function tryPushTimedSlot(activity: ActivityType, deps: ActivityEngineDeps): boolean {
    const duration = activity.durationSeconds
    if (duration == null || duration <= 0) return false
    if (runningTimedCount() >= MAX_CONCURRENT_TIMED_ACTIVITIES) return false
    if (hasNoUsefulAdditiveGain(activity, deps)) return false
    if (!spendActivityCosts(activity, deps)) return false

    activeTimed.value = [
      ...activeTimed.value,
      {
        slug: activity.slug,
        completeAt: gameTimeSim.value + duration,
        paidResourceCosts: cloneResourceCosts(activity.costs),
        paidGaugeCosts: cloneGaugeCosts(activity.gaugeCosts),
      },
    ]
    return true
  }

  /**
   * Après cooldown, si boucle active sans arrêt demandé : relance un cycle.
   * Si arrêt demandé et créneau libre + plus de cooldown : coupe la boucle.
   */
  /** Au moins une activité timed en boucle auto (relance après cooldown). */
  function hasActiveTimedAutoLoop(): boolean {
    const enabled = timedRelaunchEnabled.value
    for (const slug of Object.keys(enabled)) {
      if (enabled[slug]) return true
    }
    return false
  }

  function processTimedAutoRelaunch(): void {
    if (!hasActiveTimedAutoLoop()) return

    const deps = buildDeps()

    for (const activity of activities.value) {
      if (getActivityKind(activity) !== 'timed') continue
      const slug = activity.slug
      if (!timedRelaunchEnabled.value[slug]) continue

      if (timedRelaunchStopPending.value[slug]) {
        if (!isTimedSlotRunning(slug) && !isOnCooldown(slug)) {
          clearRelaunchForSlug(slug)
        }
        continue
      }

      if (isTimedSlotRunning(slug)) continue
      if (isOnCooldown(slug)) continue
      if (!meetsConditions(activity, deps)) continue
      if (!canAffordActivity(activity, deps)) continue
      if (hasNoUsefulAdditiveGain(activity, deps)) {
        clearRelaunchForSlug(slug)
        continue
      }
      if (runningTimedCount() >= MAX_CONCURRENT_TIMED_ACTIVITIES) continue

      if (tryPushTimedSlot(activity, deps)) {
        updateActivityVisibility()
      }
    }
  }

  /** Termine les activités timed dont l’échéance est atteinte (effets + cooldown). */
  function flushCompletedTimed(): void {
    const t = gameTimeSim.value
    const still: ActiveTimedActivity[] = []
    const done: ActiveTimedActivity[] = []
    for (const slot of activeTimed.value) {
      if (t >= slot.completeAt) done.push(slot)
      else still.push(slot)
    }
    if (!done.length) return

    activeTimed.value = still
    const deps = buildDeps()
    const fx = effectDepsFromEngine(deps)

    for (const slot of done) {
      const activity = activities.value.find((a) => a.slug === slot.slug)
      if (!activity) continue
      applyActivityEffects(activity.effects, fx, { activitySlug: activity.slug })
      if (activity.cooldownSeconds > 0) {
        cooldownUntilSim.value = {
          ...cooldownUntilSim.value,
          [activity.slug]: t + activity.cooldownSeconds,
        }
      }
    }
    updateActivityVisibility()
  }

  /** Appelé à chaque pas sim (~20 Hz) — même référentiel que prod ressources / jauges. */
  function applyGameTime(simElapsedSeconds: number) {
    gameTimeSim.value = simElapsedSeconds
    flushCompletedTimed()
    if (activeTimed.value.length > 0) {
      abortTimedWithNoUsefulGain(buildDeps())
    }
    if (hasActiveTimedAutoLoop()) {
      processTimedAutoRelaunch()
    }
  }

  function isOnCooldown(slug: string): boolean {
    return gameTimeSim.value < (cooldownUntilSim.value[slug] ?? 0)
  }

  /** Secondes de cooldown restantes (temps sim). */
  function getCooldownRemainingSimSeconds(slug: string): number {
    const until = cooldownUntilSim.value[slug] ?? 0
    return Math.max(0, until - gameTimeSim.value)
  }

  function runningTimedCount(): number {
    return activeTimed.value.length
  }

  /** Progression 0–1 pour l’activité timed la plus avancée parmi les slots de ce slug. */
  function getTimedProgress01ForSlug(slug: string): number {
    const activity = activities.value.find((a) => a.slug === slug)
    const dur = Math.max(1, activity?.durationSeconds ?? 1)
    const now = gameTimeSim.value
    const slots = activeTimed.value.filter((s) => s.slug === slug)
    if (!slots.length) return 0
    let best = 0
    for (const s of slots) {
      const started = s.completeAt - dur
      best = Math.max(best, Math.min(1, Math.max(0, (now - started) / dur)))
    }
    return best
  }

  /** UI : boucle auto active ou arrêt demandé (activités `timed` uniquement). */
  function getTimedRelaunchUiState(slug: string): TimedRelaunchUiState | null {
    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity || getActivityKind(activity) !== 'timed') return null
    if (timedRelaunchStopPending.value[slug]) return 'stop_pending'
    if (timedRelaunchEnabled.value[slug]) return 'looping'
    return null
  }

  function updateActivityVisibility() {
    const deps = buildDeps()
    activities.value.forEach((act) => {
      act.isVisible = meetsConditions(act, deps)
    })
  }

  function initializeActivities() {
    endCinematic()
    cooldownUntilSim.value = {}
    activeTimed.value = []
    clearAllRelaunchState()
    updateActivityVisibility()
  }

  function resetCooldowns() {
    endCinematic()
    const deps = buildDeps()
    for (const slot of activeTimed.value) {
      refundTimedSlot(slot, deps)
    }
    activeTimed.value = []
    cooldownUntilSim.value = {}
    clearAllRelaunchState()
  }

  /** Rembourse les timed en cours sans toucher aux cooldowns (ex. baisse d’ère). */
  function cancelActiveTimedAndRefund(): void {
    const deps = buildDeps()
    const refundedSlugs = activeTimed.value.map((s) => s.slug)
    for (const slot of activeTimed.value) {
      refundTimedSlot(slot, deps)
    }
    activeTimed.value = []
    const { enabled, pending } = clearRelaunchKeys(
      timedRelaunchEnabled.value,
      timedRelaunchStopPending.value,
      refundedSlugs,
    )
    timedRelaunchEnabled.value = enabled
    timedRelaunchStopPending.value = pending
    updateActivityVisibility()
  }

  /**
   * Hydratation sauvegarde (évite les soucis de `$patch` sur refs du setup store).
   */
  function hydrateFromSave(payload: {
    activities: ActivityType[]
    cooldownUntilSim: Record<string, number>
    gameTimeSim: number
    activeTimed: ActiveTimedActivity[]
    timedRelaunchEnabled: Record<string, boolean>
    timedRelaunchStopPending: Record<string, boolean>
  }) {
    activities.value = payload.activities
    cooldownUntilSim.value = payload.cooldownUntilSim
    gameTimeSim.value = payload.gameTimeSim
    activeTimed.value = payload.activeTimed
    timedRelaunchEnabled.value = payload.timedRelaunchEnabled
    timedRelaunchStopPending.value = payload.timedRelaunchStopPending
    updateActivityVisibility()
  }

  /**
   * Résout une activité : coûts, effets (immédiat ou fin de durée), puis cooldown le cas échéant.
   * `timed` en boucle : second clic pendant la durée ou le cooldown = arrêt après ce cycle complet.
   */
  function performActivity(slug: string): boolean {
    flushCompletedTimed()
    if (isInterfaceBlocked()) return false

    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity) return false

    const deps = buildDeps()

    if (getActivityKind(activity) === 'timed') {
      const duration = activity.durationSeconds
      if (duration == null || duration <= 0) return false

      const loopOn = !!timedRelaunchEnabled.value[slug]
      const activeForSlug = isTimedSlotRunning(slug)
      const cooling = isOnCooldown(slug)

      if (loopOn && (activeForSlug || cooling)) {
        timedRelaunchStopPending.value = { ...timedRelaunchStopPending.value, [slug]: true }
        updateActivityVisibility()
        return true
      }

      if (cooling && !loopOn) return false
      if (activeForSlug) return false

      if (!meetsConditions(activity, deps)) return false
      if (!canAffordActivity(activity, deps)) return false
      if (hasNoUsefulAdditiveGain(activity, deps)) return false
      if (runningTimedCount() >= MAX_CONCURRENT_TIMED_ACTIVITIES) return false
      if (!tryPushTimedSlot(activity, deps)) return false

      timedRelaunchEnabled.value = { ...timedRelaunchEnabled.value, [slug]: true }
      timedRelaunchStopPending.value = { ...timedRelaunchStopPending.value, [slug]: false }
      updateActivityVisibility()
      return true
    }

    if (isOnCooldown(slug)) return false
    if (!meetsConditions(activity, deps)) return false
    if (!canAffordActivity(activity, deps)) return false
    if (hasNoUsefulAdditiveGain(activity, deps)) return false

    if (activity.blocksInterface) {
      const ok = performBlockingInstant(activity, deps)
      if (ok) updateActivityVisibility()
      return ok
    }

    if (!spendActivityCosts(activity, deps)) return false

    applyActivityEffects(activity.effects, effectDepsFromEngine(deps), {
      activitySlug: activity.slug,
    })

    if (activity.cooldownSeconds > 0) {
      cooldownUntilSim.value = {
        ...cooldownUntilSim.value,
        [slug]: gameTimeSim.value + activity.cooldownSeconds,
      }
    }

    updateActivityVisibility()
    return true
  }

  function canPerformActivity(slug: string): boolean {
    flushCompletedTimed()
    if (isInterfaceBlocked()) return false

    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity) return false

    if (getActivityKind(activity) === 'timed') {
      const duration = activity.durationSeconds
      if (duration == null || duration <= 0) return false

      if (timedRelaunchEnabled.value[slug] && (isTimedSlotRunning(slug) || isOnCooldown(slug))) {
        return true
      }

      if (isOnCooldown(slug)) return false

      const depsTimed = buildDeps()
      if (!meetsConditions(activity, depsTimed)) return false
      if (!canAffordActivity(activity, depsTimed)) return false
      if (hasNoUsefulAdditiveGain(activity, depsTimed)) return false
      if (runningTimedCount() >= MAX_CONCURRENT_TIMED_ACTIVITIES) return false
      return true
    }

    if (isOnCooldown(slug)) return false
    const deps = buildDeps()
    if (!meetsConditions(activity, deps)) return false
    if (!canAffordActivity(activity, deps)) return false
    if (hasNoUsefulAdditiveGain(activity, deps)) return false

    return true
  }

  function isActivityEffectNull(slug: string): boolean {
    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity) return false
    return hasNoUsefulAdditiveGain(activity, buildDeps())
  }

  function getActivity(slug: string): ActivityType | undefined {
    return activities.value.find((a) => a.slug === slug)
  }

  return {
    activities,
    activeCinematic,
    gameTimeSim,
    cooldownUntilSim,
    activeTimed,
    timedRelaunchEnabled,
    timedRelaunchStopPending,
    isInterfaceBlocked,
    visibleActivitiesByCategory,
    applyGameTime,
    initializeActivities,
    resetCooldowns,
    cancelActiveTimedAndRefund,
    hydrateFromSave,
    updateActivityVisibility,
    performActivity,
    canPerformActivity,
    isOnCooldown,
    getCooldownRemainingSimSeconds,
    getTimedProgress01ForSlug,
    getTimedRelaunchUiState,
    runningTimedCount,
    getActivity,
    isActivityEffectNull,
  }
})
