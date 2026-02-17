<script setup>
import { ref } from "vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import InputSection from "./InputSection.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api";

const isLoading = ref(false);
const result = ref(null);

const handleAnalyze = async (text) => {
  isLoading.value = true;
  result.value = null; // Reset result
  try {
    const response = await analyzeText(text);
    result.value = response;
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
      <ResultSection v-if="result" :result="result" />
    </main>
    <TheFooter />
  </div>
</template>
