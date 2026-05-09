<script setup>
import { computed, onMounted, ref, watch } from "vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import InputSection from "./InputSection.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api";
import { user, saveAnalysisToHistory, saveUserReview, hasUserReview, getAnalysisHistory, getUserTokenStats, getTokenPackages } from "../lib/supabase.js";
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
const showTokenModal = ref(false);
const tokenPackages = ref([]);
const isLoadingPackages = ref(false);

const handleLimitReached = async () => {
  showTokenModal.value = true;
  if (tokenPackages.value.length === 0) {
    isLoadingPackages.value = true;
    tokenPackages.value = await getTokenPackages();
    isLoadingPackages.value = false;
  }
};

const buyPackage = (pkg) => {
  const userEmail = user.value?.email || 'Guest';
  const tokenAmountStr = pkg.token_amount.toLocaleString('id-ID');
  const priceStr = pkg.price.toLocaleString('id-ID');
  const text = `Halo Admin, saya ingin membeli paket token BacoKitab.\n\nPaket: ${tokenAmountStr} Token\nHarga: Rp ${priceStr}\nEmail Akun: ${userEmail}\n\nMohon info pembayarannya.`;
  const waUrl = `https://wa.me/62895352414040?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
};


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
      <InputSection @analyze="handleAnalyze" @refresh-stats="refreshReviewStatus" @limit-reached="handleLimitReached" :isLoading="isLoading" :tokenStats="tokenStats" />
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

    <!-- Token Top-up Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showTokenModal"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-primary/10">
          <div class="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start relative overflow-hidden gap-4">
             <!-- Background Decoration -->
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div class="relative z-10">
              <h3 class="text-lg sm:text-xl font-bold text-[#111814] dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-orange-500">generating_tokens</span>
                Tambah Token
              </h3>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Limit harian Anda telah habis. Beli token untuk terus menggunakan fitur analisa.
              </p>
            </div>
            <button @click="showTokenModal = false" class="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative z-10 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <span class="material-symbols-outlined block text-[20px]">close</span>
            </button>
          </div>
          
          <div class="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
            <div v-if="isLoadingPackages" class="flex flex-col items-center justify-center py-8">
              <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-2">progress_activity</span>
              <p class="text-sm text-gray-500">Memuat paket...</p>
            </div>
            <div v-else class="space-y-3 sm:space-y-4">
              <div v-for="pkg in tokenPackages" :key="pkg.id" class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:shadow-md transition-all flex items-center justify-between group gap-2">
                <div class="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-xl sm:text-2xl">workspace_premium</span>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <h4 class="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">{{ pkg.token_amount.toLocaleString('id-ID') }} Token</h4>
                    <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">~{{ ((pkg.token_amount / 5000) * 400).toLocaleString('id-ID') }} karakter</p>
                    <p class="text-sm sm:text-base text-primary font-bold">Rp {{ pkg.price.toLocaleString('id-ID') }}</p>
                  </div>
                </div>
                <button @click="buyPackage(pkg)" class="flex-shrink-0 bg-primary hover:bg-primary/90 text-white px-4 sm:px-5 py-2 rounded-lg font-bold text-sm shadow-sm active:scale-95 transition-all">
                  Beli
                </button>
              </div>
            </div>
            
            <p class="text-[11px] sm:text-xs text-center text-gray-500 dark:text-gray-400 mt-5 sm:mt-6 flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[14px] sm:text-[16px]">info</span>
              Pembelian saat ini diproses manual via WhatsApp
            </p>
          </div>
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
