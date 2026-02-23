<script setup>
import { ref } from "vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <TheNavbar />
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-24">
      <section
        class="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md backdrop-blur-md p-6"
      >
        <p class="mb-4 text-gray-700 dark:text-gray-300 text-justify">
          <strong>Bacokitab</strong> adalah aplikasi pembelajaran i‘rab bahasa
          Arab untuk membantu memahami dan membaca kitab gundul dengan lebih
          mudah dan sistematis.
        </p>
        <p class="mb-4 text-gray-700 dark:text-gray-300 text-justify">
          Aplikasi ini menggunakan teknologi AI untuk menganalisis struktur
          kalimat dan menghasilkan i‘rab secara otomatis berdasarkan kaidah
          nahwu. Hasil analisis mungkin masih memerlukan peninjauan kembali
          sebagai bagian dari proses training model AI.
        </p>
        <p class="mb-4 text-gray-700 dark:text-gray-300 text-justify">
          Jika terdapat kesalahan atau kekeliruan dalam hasil analisis, maupun
          saran untuk pengembangan aplikasi, silakan hubungi kami:
        </p>
        <ul class="list-none space-y-3 mb-6 text-gray-700 dark:text-gray-300">
          <li class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-green-500"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              ></path>
            </svg>
            <span class="font-medium">WhatsApp:</span>
            <a
              href="https://wa.me/62895352414040"
              class="text-primary hover:underline"
              target="_blank"
              >+62895352414040</a
            >
          </li>
          <li class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-red-500"
            >
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <span class="font-medium">Email:</span>
            <a
              href="mailto:riyanriky@gmail.com"
              class="text-primary hover:underline"
              >riyanriky@gmail.com</a
            >
          </li>
        </ul>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Terima kasih telah menggunakan <strong>Bacokitab</strong>.
        </p>
      </section>
    </main>
    <TheFooter />
  </div>
</template>

<style scoped>
/* Optional: add any component‑specific styling here */
</style>
