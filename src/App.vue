<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const deferredPrompt = ref(null);
const showInstallPrompt = ref(false);
const isOldDomain = ref(false);
const isCopied = ref(false);

const copyDomain = async () => {
  try {
    await navigator.clipboard.writeText("https://bacokitab.web.id");
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 3000);
  } catch (err) {
    console.error("Gagal menyalin: ", err);
  }
};

const handleBeforeInstallPrompt = (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt.value = e;
  // Update UI to notify the user they can add to home screen
  showInstallPrompt.value = true;
};

onMounted(() => {
  // if (window.location.hostname === "bacokitab.vercel.app") {
  //   const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  //   if (!isStandalone) {
  //     window.location.replace("https://bacokitab.web.id" + window.location.pathname + window.location.search);
  //     return;
  //   }
  //   isOldDomain.value = true;
  // }
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
  <!-- Old Domain Migration Modal -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOldDomain"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center border-2 border-red-500"
      >
        <div
          class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span class="material-symbols-outlined text-3xl">warning</span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Pindah Domain Baru
        </h3>
        <div
          class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
        >
          <p class="mb-3 text-center">
            Halo! Aplikasi BacoKitab sekarang punya alamat baru di
            <strong>bacokitab.web.id</strong> 🎉
          </p>
          <p class="font-medium mb-2">
            Yuk pindah ke aplikasi baru dengan 3 langkah mudah:
          </p>
          <ol
            class="list-decimal pl-5 space-y-1 text-gray-500 dark:text-gray-400"
          >
            <li><strong>Salin URL</strong> di bawah ini.</li>
            <li>
              Buka browser (Chrome/Safari) lalu
              <strong>Paste/Tempel</strong> URL-nya.
            </li>
            <li>
              <strong>Install aplikasinya</strong> lalu hapus versi lama ini.
            </li>
          </ol>
        </div>

        <div
          class="flex items-center gap-2 mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <input
            type="text"
            readonly
            value="https://bacokitab.web.id"
            class="w-full bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none px-2"
          />
          <button
            @click="copyDomain"
            class="flex-shrink-0 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">{{
              isCopied ? "check" : "content_copy"
            }}</span>
            {{ isCopied ? "Tersalin" : "Salin URL" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

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
