<script setup>
import { computed, onMounted, ref, watch } from "vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import InputSection from "./InputSection.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api";
import { user, saveAnalysisToHistory, saveUserReview, hasUserReview, getAnalysisHistory, getUserTokenStats } from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

useHead({
  title: 'Analisa I\'rab Bahasa Arab dengan AI - BacoKitab',
  meta: [
    {
      name: 'description',
      content: 'Gunakan AI untuk analisa I\'rab, Nahwu, dan Shorof secara instan. Cukup ketik, unggah foto kitab, atau ucapkan teks Arab Anda.'
    },
    {
      property: 'og:title',
      content: 'Analisa I\'rab Bahasa Arab dengan AI - BacoKitab'
    },
    {
      property: 'og:description',
      content: 'Gunakan AI untuk analisa I\'rab, Nahwu, dan Shorof secara instan. Cukup ketik, unggah foto kitab, atau ucapkan teks Arab Anda.'
    }
  ]
});

const isLoading = ref(false);
const result = ref(null);
const hasAnalyzedBefore = ref(false);
const reviewSubmitted = ref(false);
const showReviewModal = ref(false);
const reviewSource = ref("");
const reviewFeedback = ref("");
const pendingAnalyzeText = ref("");
const GUEST_REVIEW_KEY = "bacokitab_review_submitted_guest";
const HAS_ANALYZED_KEY = "bacokitab_has_analyzed_guest";
const showToast = ref(false);
const toastMessage = ref("");
let toastTimeout = null;
const canSubmitReview = computed(
  () => reviewSource.value.trim().length > 0 && reviewFeedback.value.trim().length > 0
);
const tokenStats = ref(null);


const runAnalyze = async (text) => {
  isLoading.value = true;
  result.value = null; // Reset result
  try {
    const response = await analyzeText(text);
    result.value = response;
    hasAnalyzedBefore.value = true;
    localStorage.setItem(HAS_ANALYZED_KEY, "1");
    
    // Save to history if logged in
    if (user.value) {
      await saveAnalysisToHistory(user.value.id, text, response);
      tokenStats.value = await getUserTokenStats();
    }
  } catch (error) {
    alert("Terjadi kesalahan: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

const handleAnalyze = async (text) => {
  if (hasAnalyzedBefore.value && !reviewSubmitted.value) {
    pendingAnalyzeText.value = text;
    showReviewModal.value = true;
    return;
  }

  await runAnalyze(text);
};

const refreshReviewStatus = async () => {
  if (user.value?.id) {
    reviewSubmitted.value = await hasUserReview(user.value.id);
    const history = await getAnalysisHistory(user.value.id, 0, 1);
    hasAnalyzedBefore.value = history && history.length > 0;
    tokenStats.value = await getUserTokenStats();
    return;
  }
  tokenStats.value = null;
  reviewSubmitted.value = localStorage.getItem(GUEST_REVIEW_KEY) === "1";
  hasAnalyzedBefore.value = localStorage.getItem(HAS_ANALYZED_KEY) === "1";
};

const triggerToast = (message) => {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = message;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 2500);
};

const submitReviewAndContinue = async () => {
  const source = reviewSource.value.trim();
  const feedback = reviewFeedback.value.trim();

  if (!source || !feedback) {
    alert("Mohon isi asal tahu aplikasi dan review terlebih dahulu.");
    return;
  }

  if (user.value) {
    await saveUserReview(user.value.id, source, feedback);
  } else {
    localStorage.setItem(GUEST_REVIEW_KEY, "1");
  }

  reviewSubmitted.value = true;
  showReviewModal.value = false;
  reviewSource.value = "";
  reviewFeedback.value = "";
  triggerToast("Terima kasih! Review Anda berhasil dikirim.");

  const nextText = pendingAnalyzeText.value;
  pendingAnalyzeText.value = "";
  if (nextText) await runAnalyze(nextText);
};

onMounted(() => {
  refreshReviewStatus();
});

watch(
  () => user.value?.id,
  () => {
    refreshReviewStatus();
  }
);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar />
    <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-24">
      <InputSection @analyze="handleAnalyze" @refresh-stats="refreshReviewStatus" :isLoading="isLoading" :tokenStats="tokenStats" />
      <ResultSection v-if="result" :result="result" />
    </main>
    <TheFooter />

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showReviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 border border-primary/10">
          <h3 class="text-lg font-bold text-[#111814] dark:text-white">Bantu Kami Meningkatkan BacoKitab</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Sebelum analisa berikutnya, mohon isi review singkat Anda.
          </p>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-[#111814] dark:text-white">Tahu aplikasi ini dari mana?</label>
            <input
              v-model="reviewSource"
              type="text"
              placeholder="Contoh: Google, teman, sosial media, dll"
              class="w-full p-3 rounded-xl border border-primary/20 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-[#111814] dark:text-white">Review anda tentang aplikasi ini</label>
            <textarea
              v-model="reviewFeedback"
              rows="4"
              placeholder="Tulis review, saran, atau pengalaman Anda menggunakan aplikasi ini"
              class="w-full p-3 rounded-xl border border-primary/20 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent resize-none dark:text-white"
            ></textarea>
          </div>
          <button
            @click="submitReviewAndContinue"
            :disabled="!canSubmitReview"
            class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:active:scale-100"
          >
            Kirim Review & Lanjut Analisa
          </button>
        </div>
      </div>
    </Transition>

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
        <span class="material-symbols-outlined text-green-400">check_circle</span>
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>
