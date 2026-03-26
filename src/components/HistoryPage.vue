<template>
  <div class="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display">
    <TheNavbar v-show="!selectedResult" />
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-32 space-y-6">
      <h2 class="text-2xl font-black tracking-tight text-[#111814] dark:text-white mb-6">Riwayat Analisa</h2>
      
      <div v-if="isLoading" class="flex justify-center py-12">
        <span class="material-symbols-outlined text-4xl text-primary font-bold animate-spin" style="font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48;">progress_activity</span>
      </div>
      
      <div v-else-if="history.length === 0" class="text-center py-12 bg-white dark:bg-[#1a2f24] rounded-3xl border border-[#dbe6e0] dark:border-white/10 shadow-sm">
        <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">history</span>
        <p class="text-gray-500 dark:text-gray-400">Belum ada riwayat analisa.</p>
        <router-link to="/analisa" class="mt-4 inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-md">Mulai Analisa Baru</router-link>
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in history" :key="item.id" class="bg-white dark:bg-[#1a2f24] p-5 rounded-3xl border border-[#dbe6e0] dark:border-white/10 hover:border-primary/50 transition-all shadow-sm active:scale-[0.99] cursor-pointer group" @click="viewDetail(item)">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">{{ new Date(item.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</span>
            <span class="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">arrow_forward</span>
          </div>
          <p class="text-xl text-right arabic-text mb-4 line-clamp-2 text-[#111814] dark:text-white leading-[2.5rem]" dir="rtl">{{ item.input_text }}</p>
          <div class="bg-primary/5 rounded-xl border-l-4 border-primary p-3">
            <p class="text-sm text-[#111814] dark:text-gray-300 italic line-clamp-1 font-medium">"{{ item.result_data?.terjemahan }}"</p>
          </div>
        </div>
      </div>
      
      <!-- Infinite Scroll Trigger -->
      <div v-show="history.length > 0 && hasMore" ref="observerTarget" class="flex justify-center py-6">
        <span class="material-symbols-outlined text-3xl text-primary font-bold animate-spin" style="font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48;">progress_activity</span>
      </div>
      <div v-if="!hasMore && history.length > 0" class="text-center py-6">
        <p class="text-sm text-gray-400 dark:text-gray-500 font-medium">Semua riwayat telah ditampilkan.</p>
      </div>
      
    </main>
    <TheFooter />

    <!-- Full Result View -->
    <Transition
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div v-if="selectedResult" class="fixed inset-0 z-[100] overflow-y-auto bg-background-light dark:bg-background-dark font-display">
        <div class="sticky top-0 bg-white dark:bg-background-dark border-b border-[#dbe6e0] dark:border-white/10 z-10 w-full shadow-sm">
          <div class="max-w-2xl mx-auto px-4 h-16 flex items-center w-full gap-4">
            <button @click="selectedResult = null" class="p-2 bg-gray-100/50 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95 flex items-center justify-center text-[#111814] dark:text-white">
              <span class="material-symbols-outlined font-bold">arrow_back</span>
            </button>
            <h2 class="text-xl font-black flex-1 truncate dark:text-white tracking-tight">Detail Riwayat</h2>
          </div>
        </div>
        <div class="max-w-2xl mx-auto w-full px-4 py-8 pb-24">
          <!-- Reuse Result Section -->
          <ResultSection :result="selectedResult.result_data" :inputText="selectedResult.input_text" :historyId="selectedResult.id" :publicSlug="selectedResult.slug" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { user, getAnalysisHistory } from '../lib/supabase.js'
import { useHead } from '@unhead/vue'
import TheNavbar from './TheNavbar.vue'
import TheFooter from './TheFooter.vue'
import ResultSection from './ResultSection.vue'

const router = useRouter()
const isLoading = ref(true)
const history = ref([])
const selectedResult = ref(null)

useHead(() => {
  if (selectedResult.value) {
    const text = selectedResult.value.input_text;
    const title = `Analisa I'rab: ${text} - BacoKitab`;
    const description = `Lihat hasil analisa i'rab, nahwu, shorof, dan terjemahan dari teks bahasa Arab "${text}" di riwayat Anda.`;
    return {
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ]
    }
  }

  return {
    title: 'Riwayat Analisa - BacoKitab',
    meta: [
      {
        name: 'description',
        content: 'Lihat riwayat analisis i\'rab dan terjemahan teks bahasa Arab yang telah Anda lakukan di BacoKitab.'
      }
    ]
  }
})

const page = ref(0)
const hasMore = ref(true)
const isLoadingMore = ref(false)
const observerTarget = ref(null)
let observer = null

const loadHistory = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  
  try {
    const newData = await getAnalysisHistory(user.value.id, page.value, 10)
    if (newData.length < 10) {
      hasMore.value = false
    }
    history.value = [...history.value, ...newData]
    page.value++
  } catch (error) {
    console.error("Failed to load history:", error)
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(async () => {
  if (!user.value) {
    router.push('/login')
    return
  }
  
  await loadHistory()
  isLoading.value = false
  
  // Setup intersection observer for infinite scroll
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !isLoadingMore.value) {
      loadHistory()
    }
  }, { threshold: 0.1 })
  
  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

// Optional cleanup for observer, though Vue does it mostly automatically when ref unmounts
const viewDetail = (item) => {
  selectedResult.value = item
}
</script>
