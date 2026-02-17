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
                    class="p-1.5 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors shrink-0"
                    title="Salin Kata"
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
  </section>
</template>

<script setup>
defineProps({
  result: {
    type: Object,
    required: true,
  },
});
</script>
