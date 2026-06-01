<template>
  <div class="relative group inline-block">
    <button type="button"
      class="relative max-h-[32px] overflow-hidden rounded border px-2 py-1 text-white transition-all duration-100 hover:bg-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neutral-600"
      :class="[
        isTimed ? 'border-orange-500' : 'border-gray-400',
        timedRelaunchUi === 'looping' ? 'bg-amber-800/90 ring-1 ring-inset ring-amber-500/50' : 'bg-neutral-600',
        timedRelaunchUi === 'stop_pending'
          ? 'bg-amber-950/90 ring-1 ring-inset ring-slate-400/60 cursor-not-allowed'
          : '',
      ]" :disabled="!canRun || timedRelaunchUi === 'stop_pending' || isActivityEffectNull" @click="handleClick">
      <span class="relative z-10 block text-white">{{ activity.name }}</span>
      <span v-show="timedProgressFrac > 0"
        class="pointer-events-none absolute left-0 top-0 z-[5] h-full bg-emerald-400/45 transition-[width] duration-100"
        :style="{ width: timedProgressFrac * 100 + '%' }" />
      <span v-show="cooldownRemainingFrac > 0 && timedProgressFrac <= 0"
        class="pointer-events-none absolute right-0 top-0 z-[5] h-full bg-white/45 transition-[width] duration-100"
        :style="{ width: cooldownRemainingFrac * 100 + '%' }" />
    </button>

    <GameTooltip placement="below">
      <p class="text-sm font-semibold">{{ activity.name }}</p>
      <p v-if="activity.flavourText" class="mt-1 text-[11px] italic">
        {{ activity.flavourText }}
      </p>
      <p v-if="timedStatusLine" class="mt-1 text-[11px] text-amber-200/95">
        {{ timedStatusLine }}
      </p>
      <p v-if="isTimed && activity.durationSeconds || activity.cooldownSeconds" class="mt-1 text-[11px]">
        Durée :
        <template v-if="isTimed && activity.durationSeconds">
          {{ activity.durationSeconds }}s
        </template>
        <template
          v-if="activity.durationSeconds && activity.durationSeconds > 0 && activity.cooldownSeconds && activity.cooldownSeconds > 0">+
        </template>
        <template v-if="activity.cooldownSeconds > 0">
          {{ activity.cooldownSeconds }}s
        </template>
      </p>
      <p v-if="hasResourceCost || hasGaugeCost" class="mt-1 text-[11px]">
        Coût :
        <template v-if="hasResourceCost">
          {{ formattedResourceCost }}
        </template>
        <template v-if="hasResourceCost && hasGaugeCost">, </template>
        <template v-if="hasGaugeCost">
          {{ formattedGaugeCost }}
        </template>
      </p>
      <p v-if="formattedConditions" class="mt-1 text-[11px]">
        Conditions : {{ formattedConditions }}
      </p>
      <p v-if="formattedGains" class="mt-1 text-[11px]">Gain : {{ formattedGains }}</p>
    </GameTooltip>
  </div>
</template>

<script lang="ts" setup>
import GameTooltip from '@/components/ui/GameTooltip.vue'
import { useActivityStore } from '@/stores/activityStore'
import { useClockStore } from '@/stores/clockStore'
import { useImprovementStore } from '@/stores/improvementStore'
import { useGaugeStore } from '@/stores/gaugeStore'
import { useResourceStore } from '@/stores/resourceStore'
import type { ActivityConditionType, ActivityEffectType, ActivityType } from '@/types/ActivityType'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'ActivityButton' })

const props = defineProps<{ activity: ActivityType }>()

const activityStore = useActivityStore()
const improvementStore = useImprovementStore()
const resourceStore = useResourceStore()
const gaugeStore = useGaugeStore()
const clockStore = useClockStore()
const { tick } = storeToRefs(clockStore)

const isTimed = computed(() => (props.activity.kind ?? 'instant') === 'timed')

const timedRelaunchUi = computed(() =>
  isTimed.value ? activityStore.getTimedRelaunchUiState(props.activity.slug) : null,
)

const canRun = computed(() => {
  void tick.value
  return activityStore.canPerformActivity(props.activity.slug)
})

const isActivityEffectNull = computed(() => {
  void tick.value
  return activityStore.isActivityEffectNull(props.activity.slug)
})

const cooldownRemainingFrac = computed(() => {
  void tick.value
  const remaining = activityStore.getCooldownRemainingSimSeconds(props.activity.slug)
  if (remaining <= 0 || props.activity.cooldownSeconds <= 0) return 0
  return Math.min(1, Math.max(0, remaining / props.activity.cooldownSeconds))
})

const timedProgressFrac = computed(() => {
  void tick.value
  if (!isTimed.value) return 0
  return activityStore.getTimedProgress01ForSlug(props.activity.slug)
})

/** Libellé immersif timed (data `timedStatus`), selon l’état de boucle. */
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

const hasResourceCost = computed(() => {
  const c = props.activity.costs
  return !!c?.some(({ quantity }) => quantity > 0)
})

const hasGaugeCost = computed(() => {
  const c = props.activity.gaugeCosts
  return !!c?.some(({ quantity }) => quantity > 0)
})

const formattedResourceCost = computed(() => {
  const costs = props.activity.costs
  if (!costs) return ''
  return costs
    .filter(({ quantity }) => quantity > 0)
    .map(
      ({ resourceSlug, quantity }) =>
        `${quantity} ${resourceStore.getResource(resourceSlug)?.name ?? resourceSlug}`,
    )
    .join(', ')
})

const gaugeLabels: Record<string, string> = {
  health: 'vitalité',
  stamina: 'endurance',
}

const formattedGaugeCost = computed(() => {
  const costs = props.activity.gaugeCosts
  if (!costs) return ''
  return costs
    .filter(({ quantity }) => quantity > 0)
    .map(
      ({ gaugeSlug, quantity }) =>
        `${quantity} ${gaugeLabels[gaugeSlug] ?? gaugeSlug}`,
    )
    .join(', ')
})

function formatConditions(conditions: ActivityConditionType | undefined): string {
  if (!conditions) return ''
  const parts: string[] = []
  if (conditions.requiredClass) parts.push(`classe : ${conditions.requiredClass}`)
  if (conditions.requiredSpecialization)
    parts.push(`spécialisation : ${conditions.requiredSpecialization}`)
  if (conditions.minLevel != null) parts.push(`niveau ≥ ${conditions.minLevel}`)
  if (conditions.minResourceQuantity) {
    for (const [slug, qty] of Object.entries(conditions.minResourceQuantity)) {
      const label = resourceStore.getResource(slug)?.name ?? slug
      parts.push(`${qty} ${label}`)
    }
  }
  if (conditions.requiredImprovement)
    parts.push(
      improvementStore.getImprovement(conditions.requiredImprovement)?.name ??
      conditions.requiredImprovement,
    )
  return parts.join(' · ')
}

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
    return fillsToFull ? `${label} : plein` : `+${effect.amount} ${label}`
  }
  return ''
}

const formattedConditions = computed(() => formatConditions(props.activity.conditions))

const formattedGains = computed(() =>
  (props.activity.effects ?? []).map(formatGainEffect).filter((s) => s !== '').join(' · '),
)

function handleClick() {
  activityStore.performActivity(props.activity.slug)
}
</script>
