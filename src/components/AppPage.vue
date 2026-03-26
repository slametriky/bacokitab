<script setup>
import { ref } from "vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import InputSection from "./InputSection.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api";
import { user, saveAnalysisToHistory } from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

useHead({
  title: 'Analisa I\'rab Bahasa Arab Otomatis - BacoKitab',
  meta: [
    {
      name: 'description',
      content: 'Gunakan AI untuk analisa I\'rab, Nahwu, dan Shorof secara instan. Cukup ketik, unggah foto kitab, atau ucapkan teks Arab Anda.'
    },
    {
      property: 'og:title',
      content: 'Analisa I\'rab Bahasa Arab Otomatis - BacoKitab'
    },
    {
      property: 'og:description',
      content: 'Gunakan AI untuk analisa I\'rab, Nahwu, dan Shorof secara instan. Cukup ketik, unggah foto kitab, atau ucapkan teks Arab Anda.'
    }
  ]
});

const isLoading = ref(false);
const result = ref(null);
const lastInputText = ref("");
const lastHistoryId = ref(null);
const lastPublicSlug = ref(null);

const handleAnalyze = async (text) => {
  isLoading.value = true;
  lastInputText.value = text;
  lastHistoryId.value = null;
  lastPublicSlug.value = null;
  result.value = null; // Reset result
  try {
    const response = await analyzeText(text);
    result.value = response;
    
    // Save to history if logged in
    if (user.value) {
      const saved = await saveAnalysisToHistory(user.value.id, text, response);
      lastHistoryId.value = saved?.id || null;
      lastPublicSlug.value = saved?.slug || null;
    }
  } catch (error) {
    alert("Terjadi kesalahan: " + error.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar />
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-24">
      <InputSection @analyze="handleAnalyze" :isLoading="isLoading" />
      <ResultSection v-if="result" :result="result" :inputText="lastInputText" :historyId="lastHistoryId" :publicSlug="lastPublicSlug" />
    </main>
    <TheFooter />
  </div>
</template>
