/**
 * activityStore — orchestrateur des activités joueur
 *
 * Rôle : tient l’état runtime et décide QUAND appeler `activityEngine` (conditions,
 * coûts, effets). La logique pure vit dans `engines/activities/activityEngine.ts`.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  ActivityButton → performActivity / canPerformActivity          │
 * │         ↓                                                       │
 * │  activityStore (état + timing + visibilité)                     │
 * │         ↓                                                       │
 * │  activityEngine (règles pures via buildDeps)                    │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * ## Trois comportements (kind + flags)
 *
 * 1. **instant** — clic → coûts → effets → cooldown (temps sim)
 *    Ex. fouille, se reposer
 *
 * 2. **instant + blocksInterface** — coûts au clic, effets à la fin d’une cinématique
 *    (setTimeout temps MUR, pas sim). Ex. dormir
 *
 * 3. **timed** — slot dans `activeTimed` jusqu’à `completeAt`, puis effets + cooldown.
 *    Boucle auto via `timedRelaunchEnabled` / `timedRelaunchStopPending`.
 *    Ex. bois long (ère 2). Second clic = arrêt après le cycle en cours.
 *
 * ## État timed → `engines/activities/timedActivityRuntime.ts`
 *
 *   activeTimed[]              slots en cours (completeAt en temps sim)
 *   cooldownUntilSim{}         recharge post-récompense
 *   timedRelaunchEnabled{}     boucle auto ON pour ce slug
 *   timedRelaunchStopPending{} joueur a demandé l’arrêt au prochain cycle libre
 *
 * ## Tick (~20 Hz, via clockStore → applyGameTime)
 *
 *   advanceTimedRuntime()      → flush + abort + relance auto
 *
 * ## Points d’attention (refacto Lot 4)
 *
 * - performActivity / canPerformActivity dupliquent les mêmes vérifs
 * - updateActivityVisibility() appelé après presque chaque mutation
 * - Cinématique = temps mur ; cooldown = temps sim
 * - Policy repos (1.1) lit monumentStore + improvementStore depuis ici
 * - Runtime timed extrait → timedActivityRuntime.ts (Lot 4.1)
 *
 * Voir aussi : docs/ARCHITECTURE.md § engines / recalculs
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activitiesData } from '@/data/activities'
import type { ActivityType, RunningActivity } from '@/types/ActivityType'
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
import { useMonumentStore } from '@/stores/monumentStore'
import { useResourceStore } from '@/stores/resourceStore'
import { useCinematicStore } from '@/stores/cinematicStore'
import {
  applyActivityEffects,
  canAffordActivity,
  hasNoUsefulAdditiveGain,
  meetsConditions,
  spendActivityCosts,
  type ActivityEngineDeps,
} from '@/engines/activities/activityEngine'
export type TimedRelaunchUiState = 'looping' | 'stop_pending'

export const MAX_CONCURRENT_TIMED_ACTIVITIES = 3

function getActivityKind(activity: ActivityType): 'non_repeatable' | 'repeatable' | 'alone' {
  return activity.kind ?? 'non_repeatable'
}

function activityRequiresIdle(activity: ActivityType): boolean {
  return activity.requiresIdle === true || activity.category === 'rest'
}

export const useActivityStore = defineStore('activities', () => {
  // ---------------------------------------------------------------------------
  // État réactif (partiellement persisté — voir hydrateFromSave / gamePersistence)
  // ---------------------------------------------------------------------------
  const activities = ref<ActivityType[]>(activitiesData.map((a) => ({ ...a })))
  /**
   * Temps de simulation (s) — synchronisé par `clockStore` depuis le `ClockEngine`.
   * Les cooldowns sont exprimés dans ce référentiel (pause / vitesse ×2 inclus).
   */
  const gameTimeSim = ref(0)
  /** Activités en cours (prod ou cooldown). */
  const runningActivities = ref<RunningActivity[]>([])

  function runningActivityForSlug(slug: string): RunningActivity | undefined {
    return runningActivities.value.find((a) => a.slug === slug)
  }

  function isAnyActivityRunning(): boolean {
    // "alone" doit être bloqué si une autre activité est en cours *ou*
    // si une cinématique (multi-sources) est active.
    return runningActivities.value.length > 0 || isInterfaceBlocked()
  }

  // ---------------------------------------------------------------------------
  // Pont Pinia → activityEngine (résolu à chaque appel, pas mis en cache)
  // ---------------------------------------------------------------------------
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
    return useCinematicStore().isActive()
  }

  // ---------------------------------------------------------------------------
  // Policy repos (1.1) — category rest / requiresIdle : monde doit être « idle »
  // ---------------------------------------------------------------------------
  /** Au moins une activité repeatable en cours ou en recharge. */
  function hasBusyRepeatableActivities(): boolean {
    return runningActivities.value.some((a) => a.kind === 'repeatable')
  }

  function hasPendingMonumentRepairs(): boolean {
    return Object.keys(useMonumentStore().pendingRepairs).length > 0
  }

  function hasPendingImprovementBuilds(): boolean {
    return Object.keys(useImprovementStore().pendingBuilds).length > 0
  }

  function isWorldIdleForRest(): boolean {
    return (
      !hasBusyRepeatableActivities() &&
      !hasPendingMonumentRepairs() &&
      !hasPendingImprovementBuilds()
    )
  }

  function getIdleBlockedReason(): string | null {
    if (hasBusyRepeatableActivities()) {
      return 'Terminez l’activité longue en cours avant de vous reposer.'
    }
    if (hasPendingMonumentRepairs()) {
      return 'Terminez la réparation en cours avant de vous reposer.'
    }
    if (hasPendingImprovementBuilds()) {
      return 'Terminez la construction en cours avant de vous reposer.'
    }
    return null
  }

  /** Message joueur quand l’activité est bloquée pour une raison métier connue. */
  function getActivityBlockedReason(slug: string): string | null {
    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity) return null

    if (runningActivities.value.length >= MAX_CONCURRENT_TIMED_ACTIVITIES) {
      return 'Vous êtes trop occupé.'
    }

    if (getActivityKind(activity) === 'alone' && isAnyActivityRunning()) {
      return 'Vous ne pouvez pas faire autre chose en même temps.'
    }

    if (activityRequiresIdle(activity) && !isWorldIdleForRest()) {
      return getIdleBlockedReason()
    }

    if (isInterfaceBlocked() && getActivityKind(activity) === 'repeatable') {
      return 'Terminez le sommeil avant de lancer une autre action.'
    }

    return null
  }

  // ---------------------------------------------------------------------------
  // Cinématique (blocksInterface) — gérée par `cinematicStore` (multi-sources)
  // ---------------------------------------------------------------------------
  /** Coûts au début, effets + cooldown à la fin (temps sim). */
  function performBlockingInstant(activity: ActivityType, deps: ActivityEngineDeps): boolean {
    const durationSec = activity.cinematicDurationSeconds ?? 3
    if (durationSec <= 0) return false

    if (!spendActivityCosts(activity, deps)) return false

    const variant = activity.cinematicVariant ?? 'sleep'
    const cinematicStore = useCinematicStore()
    return cinematicStore.start(
      { source: 'activity', slug: activity.slug, variant, durationSeconds: durationSec },
      () => {
        // Fin de cinématique : effets + cooldown (tout en temps sim)
        applyActivityEffects(activity.effects, effectDepsFromEngine(deps), {
          activitySlug: activity.slug,
        })
        if (activity.cooldownSeconds > 0) {
          runningActivities.value = [
            ...runningActivities.value,
            {
              slug: activity.slug,
              kind: getActivityKind(activity),
              phase: 'cooldown',
              endsAtSim: gameTimeSim.value + activity.cooldownSeconds,
            },
          ]
        }
        updateActivityVisibility()
      },
    )
  }

  // ---------------------------------------------------------------------------
  // UI liste — regroupement par catégorie
  // ---------------------------------------------------------------------------
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

  /** Appelé à chaque pas sim (~20 Hz) — même référentiel que prod ressources / jauges. */
  // ---------------------------------------------------------------------------
  // Tick sim + lectures UI (cooldown, progression timed, état boucle)
  // ---------------------------------------------------------------------------
  function applyGameTime(simElapsedSeconds: number) {
    gameTimeSim.value = simElapsedSeconds

    const deps = buildDeps()
    const fx = effectDepsFromEngine(deps)
    let needsVisibilityUpdate = false

    // Résolution des activités arrivées à terme
    const next: RunningActivity[] = []
    for (const entry of runningActivities.value) {
      if (gameTimeSim.value < entry.endsAtSim) {
        next.push(entry)
        continue
      }

      const act = activities.value.find((a) => a.slug === entry.slug)
      if (!act) {
        needsVisibilityUpdate = true
        continue
      }

      if (entry.phase === 'producing') {
        // Snapshot avant/après pour savoir si les effets ont un impact réel sur les stocks.
        const touchedRes = new Set<string>()
        const touchedGauges = new Set<string>()
        for (const e of act.effects ?? []) {
          if (e.kind === 'addResource') touchedRes.add(e.resourceSlug)
          if (e.kind === 'addGauge') touchedGauges.add(e.gaugeSlug)
        }
        const beforeRes: Record<string, number> = {}
        const beforeG: Record<string, number> = {}
        for (const s of touchedRes) beforeRes[s] = deps.getResourceQuantity(s)
        for (const s of touchedGauges) beforeG[s] = deps.getGaugeQuantity(s)

        applyActivityEffects(act.effects, fx, { activitySlug: act.slug })

        let hadAnyEffect = false
        for (const s of touchedRes)
          if (deps.getResourceQuantity(s) !== beforeRes[s]) hadAnyEffect = true
        for (const s of touchedGauges)
          if (deps.getGaugeQuantity(s) !== beforeG[s]) hadAnyEffect = true

        if (act.cooldownSeconds > 0) {
          next.push({
            ...entry,
            phase: 'cooldown',
            endsAtSim: gameTimeSim.value + act.cooldownSeconds,
            // si pas d'effet réel, on force l'arrêt au sortir du cooldown
            stopAfterThisCycle: entry.stopAfterThisCycle || !hadAnyEffect,
          })
        } else {
          // Pas de cooldown : relance immédiate si repeatable et pas stoppé
          const shouldStop = entry.stopAfterThisCycle || !hadAnyEffect
          if (entry.kind === 'repeatable' && !shouldStop) {
            // On relance un cycle si conditions + coûts OK et slots OK.
            if (
              meetsConditions(act, deps) &&
              canAffordActivity(act, deps) &&
              !hasNoUsefulAdditiveGain(act, deps)
            ) {
              const repeatablesInNext = next.filter((e) => e.kind === 'repeatable').length
              if (
                repeatablesInNext < MAX_CONCURRENT_TIMED_ACTIVITIES &&
                spendActivityCosts(act, deps)
              ) {
                next.push({
                  slug: act.slug,
                  kind: 'repeatable',
                  phase: 'producing',
                  endsAtSim: gameTimeSim.value + Math.max(1, act.durationSeconds ?? 1),
                })
              }
            }
          }
        }
        needsVisibilityUpdate = true
        continue
      }

      // cooldown terminé
      if (entry.kind === 'repeatable' && !entry.stopAfterThisCycle) {
        // relance si ça peut encore avoir un effet et si on peut payer.
        if (
          meetsConditions(act, deps) &&
          canAffordActivity(act, deps) &&
          !hasNoUsefulAdditiveGain(act, deps)
        ) {
          const repeatablesInNext = next.filter((e) => e.kind === 'repeatable').length
          if (
            repeatablesInNext < MAX_CONCURRENT_TIMED_ACTIVITIES &&
            spendActivityCosts(act, deps)
          ) {
            next.push({
              slug: act.slug,
              kind: 'repeatable',
              phase: 'producing',
              endsAtSim: gameTimeSim.value + Math.max(1, act.durationSeconds ?? 1),
            })
            needsVisibilityUpdate = true
            continue
          }
        }
      }

      // Sinon: suppression (cooldown=0 => plus dans le tableau)
      needsVisibilityUpdate = true
    }

    runningActivities.value = next
    if (needsVisibilityUpdate) updateActivityVisibility()
  }

  function isOnCooldown(slug: string): boolean {
    const e = runningActivityForSlug(slug)
    return !!e && e.phase === 'cooldown'
  }

  function getCooldownRemainingSimSeconds(slug: string): number {
    const e = runningActivityForSlug(slug)
    if (!e || e.phase !== 'cooldown') return 0
    return Math.max(0, e.endsAtSim - gameTimeSim.value)
  }

  function getTimedProgress01ForSlug(slug: string): number {
    const e = runningActivityForSlug(slug)
    if (!e || e.phase !== 'producing') return 0
    const act = activities.value.find((a) => a.slug === slug)
    const dur = Math.max(1, act?.durationSeconds ?? 1)
    const started = e.endsAtSim - dur
    return Math.min(1, Math.max(0, (gameTimeSim.value - started) / dur))
  }

  function getTimedRelaunchUiState(slug: string): TimedRelaunchUiState | null {
    const e = runningActivityForSlug(slug)
    if (!e || e.kind !== 'repeatable') return null
    if (e.stopAfterThisCycle) return 'stop_pending'
    return 'looping'
  }

  // ---------------------------------------------------------------------------
  // Visibilité — meetsConditions sur chaque activité (appelé souvent après mutation)
  // ---------------------------------------------------------------------------
  function updateActivityVisibility() {
    const deps = buildDeps()
    activities.value.forEach((act) => {
      act.isVisible = meetsConditions(act, deps)
    })
  }

  // ---------------------------------------------------------------------------
  // Cycle de vie — nouvelle partie, reset, save, annulation (ère, stop clock)
  // ---------------------------------------------------------------------------
  function initializeActivities() {
    runningActivities.value = []
    updateActivityVisibility()
  }

  function resetCooldowns() {
    runningActivities.value = []
  }

  function cancelActiveTimedAndRefund(): void {
    // Spec simplifiée: aucun refund.
    runningActivities.value = []
    updateActivityVisibility()
  }

  /**
   * Hydratation sauvegarde (évite les soucis de `$patch` sur refs du setup store).
   */
  function hydrateFromSave(payload: {
    activities: ActivityType[]
    gameTimeSim: number
    runningActivities: RunningActivity[]
  }) {
    activities.value = payload.activities
    gameTimeSim.value = payload.gameTimeSim
    runningActivities.value = payload.runningActivities
    updateActivityVisibility()
  }

  // ---------------------------------------------------------------------------
  // API publique — clic joueur (performActivity ≈ canPerformActivity + mutations)
  // ---------------------------------------------------------------------------
  /**
   * Résout une activité : coûts, effets (immédiat ou fin de durée), puis cooldown le cas échéant.
   * `timed` en boucle : second clic pendant la durée ou le cooldown = arrêt après ce cycle complet.
   */
  function performActivity(slug: string): boolean {
    if (isInterfaceBlocked()) return false

    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity) return false

    if (activityRequiresIdle(activity) && !isWorldIdleForRest()) return false

    const deps = buildDeps()

    const kind = getActivityKind(activity)

    // Alone: uniquement si aucune activité (prod/cooldown) n'est en cours
    if (kind === 'alone' && isAnyActivityRunning()) return false

    // Max 2 activités en cours (toutes confondues)
    if (runningActivities.value.length >= MAX_CONCURRENT_TIMED_ACTIVITIES && kind !== 'alone')
      return false

    // Repeatable: second clic => stop après ce cycle (passe par cooldown → arrêt)
    const existing = runningActivityForSlug(slug)
    if (kind === 'repeatable' && existing) {
      if (!existing.stopAfterThisCycle) {
        runningActivities.value = runningActivities.value.map((e) =>
          e.slug === slug ? { ...e, stopAfterThisCycle: true } : e,
        )
        updateActivityVisibility()
      }
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

    const duration = Math.max(0, activity.durationSeconds ?? 0)
    if (duration > 0) {
      runningActivities.value = [
        ...runningActivities.value,
        {
          slug,
          kind,
          phase: 'producing',
          endsAtSim: gameTimeSim.value + duration,
        },
      ]
    } else {
      applyActivityEffects(activity.effects, effectDepsFromEngine(deps), {
        activitySlug: activity.slug,
      })
      if (activity.cooldownSeconds > 0) {
        runningActivities.value = [
          ...runningActivities.value,
          {
            slug,
            kind,
            phase: 'cooldown',
            endsAtSim: gameTimeSim.value + activity.cooldownSeconds,
          },
        ]
      }
    }

    updateActivityVisibility()
    return true
  }

  function canPerformActivity(slug: string): boolean {
    if (isInterfaceBlocked()) return false

    const activity = activities.value.find((a) => a.slug === slug)
    if (!activity) return false

    if (activityRequiresIdle(activity) && !isWorldIdleForRest()) return false

    const kind = getActivityKind(activity)
    if (kind === 'alone' && isAnyActivityRunning()) return false
    if (kind === 'repeatable' && runningActivityForSlug(slug)) return true
    if (runningActivities.value.length >= MAX_CONCURRENT_TIMED_ACTIVITIES && kind !== 'alone')
      return false

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
    gameTimeSim,
    runningActivities,
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
    getActivityBlockedReason,
    isOnCooldown,
    getCooldownRemainingSimSeconds,
    getTimedProgress01ForSlug,
    getTimedRelaunchUiState,
    getActivity,
    isActivityEffectNull,
  }
})
