<template>
  <div class="flex items-center justify-center">
    <img :src="badgeImage" :alt="`Era Badge`" class="h-[100px] w-[100px]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from '@/stores/characterStore.ts'

const badgeStages = [
  '/famidle/default.png',
  '/famidle/firecamp.gif', // https://www.deviantart.com/camilaxiao/art/Warm-Bonfire-Pixel-Art-Animation-856983081
  '/famidle/stage2.png',
  '/famidle/stage3.png',
  '/famidle/stage4.png',
  '/famidle/stage5.png',
  '/famidle/stage6.png',
  '/famidle/stage7.png',
];

const characterStore = useCharacterStore();
const currentCharacter = computed(() => characterStore.getActiveCharacter());

const badgeImage = computed(() => `${badgeStages[currentCharacter.value?.era ?? 0]}`);
</script>
