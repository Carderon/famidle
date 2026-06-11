import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/stores/activityStore'
import { useClockStore } from '@/stores/clockStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useImprovementStore } from '@/stores/improvementStore'
import { activitySeenFlag, improvementSeenFlag } from '@/utils/seenContentFlags'

export function useNewContent() {
  const gameState = useGameStateStore()
  const improvementStore = useImprovementStore()
  const activityStore = useActivityStore()
  const clockStore = useClockStore()
  const { flags } = storeToRefs(gameState)
  const { improvements } = storeToRefs(improvementStore)
  const { activities } = storeToRefs(activityStore)
  const { uiTicksCount } = storeToRefs(clockStore)

  function isImprovementNew(slug: string): boolean {
    void flags.value
    const imp = improvementStore.getImprovement(slug)
    if (!imp?.isVisible || imp.isBought) return false
    return !gameState.getFlag(improvementSeenFlag(slug))
  }

  function isActivityNew(slug: string): boolean {
    void flags.value
    const act = activityStore.getActivity(slug)
    if (!act?.isVisible) return false
    return !gameState.getFlag(activitySeenFlag(slug))
  }

  const unseenImprovementsCount = computed(() => {
    void flags.value
    void improvements.value
    void uiTicksCount.value
    return improvements.value.filter(
      (imp) => imp.isVisible && !imp.isBought && !gameState.getFlag(improvementSeenFlag(imp.slug)),
    ).length
  })

  const unseenActivitiesCount = computed(() => {
    void flags.value
    void activities.value
    void uiTicksCount.value
    return activities.value.filter(
      (act) => act.isVisible && !gameState.getFlag(activitySeenFlag(act.slug)),
    ).length
  })

  function markImprovementSeen(slug: string): void {
    if (!isImprovementNew(slug)) return
    gameState.setFlag(improvementSeenFlag(slug))
  }

  function markActivitySeen(slug: string): void {
    if (!isActivityNew(slug)) return
    gameState.setFlag(activitySeenFlag(slug))
  }

  return {
    isImprovementNew,
    isActivityNew,
    unseenImprovementsCount,
    unseenActivitiesCount,
    markImprovementSeen,
    markActivitySeen,
  }
}
