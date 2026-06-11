<template>
  <div class="relative group inline-block" @mouseenter="markSeen">
    <NewDot v-if="isNew" />
    <button type="button"
      class="relative overflow-hidden rounded border px-2 py-1 text-white transition-all duration-100 disabled:cursor-not-allowed"
      :class="buttonClasses" :disabled="isBuilding || !canBuy" @click="handleBuyImprovement(improvement.slug)">
      <span v-if="isMilestone"
        class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-600/25 via-transparent to-amber-900/20"
        aria-hidden="true" />
      <span class="relative z-10 block" :class="isMilestone ? 'font-semibold tracking-wide' : ''">
        {{ improvement.label ?? improvement.name }}
      </span>
      <span v-show="isBuilding" :style="{ width: 100 - buildProgress + '%' }"
        class="absolute top-0 left-0 z-[1] block h-full bg-amber-400/45 transition-all duration-100" />
    </button>

    <GameTooltip placement="below">
      <p class="text-sm font-semibold" :class="isMilestone ? 'text-amber-100' : ''">
        {{ improvement.name }}
      </p>
      <p v-if="isMilestone" class="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300/90">
        Jalon
      </p>
      <p v-if="improvement.flavourText" class="mt-1 text-[11px] italic"
        :class="isMilestone ? 'text-amber-50/95' : 'opacity-90'">
        {{ improvement.flavourText }}
      </p>
      <p v-if="hasCost && !isBuilding" class="mt-1 text-[11px]">
        <ResourceCostLines :costs="improvement.costs" />
      </p>
      <p v-if="formattedEffects" class="mt-1 text-[11px] text-orange-400/95 italic">{{ formattedEffects }}</p>
    </GameTooltip>
  </div>
</template>

<script lang="ts" setup>
import GameTooltip from '@/components/ui/GameTooltip.vue'
import NewDot from '@/components/ui/NewDot.vue'
import { useNewContent } from '@/composables/useNewContent'
import ResourceCostLines from '@/components/ui/ResourceCostLines.vue'
import { useImprovementStore } from '@/stores/improvementStore.ts'
import {
  isMilestoneImprovement,
  type ImprovementEffectType,
  type ImprovementType,
} from '@/types/ImprovementType'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useClockStore } from '@/stores/clockStore'
import { useResourceStore } from '@/stores/resourceStore'

defineOptions({ name: 'ImprovementButton' })

const improvementStore = useImprovementStore()
const resourceStore = useResourceStore()
const clockStore = useClockStore()
const { uiTicksCount } = storeToRefs(clockStore)

const props = defineProps<{ improvement: ImprovementType }>()

const { isImprovementNew, markImprovementSeen } = useNewContent()

const isNew = computed(() => isImprovementNew(props.improvement.slug))

function markSeen() {
  markImprovementSeen(props.improvement.slug)
}

const isMilestone = computed(() => isMilestoneImprovement(props.improvement))

const buttonClasses = computed(() => {
  if (isMilestone.value) {
    return [
      'min-h-[36px] max-h-[40px] border-2 border-amber-400/75 bg-neutral-800',
      'shadow-[0_0_12px_rgba(251,191,36,0.15)]',
      'hover:border-amber-300 hover:bg-neutral-700 hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]',
      'disabled:hover:border-amber-400/75 disabled:hover:bg-neutral-800 disabled:hover:shadow-[0_0_12px_rgba(251,191,36,0.15)]',
    ].join(' ')
  }

  if (!canBuy.value && !isBuilding.value) {
    return 'max-h-[32px] border-gray-400 bg-neutral-600 disabled:cursor-not-allowed opacity-50'
  }

  return 'max-h-[32px] border-gray-400 bg-neutral-600 hover:bg-neutral-500'
})

const isBuilding = computed(() => {
  void uiTicksCount.value
  return improvementStore.isPendingBuild(props.improvement.slug)
})

const buildProgress = computed(() => {
  void uiTicksCount.value
  return improvementStore.getBuildProgress01(props.improvement.slug, props.improvement.buildTime) * 100
})

const canBuy = computed(() => improvementStore.canBuyImprovement(props.improvement.slug))

const hasCost = computed(() => resourceStore.hasPositiveResourceCosts(props.improvement.costs))

function formatEffect(effect: ImprovementEffectType): string {
  switch (effect.kind) {
    case 'resourceRate':
      return `${effect.amount >= 0 ? '+' : ''}${effect.amount} ${resourceStore.getResource(effect.resourceSlug)?.name ?? effect.resourceSlug}/s`
    case 'resourceMaxBonus':
      return `+${effect.amount} max ${resourceStore.getResource(effect.resourceSlug)?.name ?? effect.resourceSlug}`
    case 'gaugeRate':
      return `${effect.amount >= 0 ? '+' : ''}${effect.amount} ${effect.gaugeSlug}/s`
    case 'gaugeMaxBonus': {
      const gaugeNames: Record<string, string> = { health: 'vitalité', stamina: 'endurance' }
      return `+${effect.amount} max ${gaugeNames[effect.gaugeSlug] ?? effect.gaugeSlug}`
    }
    case 'incrementCounter':
      return `${effect.counter} +${effect.by ?? 1}`
    case 'addResource':
      return `+${effect.amount} ${effect.resourceSlug}`
    default:
      return ''
  }
}

const formattedEffects = computed(() =>
  (props.improvement.effects ?? []).map(formatEffect).filter((effect) => effect !== '').join(', '),
)

const handleBuyImprovement = (slug: string) => {
  if (isBuilding.value || !canBuy.value) return
  improvementStore.scheduleBuild(slug)
}
</script>
