<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const deferredPrompt = ref(null);
const showInstallPrompt = ref(false);

const handleBeforeInstallPrompt = (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt.value = e;
  // Update UI to notify the user they can add to home screen
  showInstallPrompt.value = true;
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
});

const installApp = async () => {
  if (!deferredPrompt.value) return;
  // Show the install prompt
  deferredPrompt.value.prompt();
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === "accepted") {
    console.log("User accepted the install prompt");
  } else {
    console.log("User dismissed the install prompt");
  }
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt.value = null;
  showInstallPrompt.value = false;
};

const dismissInstall = () => {
  showInstallPrompt.value = false;
};
</script>

<template>
  <router-view></router-view>

  <!-- Custom PWA Install Banner -->
  <Transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="showInstallPrompt"
      class="fixed bottom-0 left-0 right-0 z-[100] px-3 py-3 md:px-5 md:py-4 bg-[#1a2f24] text-white shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t border-white/10 flex items-center justify-between gap-1 sm:gap-4"
    >
      <div class="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">
        <div
          class="bg-primary p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex flex-shrink-0 items-center justify-center"
        >
          <span
            class="material-symbols-outlined text-white text-2xl sm:text-3xl"
            >menu_book</span
          >
        </div>
        <div class="flex flex-col min-w-0">
          <span
            class="font-bold text-xs sm:text-sm leading-tight text-gray-300 truncate"
            >Akses Lebih Cepat</span
          >
          <span
            class="font-bold text-sm sm:text-lg leading-tight text-white sm:tracking-wider truncate"
            >Instal BACOKITAB</span
          >
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          @click="dismissInstall"
          class="hidden sm:block px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Nanti
        </button>
        <button
          @click="installApp"
          class="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
        >
          <span class="hidden sm:inline mr-1">Instal</span>
          <span class="material-symbols-outlined text-base sm:text-lg"
            >download</span
          >
        </button>
      </div>
    </div>
  </Transition>
</template>
