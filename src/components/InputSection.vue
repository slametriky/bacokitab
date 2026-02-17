<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-xl font-bold px-1 text-[#111814] dark:text-white">
        Input Kalimat
      </h2>
      <div class="relative">
        <textarea
          v-model="inputText"
          class="w-full min-h-[160px] p-4 rounded-xl border border-primary/20 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent text-lg placeholder:text-gray-400 transition-all resize-none dark:text-white"
          maxlength="500"
          placeholder="Masukkan kalimat bahasa Arab atau Latin di sini..."
        ></textarea>
        <div class="flex items-center justify-between mt-2 px-1">
          <div class="flex gap-2">
            <button
              @click="triggerToast('Fitur belum tersedia, segera hadir')"
              class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 flex items-center justify-center"
              title="Ambil Foto / OCR"
            >
              <span class="material-symbols-outlined">photo_camera</span>
            </button>
            <button
              @click="triggerToast('Fitur belum tersedia, segera hadir')"
              class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 flex items-center justify-center"
              title="Input Suara"
            >
              <span class="material-symbols-outlined">mic</span>
            </button>
          </div>
          <span class="text-xs text-gray-500 font-medium"
            >{{ inputText.length }} / 500 karakter</span
          >
        </div>
      </div>
    </div>
    <button
      @click="$emit('analyze', inputText)"
      :disabled="isLoading || !inputText.trim()"
      class="w-full bg-primary hover:bg-primary/90 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-white disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span v-if="isLoading" class="material-symbols-outlined animate-spin"
        >progress_activity</span
      >
      <span>{{
        isLoading ? "Sedang Menganalisis..." : "Analisis Kalimat"
      }}</span>
    </button>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div
        v-if="showToast"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 min-w-max"
      >
        <span class="material-symbols-outlined text-yellow-400">info</span>
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  isLoading: Boolean,
});

const emit = defineEmits(["analyze"]);

const inputText = ref("");
const showToast = ref(false);
const toastMessage = ref("");
let toastTimeout = null;

const triggerToast = (message) => {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = message;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};
</script>
