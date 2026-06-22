import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGameStateStore } from '@/stores/gameStateStore'
import type { ActiveCinematicState, ActivityCinematicVariant } from '@/types/ActivityType'

export type CinematicRequest = {
  source: string
  slug: string
  variant: ActivityCinematicVariant
  durationSeconds: number
}

/**
 * cinematicStore — gère les cinématiques (multi-sources)
 *
 * - Une seule cinématique active à la fois (simplicité).
 * - Le store pilote `ui.flag.cinematicActive`.
 * - Les callbacks de fin ne sont pas stockés dans l’état Pinia (Map locale).
 */
export const useCinematicStore = defineStore('cinematics', () => {
  const activeCinematic = ref<ActiveCinematicState | null>(null)

  let nextId = 1
  const onEndByKey = new Map<string, () => void>()

  function isActive(): boolean {
    return useGameStateStore().getFlag('ui.flag.cinematicActive')
  }

  function clear(): void {
    activeCinematic.value = null
    useGameStateStore().setFlag('ui.flag.cinematicActive', false)
  }

  function start(req: CinematicRequest, onEnd?: () => void): boolean {
    if (req.durationSeconds <= 0) return false
    if (isActive()) return false

    const key = `${req.source}:${req.slug}:${nextId++}`
    if (onEnd) onEndByKey.set(key, onEnd)

    activeCinematic.value = {
      source: req.source,
      slug: req.slug,
      variant: req.variant,
      endsAtSim: 0, // initialisé sur le premier tick sim
    }
    // endsAtSim sera fixé au moment du premier applyGameTime pour éviter d’avoir
    // plusieurs horloges ou dépendances circulaires.
    ;(activeCinematic.value as ActiveCinematicState).endsAtSim = NaN

    useGameStateStore().setFlag('ui.flag.cinematicActive', true)

    // Attache la clé de callback via un champ non persisté (hack minimal)
    ;(activeCinematic.value as ActiveCinematicState & { __key?: string }).__key = key
    ;(activeCinematic.value as ActiveCinematicState & { __duration?: number }).__duration =
      req.durationSeconds

    return true
  }

  /** Appelé à chaque tick sim (~20 Hz) par `clockStore`. */
  function applyGameTime(simElapsedSeconds: number): void {
    const c = activeCinematic.value as
      | (ActiveCinematicState & { __key?: string; __duration?: number })
      | null
    if (!c) return

    // 1ère frame : fixe la fin en temps sim.
    if (!Number.isFinite(c.endsAtSim)) {
      const d = c.__duration ?? 0
      c.endsAtSim = simElapsedSeconds + Math.max(0, d)
      return
    }

    if (simElapsedSeconds < c.endsAtSim) return

    const key = c.__key
    clear()
    if (key) {
      const cb = onEndByKey.get(key)
      onEndByKey.delete(key)
      cb?.()
    }
  }

  /** Pour reset / chargement de save : stoppe la cinématique courante. */
  function reset(): void {
    onEndByKey.clear()
    clear()
  }

  return {
    activeCinematic,
    isActive,
    start,
    applyGameTime,
    reset,
  }
})

