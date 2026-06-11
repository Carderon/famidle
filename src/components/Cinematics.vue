<!-- doit être révisé pour séparer les animations en différents composants -->

<template>
  <div class="pointer-events-none absolute inset-0 z-0 ambient-bg" :class="ambientBackgroundClass" aria-hidden="true" />

  <transition name="cinematic-fade">
    <div v-if="isCinematicActive"
      class="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center overflow-hidden"
      role="presentation" aria-hidden="true">
      <div class="absolute inset-0 cinematic-scrim" :class="scrimClass" />
      <div class="relative z-[1] h-full w-full cinematic-layer" :class="cinematicLayerClass" />
    </div>
  </transition>

  <transition name="cinematic-fade">
    <div v-if="isEra2Transition" class="pointer-events-none absolute inset-0 z-[55] overflow-hidden" role="presentation"
      aria-hidden="true">
      <div class="absolute inset-0 cinematic-scrim--era2" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/stores/activityStore'
import { useGameStateStore } from '@/stores/gameStateStore'
import { useImprovementStore } from '@/stores/improvementStore'

const improvementStore = useImprovementStore()
const gameState = useGameStateStore()
const activityStore = useActivityStore()
const { improvements } = storeToRefs(improvementStore)
const { activeCinematic } = storeToRefs(activityStore)

const isCinematicActive = computed(() => gameState.getFlag('ui.flag.cinematicActive'))
const isEra2Transition = computed(() => gameState.getFlag('age2.flag.era2TransitionPending'))

let eraTransitionTimer: ReturnType<typeof setTimeout> | undefined

watch(isEra2Transition, (active) => {
  if (eraTransitionTimer) {
    clearTimeout(eraTransitionTimer)
    eraTransitionTimer = undefined
  }
  if (!active) return
  eraTransitionTimer = setTimeout(() => {
    gameState.setFlag('age2.flag.era2TransitionPending', false)
    eraTransitionTimer = undefined
  }, 2800)
})

const ambientBackgroundClass = computed(() => {
  const firecamp = improvements.value.find((imp) => imp.slug === 'age1.improvement.firecamp')
  return firecamp?.isBought ? 'bg-white' : 'bg-slate-950'
})

const scrimClass = computed(() => {
  const variant = activeCinematic.value?.variant
  if (variant === 'sleep') return 'cinematic-scrim--sleep'
  return 'cinematic-scrim--default'
})

const cinematicLayerClass = computed(() => {
  const variant = activeCinematic.value?.variant
  if (variant === 'sleep') return 'cinematic-layer--sleep'
  return 'cinematic-layer--default'
})
</script>

<style scoped>
.ambient-bg {
  transition: background-color 1s;
}

.cinematic-scrim {
  opacity: 0;
  animation: scrim-in 0.6s ease forwards;
}

.cinematic-scrim--sleep {
  background: radial-gradient(ellipse at 50% 40%, #1e293b 0%, #020617 70%);
}

.cinematic-scrim--default {
  background: #000;
}

.cinematic-scrim--era2 {
  background: radial-gradient(ellipse at 50% 45%, rgba(251, 191, 36, 0.35) 0%, rgba(15, 23, 42, 0.92) 55%);
  animation: era2-transition 2.8s ease forwards;
}

.cinematic-layer--sleep {
  background: radial-gradient(circle at 50% 55%, rgba(148, 163, 184, 0.12) 0%, transparent 55%);
  animation: sleep-breathe 5s ease-in-out infinite;
}

.cinematic-layer--default {
  background: transparent;
}

@keyframes scrim-in {
  to {
    opacity: 1;
  }
}

@keyframes era2-transition {
  0% {
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  85% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes sleep-breathe {

  0%,
  100% {
    opacity: 0.35;
    transform: scale(1);
  }

  50% {
    opacity: 0.85;
    transform: scale(1.03);
  }
}

.cinematic-fade-enter-active,
.cinematic-fade-leave-active {
  transition: opacity 0.5s ease;
}

.cinematic-fade-enter-from,
.cinematic-fade-leave-to {
  opacity: 0;
}
</style>
