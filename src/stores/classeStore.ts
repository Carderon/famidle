// src/stores/logStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useClassStore = defineStore('class', () => {
  const classes = ref([
    // Placeholder until class selection exists in-game (après ère 1).
    { name: '', slug: 'unset', specializations: [] as string[] },
    { name: 'Guerrier', slug: 'warrior', specializations: ['a', 'b', 'c'] },
    { name: 'Mage', slug: 'mage', specializations: ['a', 'b', 'c'] },
    { name: 'Voleur', slug: 'thief', specializations: ['a', 'b', 'c'] },
  ]);

  return {
    classes,
  };
});
