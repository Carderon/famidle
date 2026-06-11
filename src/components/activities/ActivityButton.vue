<template>
  <div class="relative group inline-block" @mouseenter="markSeen">
    <NewDot v-if="isNew" />
    <button type="button"
      class="relative max-h-[32px] overflow-hidden rounded border px-2 py-1 text-white transition-all duration-100 hover:bg-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neutral-600"
      :class="[
        isTimed ? 'border-orange-500' : 'border-gray-400',
        timedRelaunchUi === 'looping'
          ? 'bg-amber-800/90 ring-1 ring-inset ring-amber-500/50'
          : 'bg-neutral-600',
        timedRelaunchUi === 'stop_pending'
          ? 'bg-amber-950/90 ring-1 ring-inset ring-slate-400/60 cursor-not-allowed'
          : '',
        isActivityEffectNull ? 'opacity-45' : '',
      ]" :disabled="!canRun || timedRelaunchUi === 'stop_pending' || isActivityEffectNull" @click="handleClick">
      <span class="relative z-10 block text-white">{{ activity.name }}</span>
      <span v-show="timedProgressFrac > 0"
        class="pointer-events-none absolute top-0 left-0 z-[1] block h-full bg-amber-300/45 transition-all duration-100"
        :style="{ width: (1 - timedProgressFrac) * 100 + '%' }" />
      <span v-show="cooldownRemainingFrac > 0 && timedProgressFrac <= 0"
        class="pointer-events-none absolute right-0 top-0 z-[5] h-full bg-amber-300/45 transition-[width] duration-100"
        :style="{ width: cooldownRemainingFrac * 100 + '%' }" />
    </button>

    <GameTooltip placement="below">
      <p class="text-sm font-semibold">{{ activity.name }}</p>
      <p v-if="activity.flavourText" class="mt-1 text-[11px] italic opacity-90">
        {{ activity.flavourText }}
      </p>
      <p v-if="displayFlavourHint" class="mt-1 text-[11px] italic opacity-90">
        {{ displayFlavourHint }}
      </p>
      <p v-if="hasExchangeLine" class="mt-1 text-[11px]">
        <ResourceCostLines v-if="hasResourceCost" :costs="activity.costs" />
        <template v-if="hasResourceCost && hasGaugeCost"> · </template>
        <GaugeCostLines v-if="hasGaugeCost" :costs="activity.gaugeCosts" />
        <template v-if="(hasResourceCost || hasGaugeCost) && formattedGains"> · </template>
        <span v-if="formattedGains" class="text-emerald-200">{{ formattedGains }}</span>
      </p>
      <p v-if="timedStatusLine" class="mt-2 text-[11px] text-amber-200/95">
        {{ timedStatusLine }}
      </p>
      <p v-else-if="blockedHint" class="mt-2 text-[11px] opacity-75">
        {{ blockedHint }}
      </p>
    </GameTooltip>
  </div>
</template>

<script lang="ts" setup>
import GameTooltip from '@/components/ui/GameTooltip.vue'
import NewDot from '@/components/ui/NewDot.vue'
import { useNewContent } from '@/composables/useNewContent'
import GaugeCostLines from '@/components/ui/GaugeCostLines.vue'
import ResourceCostLines from '@/components/ui/ResourceCostLines.vue'
import { useActivityStore } from '@/stores/activityStore'
import { useClockStore } from '@/stores/clockStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useGaugeStore } from '@/stores/gaugeStore'
import { useResourceStore } from '@/stores/resourceStore'
import type { ActivityEffectType, ActivityType } from '@/types/ActivityType'
import { limitedUseFlavour } from '@/utils/limitedUseFlavour'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'ActivityButton' })

const props = defineProps<{ activity: ActivityType }>()

const { isActivityNew, markActivitySeen } = useNewContent()

const isNew = computed(() => isActivityNew(props.activity.slug))

function markSeen() {
  markActivitySeen(props.activity.slug)
}

const activityStore = useActivityStore()
const resourceStore = useResourceStore()
const gaugeStore = useGaugeStore()
const gameState = useGameStateStore()
const clockStore = useClockStore()
const { uiTicksCount } = storeToRefs(clockStore)

const hasResourceCost = computed(() => resourceStore.hasPositiveResourceCosts(props.activity.costs))
const hasGaugeCost = computed(() => gaugeStore.hasPositiveGaugeCosts(props.activity.gaugeCosts))

function formatGainEffect(effect: ActivityEffectType): string {
  if (effect.kind === 'addResource' && effect.amount > 0) {
    const label = resourceStore.getResource(effect.resourceSlug)?.name ?? effect.resourceSlug
    return `+${effect.amount} ${label}`
  }
  if (effect.kind === 'addGauge' && effect.amount > 0) {
    const gauge = gaugeStore.gauges.find((g) => g.slug === effect.gaugeSlug)
    const label = gauge?.name ?? effect.gaugeSlug
    const max = gauge?.max ?? 0
    const fillsToFull = max > 0 && effect.amount >= max
    return fillsToFull ? `+${label} plein` : `+${effect.amount} ${label}`
  }
  return ''
}

const formattedGains = computed(() =>
  (props.activity.effects ?? []).map(formatGainEffect).filter((s) => s !== '').join(' · '),
)

const hasExchangeLine = computed(
  () => hasResourceCost.value || hasGaugeCost.value || formattedGains.value !== '',
)

const displayFlavourHint = computed(() => {
  void uiTicksCount.value
  const limit = props.activity.conditions?.hiddenWhenCounterAtLeast
  if (limit) {
    const hint = limitedUseFlavour(gameState.getCounter(limit.name), limit.atLeast)
    if (hint) return hint
  }

  return ''
})

const isTimed = computed(() => (props.activity.kind ?? 'instant') === 'timed')

const timedRelaunchUi = computed(() =>
  isTimed.value ? activityStore.getTimedRelaunchUiState(props.activity.slug) : null,
)

const canRun = computed(() => {
  void uiTicksCount.value
  return activityStore.canPerformActivity(props.activity.slug)
})

const isActivityEffectNull = computed(() => {
  void uiTicksCount.value
  return activityStore.isActivityEffectNull(props.activity.slug)
})

const cooldownRemainingFrac = computed(() => {
  void uiTicksCount.value
  const remaining = activityStore.getCooldownRemainingSimSeconds(props.activity.slug)
  if (remaining <= 0 || props.activity.cooldownSeconds <= 0) return 0
  return Math.min(1, Math.max(0, remaining / props.activity.cooldownSeconds))
})

const timedProgressFrac = computed(() => {
  void uiTicksCount.value
  if (!isTimed.value) return 0
  return activityStore.getTimedProgress01ForSlug(props.activity.slug)
})

/** Texte immersif des activités timed (data `timedStatus`), jamais chiffré. */
const timedStatusLine = computed(() => {
  const copy = props.activity.timedStatus
  if (!copy || !isTimed.value) return ''

  const state = timedRelaunchUi.value
  if (state === 'stop_pending') return copy.stopPending ?? ''
  if (state === 'looping') {
    if (timedProgressFrac.value > 0 && copy.ongoing) return copy.ongoing
    return copy.looping ?? ''
  }
  return ''
})

/** Indice vague quand l’action ne sert plus à rien (stock plein, etc.). */
const blockedHint = computed(() => {
  void uiTicksCount.value
  if (timedStatusLine.value) return ''
  if (isActivityEffectNull.value) return 'Pour l’instant, il n’y a plus rien à en tirer.'
  return ''
})

function handleClick() {
  activityStore.performActivity(props.activity.slug)
}
</script>
