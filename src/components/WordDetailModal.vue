<template>
  <Transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal Panel -->
      <div
        class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-primary/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-5 border-b border-primary/10 bg-primary/5 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
            >
              <span class="material-symbols-outlined">menu_book</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-[#111814] dark:text-white">
                Detail Kata
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Analisis Morfologi & Sintaksis
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <!-- Main Word -->
          <div class="text-center space-y-2">
            <span
              class="arabic-text text-5xl font-bold text-primary block leading-[4rem]"
              dir="rtl"
            >
              {{ word?.kata }}
            </span>
            <p
              v-if="word?.detail?.makna"
              class="text-lg font-medium text-[#111814] dark:text-gray-200"
            >
              "{{ word.detail.makna }}"
            </p>

            <div
              v-if="word?.detail?.jenis_kata"
              class="mt-2 flex justify-center"
            >
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                <span class="material-symbols-outlined text-[14px]"
                  >account_tree</span
                >
                {{ word.detail.jenis_kata
                }}<template v-if="word?.detail?.bina">
                  - {{ word.detail.bina }}</template
                >
              </span>
            </div>
          </div>

          <div
            v-if="word?.detail?.makna_huruf"
            class="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-800/30 text-left"
          >
            <span
              class="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80 text-center"
              >Kemungkinan Makna Huruf</span
            >
            <ul
              v-if="Array.isArray(word.detail.makna_huruf)"
              class="list-none space-y-2 text-sm font-medium"
            >
              <li
                v-for="(makna, index) in word.detail.makna_huruf"
                :key="index"
                class="flex items-start gap-2"
              >
                <span class="text-blue-400 dark:text-blue-500 mt-1"
                  >&bull;</span
                >
                <span>{{ makna }}</span>
              </li>
            </ul>
            <span v-else class="text-sm font-medium block text-center">{{
              word.detail.makna_huruf
            }}</span>
          </div>

          <div
            class="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          ></div>

          <!-- Attributes Grid -->
          <div class="grid gap-4">
            <!-- Asal Kata & Wazan -->
            <div
              class="grid grid-cols-2 gap-4"
              v-if="
                (word?.detail?.asal_kata && word?.detail?.asal_kata !== '-') ||
                (word?.detail?.wazan && word?.detail?.wazan !== '-')
              "
            >
              <div
                class="bg-primary/5 rounded-xl p-4 border border-primary/10"
                v-if="
                  word?.detail?.asal_kata && word?.detail?.asal_kata !== '-'
                "
              >
                <span
                  class="block text-xs font-bold text-primary uppercase tracking-wider mb-2"
                  >Asal Kata</span
                >
                <span
                  class="arabic-text text-2xl font-bold text-[#111814] dark:text-white block text-right"
                  dir="rtl"
                  >{{ word?.detail?.asal_kata }}</span
                >
              </div>
              <div
                class="bg-primary/5 rounded-xl p-4 border border-primary/10"
                v-if="word?.detail?.wazan && word?.detail?.wazan !== '-'"
              >
                <span
                  class="block text-xs font-bold text-primary uppercase tracking-wider mb-2"
                  >Wazan</span
                >
                <span
                  class="arabic-text text-2xl font-bold text-[#111814] dark:text-white block text-right"
                  dir="rtl"
                  >{{ word?.detail?.wazan }}</span
                >
              </div>
            </div>

            <!-- Tashrif -->
            <div
              class="bg-primary/5 rounded-xl p-4 border border-primary/10"
              v-if="word?.detail?.tashrif && word?.detail?.tashrif !== '-'"
            >
              <span
                class="block text-xs font-bold text-primary uppercase tracking-wider mb-2"
                >Tashrif Ishtilahi</span
              >
              <span
                class="arabic-text text-2xl text-[#111814] dark:text-white block text-right leading-relaxed"
                dir="rtl"
                >{{ word?.detail?.tashrif }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  word: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(["close"]);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.2); /* primary color with opacity */
  border-radius: 20px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.5);
}
</style>
