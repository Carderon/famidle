<template>
  <div class="flex items-center justify-center">
    <img :src="badgeImage" alt="Badge d'ère" draggable="false"
      class="pointer-events-none select-none w-full h-full object-contain" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '@/stores/characterStore'

defineOptions({ name: 'BadgeView' })

const badgeStages = [
  '/famidle/default.png',
  '/famidle/firecamp.gif', // https://www.deviantart.com/camilaxiao/art/Warm-Bonfire-Pixel-Art-Animation-856983081
  '/famidle/lantern.png',
  '/famidle/stage3.png',
  '/famidle/stage4.png',
  '/famidle/stage5.png',
  '/famidle/stage6.png',
  '/famidle/stage7.png',
]

const characterStore = useCharacterStore()
const { characters, activeCharacterIndex } = storeToRefs(characterStore)
const currentCharacter = computed(() => characters.value[activeCharacterIndex.value])
const badgeImage = computed(() => `${badgeStages[currentCharacter.value?.age ?? 1]}`)
</script>
