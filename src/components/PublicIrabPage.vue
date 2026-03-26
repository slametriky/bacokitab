<template>
  <div class="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display">
    <TheNavbar />
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-32 space-y-6">
      <div v-if="isLoading" class="flex justify-center py-12">
        <span
          class="material-symbols-outlined text-4xl text-primary font-bold animate-spin"
          style="font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48;"
          >progress_activity</span
        >
      </div>
      <div
        v-else-if="!record"
        class="text-center py-12 bg-white dark:bg-[#1a2f24] rounded-3xl border border-[#dbe6e0] dark:border-white/10 shadow-sm space-y-4"
      >
        <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-2 block">search_off</span>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Halaman i'rab tidak ditemukan.</p>
        <router-link
          to="/"
          class="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-md"
          >Kembali ke Beranda</router-link
        >
      </div>
      <div v-else class="space-y-6">
        <h1 class="text-xl md:text-2xl font-black tracking-tight text-[#111814] dark:text-white">
          Hasil I'rab
        </h1>
        <ResultSection :result="record.result_data" :inputText="record.input_text" :publicSlug="record.public_slug" />
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import TheNavbar from './TheNavbar.vue'
import TheFooter from './TheFooter.vue'
import ResultSection from './ResultSection.vue'
import { getHistoryBySlug } from '../lib/supabase.js'

const route = useRoute()
const isLoading = ref(true)
const record = ref(null)

const load = async () => {
  isLoading.value = true
  record.value = null
  const slugParam = route.params.slug
  if (!slugParam) {
    isLoading.value = false
    return
  }
  record.value = await getHistoryBySlug(slugParam)
  isLoading.value = false
}

useHead(() => {
  const inputText = record.value?.input_text || ''
  const title = inputText ? `Analisa I'rab: ${inputText} - BacoKitab` : "Hasil Analisa I'rab - BacoKitab"
  const description = inputText
    ? `Lihat hasil analisa i'rab, nahwu, shorof, dan terjemahan dari teks bahasa Arab "${inputText}" menggunakan AI BacoKitab.`
    : "Lihat hasil analisa i'rab dan tata bahasa Arab dari BacoKitab."

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
    ],
  }
})

onMounted(load)

watch(
  () => route.params.slug,
  () => {
    load()
  },
)
</script>
