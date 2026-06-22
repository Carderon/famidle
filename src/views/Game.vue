<template>
  <div class="relative w-full min-h-screen min-w-[900px] 2xl:h-screen">
    <Cinematics />

    <div class="relative grid grid-cols-12 w-full min-h-full dark:bg-gray-800 bg-white overflow-hidden">
      <!-- Gauche : Ressources et jauges -->
      <aside class="relative min-h-full border-gray-300 dark:border-gray-600 hidden"
        :class="{ 'border-r bg-gray-50 dark:bg-gray-900/40 col-span-3 xl:col-span-2 xl:block': isGaugesShown || isResourcesShown }">
        <GaugeList />
        <ResourceList />
        <Badge v-show="isBadgesShown"
          class="w-full max-w-[150px] mx-auto absolute bottom-0 left-[50%] -translate-x-1/2" />
      </aside>

      <!-- Centre : Activités et feu de camp -->
      <main class="py-0 px-6 xl:px-6 xl:py-6 flex flex-col min-h-screen 2xl:h-screen"
        :class="isGaugesShown || isResourcesShown ? 'col-span-12 xl:col-span-8' : 'col-span-10 xl:col-span-10'">
        <div class="xl:hidden flex gap-2 items-center ">
          <Badge v-show="isBadgesShown" class="w-20 h-20 flex items-center justify-center" />
          <GaugeList class="flex-1" />
        </div>

        <nav v-if="tabs.filter((tab) => tab.isVisible).length > 1"
          class="mb-4 flex flex-wrap gap-2 border-b border-gray-400 relative">
          <button v-for="tab in tabs.filter((tab) => tab.isVisible)" :key="tab.id"
            class="relative px-3 py-1 text-sm transition top-[1px]" :class="activeTab === tab.id
              ? 'dark:text-orange-500 text-amber-500 border-b dark:border-orange-500 border-amber-500'
              : 'text-black hover:text-orange-200 dark:text-white'" @click="onTabClick(tab.id)">
            {{ tab.label }}
            <NewDot v-if="tabHasNew(tab.id)" placement="tab" />
          </button>
        </nav>

        <JournalPanel v-if="activeTab === 'journal'" />

        <CharacterPanel v-if="activeTab === 'character'" />

        <ActivityList v-if="activeTab === 'activities'" />

        <ImprovementList v-if="activeTab === 'improvements'" />

        <MonumentPanel v-if="activeTab === 'monument'" :monument-id="activeMonumentId" />

        <BuildingList v-if="activeTab === 'buildings'" />

        <LogList v-if="activeTab === 'logs'" show-legend />

        <ResourceList v-if="activeTab === 'resources'" />
      </main>

      <!-- Droite : Journaux -->
      <aside class="col-span-2 h-screen hidden xl:block">
        <LogList />
      </aside>
    </div>

    <EventPanel />

    <SettingsMenu />

    <MinViewportWarning />

    <div v-if="isDebugMode" class="fixed bottom-0 left-0">
      <transition name="fade">
        <span v-if="elapsed >= 1" class="text-black dark:text-white">{{ Math.floor(elapsed) }}</span>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watchEffect, ref } from 'vue';
import NewDot from '@/components/ui/NewDot.vue';
import MinViewportWarning from '@/components/ui/MinViewportWarning.vue';
import { useNewContent } from '@/composables/useNewContent';
import { storeToRefs } from 'pinia';

import ResourceList from '@/components/ResourceList.vue';
import LogList from '@/components/LogList.vue';
import GaugeList from '@/components/GaugeList.vue';
import ImprovementList from '@/components/improvements/ImprovementList.vue';
import ActivityList from '@/components/ActivityList.vue';
import Cinematics from "@/components/Cinematics.vue";
import Badge from "@/components/Badge.vue";
import EventPanel from '@/components/EventPanel.vue';
import MonumentPanel from '@/components/monuments/MonumentPanel.vue';
import BuildingList from '@/components/BuildingList.vue';
import CharacterPanel from '@/components/CharacterPanel.vue';
import JournalPanel from '@/components/JournalPanel.vue';
import SettingsMenu from '@/components/SettingsMenu.vue';

import { applyGameSnapshot, loadSnapshotFromStorage } from '@/persistence/gamePersistence';

import { useActivityStore } from '@/stores/activityStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useClockStore } from '@/stores/clockStore';
import { useGameStateStore } from '@/stores/gameStateStore';
import { useImprovementStore } from '@/stores/improvementStore';
import { useMonumentStore } from '@/stores/monumentStore';

defineOptions({ name: 'GameView' })


const characterStore = useCharacterStore();
const monumentStore = useMonumentStore();

const activeMonumentId = computed(() => {
  const era = characterStore.getActiveCharacter()?.era ?? 1
  return monumentStore.getMonumentIdForEra(era)
})
const improvementStore = useImprovementStore();
const activityStore = useActivityStore();
const { unseenImprovementsCount, unseenActivitiesCount } = useNewContent();

// Le ClockEngine est démarré ici (et arrêté à la sortie) pour que le temps
// ne s'écoule que pendant la partie, pas dans le menu.
const clockStore = useClockStore();
const { elapsed } = storeToRefs(clockStore);

// Visibilité de l'UI : pilotée entièrement par les flags du gameStateStore.
// On regroupe les lectures dans un seul objet `ui` (réactif via computed)
// pour garder le template compact.
//
// Convention de nommage : `ui.flag.<thingShown>` (cf. ARCHITECTURE.md).
const gameState = useGameStateStore();
const isBadgesShown = computed(() => gameState.getFlag('ui.flag.badgesShown'));
const isImprovementsShown = computed(() => gameState.getFlag('ui.flag.improvementsShown'));
const isActivityShown = computed(() => gameState.getFlag('ui.flag.activityShown'));
const isMonumentShown = computed(() => gameState.getFlag('ui.flag.monumentShown'));
const isBuildingShown = computed(() => gameState.getFlag('ui.flag.buildingShown'));
const isCharacterShown = computed(() => gameState.getFlag('ui.flag.characterShown'));
const isGaugesShown = computed(() => gameState.getFlag('ui.flag.gaugesShown'));
const isResourcesShown = computed(() => gameState.getFlag('ui.flag.resourcesShown'));
const isLogsShown = computed(() => gameState.getFlag('ui.flag.logsShown'));
const isJournalShown = computed(() => gameState.getFlag('ui.flag.journalShown'));
const isDebugMode = computed(() => gameState.getFlag('ui.flag.isDebugMode'));

type CenterTabId = 'journal' | 'character' | 'activities' | 'improvements' | 'monument' | 'buildings' | 'resources' | 'logs'
type TabDef = { id: CenterTabId; label: string; isVisible: boolean }

// Aligné sur le breakpoint Tailwind `xl` (1280px) : logs en onglet si la colonne droite est masquée.
// Aligné sur le breakpoint Tailwind `xl` (1280px) : resources en onglet si la colonne gauche est masquée.
const windowWidth = ref(window.innerWidth)

const tabs = computed<TabDef[]>(() => [
  { id: 'activities', label: 'Activités', isVisible: isActivityShown.value },
  { id: 'improvements', label: 'Améliorations', isVisible: isImprovementsShown.value },
  { id: 'monument', label: 'Monument', isVisible: isMonumentShown.value },
  { id: 'buildings', label: 'Bâtiments', isVisible: isBuildingShown.value },
  { id: 'character', label: 'Personnage', isVisible: isCharacterShown.value },
  { id: 'journal', label: 'Journal', isVisible: isJournalShown.value },
  { id: 'resources', label: 'Ressources', isVisible: windowWidth.value < 1280 && isResourcesShown.value },
  { id: 'logs', label: 'Logs', isVisible: windowWidth.value < 1280 && isLogsShown.value },
]);

const activeTab = ref<CenterTabId>('improvements')

function tabHasNew(tabId: CenterTabId): boolean {
  if (tabId === 'improvements') return unseenImprovementsCount.value > 0
  if (tabId === 'activities') return unseenActivitiesCount.value > 0
  return false
}

function onTabClick(tabId: CenterTabId) {
  activeTab.value = tabId
}

watchEffect(() => {
  // Keep the active tab valid when the UI unlocks/locks tabs.
  if (tabs.value.some((t) => t.id === activeTab.value)) return
  activeTab.value = tabs.value[0]?.id ?? 'activities'
})

onMounted(() => {
  const snapshot = loadSnapshotFromStorage();
  if (snapshot) {
    applyGameSnapshot(snapshot);
    characterStore.ensureDefaultCharacter();
    clockStore.start({ skipGameStateReset: true, skipClearScheduled: true });
    clockStore.syncSimulationElapsed(snapshot.elapsed);
  } else {
    characterStore.ensureDefaultCharacter();
    improvementStore.initializeImprovements();
    activityStore.initializeActivities();
    clockStore.start();
  }

  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })

  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    gameState.setFlag('ui.flag.isDebugMode', true)
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => { })
  clockStore.stop();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
