<template>
  <div v-if="isTooNarrow" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4"
    role="alertdialog" aria-modal="true" aria-labelledby="min-viewport-title">
    <section
      class="w-full max-w-md rounded-2xl border border-gray-400 bg-white p-6 text-black shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-white">
      <h2 id="min-viewport-title" class="mb-3 text-xl font-bold">Écran trop étroit</h2>
      <p class="text-sm leading-6 text-gray-700 dark:text-gray-300">
        Famidle nécessite une largeur d'au moins {{ minWidth }} pixels.
        Agrandissez la fenêtre ou utilisez un écran plus large pour jouer.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'MinViewportWarning' })

const props = withDefaults(defineProps<{ minWidth?: number }>(), { minWidth: 900 })

const windowWidth = ref(window.innerWidth)
const isTooNarrow = computed(() => windowWidth.value <= props.minWidth)

function onResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>
