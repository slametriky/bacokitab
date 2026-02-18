<template>
  <section class="space-y-6" v-if="result">
    <div class="flex items-center justify-between px-1">
      <h2 class="text-xl font-bold text-[#111814] dark:text-white">
        Hasil Analisis
      </h2>
      <span
        class="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full uppercase tracking-wider"
        >AI Generated</span
      >
    </div>

    <!-- Sentence Card -->
    <div
      class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-primary/10 p-6 text-center relative flex flex-col gap-4"
    >
      <div class="flex items-start justify-between w-full">
        <button
          @click="copyToClipboard(result.teks_berharokat)"
          class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
          title="Salin Semua"
        >
          <span class="material-symbols-outlined text-xl">content_copy</span>
          <span class="text-xs font-bold uppercase tracking-wider">Salin</span>
        </button>
        <div class="opacity-10">
          <span
            class="material-symbols-outlined text-5xl text-[#111814] dark:text-white"
            >book_2</span
          >
        </div>
      </div>

      <p
        class="arabic-text leading-[3.5rem] text-[#111814] dark:text-white text-xl md:text-2xl px-2 pb-2"
        dir="rtl"
      >
        {{ result.teks_berharokat }}
      </p>
    </div>

    <!-- Translation Alert -->
    <div
      class="flex gap-4 p-4 rounded-xl bg-primary/5 border-l-4 border-primary items-start"
    >
      <span class="material-symbols-outlined text-primary mt-0.5"
        >translate</span
      >
      <div class="space-y-1">
        <p class="text-sm font-semibold text-primary">Terjemahan</p>
        <p class="text-[#111814] dark:text-gray-300 italic">
          "{{ result.terjemahan }}"
        </p>
      </div>
    </div>

    <!-- Analysis Table -->
    <div
      class="overflow-hidden rounded-xl border border-primary/10 shadow-sm bg-white dark:bg-gray-900"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-primary/10 border-b border-primary/10">
              <th
                class="p-4 text-sm font-bold text-[#111814] dark:text-white uppercase tracking-wider text-right"
              >
                Al-I'rab (Analisis Tata Bahasa)
              </th>
              <th
                class="p-4 text-sm font-bold text-[#111814] dark:text-white uppercase tracking-wider text-right"
              >
                Al-Kalimah
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary/5">
            <tr
              v-for="(item, index) in result.analisis_irab"
              :key="index"
              class="hover:bg-primary/5 transition-colors"
            >
              <td
                class="p-4 text-sm text-gray-700 dark:text-gray-300 text-right align-top"
                dir="rtl"
              >
                <span class="arabic-text text-base leading-[3rem]">{{
                  item.irab_lengkap
                }}</span>
              </td>
              <td class="p-4 text-right align-top w-1/4">
                <div class="flex items-center justify-end gap-3">
                  <button
                    @click="
                      copyToClipboard(
                        `${item.kata}\n\n${item.irab_lengkap}`,
                        'Kata & I\'rab',
                      )
                    "
                    class="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors shrink-0"
                    title="Salin Kata & I'rab"
                  >
                    <span class="material-symbols-outlined text-lg"
                      >content_copy</span
                    >
                  </button>
                  <span
                    class="arabic-text text-xl font-bold text-[#111814] dark:text-white"
                    >{{ item.kata }}</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
        <span class="material-symbols-outlined text-green-400"
          >check_circle</span
        >
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  result: {
    type: Object,
    required: true,
  },
});

const showToast = ref(false);
const toastMessage = ref("");
let toastTimeout = null;

const triggerToast = (message) => {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = message;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

const copyToClipboard = async (text, type = "Teks") => {
  try {
    await navigator.clipboard.writeText(text);
    triggerToast(`${type} berhasil disalin!`);
  } catch (err) {
    triggerToast(`Gagal menyalin ${type}`);
    console.error("Failed to copy: ", err);
  }
};
</script>
