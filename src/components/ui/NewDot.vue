<template>
  <span
    class="pointer-events-none absolute z-20 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]"
    :class="placementClass"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    placement?: 'tab' | 'button'
  }>(),
  { placement: 'button' },
)

const placementClass = computed(() =>
  props.placement === 'tab' ? '-right-1 -top-0.5' : '-right-1 -top-1',
)
</script>
