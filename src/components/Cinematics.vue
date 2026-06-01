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
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const ambientBackgroundClass = computed(() => {
  const firecamp = improvements.value.find((imp) => imp.slug === 'firecamp')
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
