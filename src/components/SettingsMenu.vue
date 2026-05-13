<template>
  <div class="fixed right-3 bottom-3 z-[45] sm:right-4 sm:bottom-4">
    <button type="button"
      class="rounded-full p-2 text-gray-500 opacity-70 shadow-sm transition hover:bg-black/5 hover:text-gray-800 hover:opacity-100 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
      aria-haspopup="dialog" :aria-expanded="open" aria-label="Paramètres" @click="handleOpenMenu">
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.52-.4-1.08-.73-1.69-.98l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.61.25-1.17.59-1.69.98l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.52.4 1.08.73 1.69.98l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.61-.25 1.17-.59 1.69-.98l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    </button>

    <transition name="fade">
      <div v-if="isMenuOpen" class="fixed inset-0 z-[44] bg-black/25 backdrop-blur-[1px]" aria-hidden="true"
        @click="handleCloseMenu" />
    </transition>

    <transition name="fade">
      <div v-if="isMenuOpen" role="dialog" aria-modal="true" aria-labelledby="settings-title"
        class="absolute right-0 bottom-0 z-[46] w-[min(calc(100vw-1.5rem),17rem)] rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-900"
        @click.stop>
        <h2 id="settings-title" class="mb-3 font-semibold text-gray-900 dark:text-white">Paramètres</h2>

        <div class="flex flex-col gap-3">
          <label class="flex cursor-pointer items-center justify-between gap-3 text-gray-700 dark:text-gray-200">
            <span>Thème sombre</span>
            <input v-model="darkEnabled" type="checkbox"
              class="h-4 w-4 rounded border-gray-400 text-orange-500 focus:ring-orange-400 dark:border-gray-500 dark:bg-gray-800" />
          </label>

          <button type="button"
            class="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-left text-gray-800 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            @click="onSave">
            Sauvegarder la partie
          </button>

          <button type="button"
            class="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-left text-red-900 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/70"
            @click="onReset">
            Réinitialiser la partie
          </button>

          <p v-if="feedback" class="text-xs text-emerald-700 dark:text-emerald-400">{{ feedback }}</p>

          <div class="border-t border-gray-200 pt-3 dark:border-gray-600">
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              GitHub
            </p>
            <div class="flex flex-col gap-1.5">
              <a :href="LINK_GITHUB_REPO"
                class="text-orange-600 underline-offset-2 hover:underline dark:text-orange-400" target="_blank"
                rel="noopener noreferrer">
                Dépôt du jeu
              </a>
              <a :href="LINK_GITHUB_PROFILE"
                class="text-orange-600 underline-offset-2 hover:underline dark:text-orange-400" target="_blank"
                rel="noopener noreferrer">
                Profil
              </a>
              <a :href="LINK_WEBSITE" class="text-orange-600 underline-offset-2 hover:underline dark:text-orange-400"
                target="_blank" rel="noopener noreferrer">
                CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { clearSavedGame, saveGameToStorage } from '@/gamePersistence'
import { LINK_GITHUB_PROFILE, LINK_GITHUB_REPO, LINK_WEBSITE } from '@/config/site'
import { isDarkMode, setDarkMode } from '@/utils/theme'

defineOptions({ name: 'SettingsMenu' })

const isMenuOpen = ref(false)
const feedback = ref('')
const darkEnabled = ref(false)

onMounted(() => {
  darkEnabled.value = isDarkMode()
})

watch(darkEnabled, (v) => {
  setDarkMode(v)
})

function handleOpenMenu() {
  isMenuOpen.value = true
}

function handleCloseMenu() {
  isMenuOpen.value = false
}

function onSave() {
  saveGameToStorage()
  feedback.value = 'Partie sauvegardée.'
  window.setTimeout(() => {
    feedback.value = ''
  }, 2800)
}

function onReset() {
  if (
    !confirm(
      'Recommencer une nouvelle partie ? Toute progression non sauvegardée sera perdue, et la sauvegarde locale sera effacée.',
    )
  ) {
    return
  }
  clearSavedGame()
  window.location.reload()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
