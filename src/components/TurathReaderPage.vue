<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import InputSection from "./InputSection.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api.js";
import {
  user,
  saveAnalysisToHistory,
  getUserTokenStats,
} from "../lib/supabase.js";
import { useHead } from "@unhead/vue";
import { getTurathBook, getTurathPage } from "../lib/turath.js";

const route = useRoute();
const router = useRouter();

const bookId = computed(() => route.params.bookId);
const currentPage = ref(parseInt(route.query.page, 10) || 1);

// Kitab & Page State
const isBookLoading = ref(true);
const isPageLoading = ref(true);
const bookInfo = ref(null);
const pageData = ref(null);
const errorMessage = ref("");

// UI Preferences
const fontSize = ref(parseInt(localStorage.getItem("turath_font_size"), 10) || 22); // px
const paperTheme = ref(localStorage.getItem("turath_paper_theme") || "classic"); // 'classic' | 'white' | 'dark'

// State Modal Index / Daftar Isi
const isIndexModalOpen = ref(false);
const indexSearchQuery = ref("");

// State Seleksi Teks
const selectedText = ref("");

// Resizable Split-View & Analyze Panel State
// Di desktop (>= 1024px) terbuka berdampingan (split-view), di layar HP/tablet default tertutup agar tidak menutupi kitab
const isAnalyzeOpen = ref(
  typeof window !== "undefined" ? window.innerWidth >= 1024 : false
);
const analyzePanelWidth = ref(
  parseInt(localStorage.getItem("turath_split_width"), 10) || 480
);
const isResizing = ref(false);

// Analyze State
const isAnalyzing = ref(false);
const analyzeResult = ref(null);
const analyzeError = ref("");
const tokenStats = ref(null);
const inputSectionRef = ref(null);

useHead(() => ({
  title: bookInfo.value
    ? `${bookInfo.value.name} (Hal. ${currentPage.value}) - BacoKitab`
    : "Membaca Kitab Digital - BacoKitab",
}));

// ==========================================
// RESIZING LOGIC
// ==========================================
const startResize = (e) => {
  isResizing.value = true;
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchmove", handleResizeTouch, { passive: false });
  document.addEventListener("touchend", stopResize);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
};

const handleResize = (e) => {
  if (!isResizing.value) return;
  const windowWidth = window.innerWidth;
  const newWidth = windowWidth - e.clientX;
  // Batas minimum 320px dan maksimum 75% layar
  if (newWidth >= 320 && newWidth <= windowWidth * 0.75) {
    analyzePanelWidth.value = newWidth;
  }
};

const handleResizeTouch = (e) => {
  if (!isResizing.value || !e.touches[0]) return;
  e.preventDefault();
  const windowWidth = window.innerWidth;
  const newWidth = windowWidth - e.touches[0].clientX;
  if (newWidth >= 320 && newWidth <= windowWidth * 0.75) {
    analyzePanelWidth.value = newWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleResizeTouch);
  document.removeEventListener("touchend", stopResize);
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  localStorage.setItem("turath_split_width", String(analyzePanelWidth.value));
};

// ==========================================
// PREFERENCES
// ==========================================
const setFontSize = (size) => {
  fontSize.value = size;
  localStorage.setItem("turath_font_size", String(size));
};

const setPaperTheme = (theme) => {
  paperTheme.value = theme;
  localStorage.setItem("turath_paper_theme", theme);
};

// ==========================================
// DATA FETCHING
// ==========================================
const fetchBookMetadata = async () => {
  if (!bookId.value) return;
  isBookLoading.value = true;
  try {
    const info = await getTurathBook(bookId.value);
    bookInfo.value = info;
  } catch (err) {
    console.error("Error fetching book metadata:", err);
    errorMessage.value = err.message || "Gagal memuat metadata kitab.";
  } finally {
    isBookLoading.value = false;
  }
};

const fetchPageContent = async (pageNumber) => {
  if (!bookId.value) return;
  isPageLoading.value = true;
  errorMessage.value = "";
  selectedText.value = "";

  try {
    const data = await getTurathPage(bookId.value, pageNumber);
    pageData.value = data;
    currentPage.value = pageNumber;

    router.replace({
      query: { ...route.query, page: pageNumber },
    });
  } catch (err) {
    console.error("Error fetching page content:", err);
    errorMessage.value = err.message || `Gagal memuat teks halaman ${pageNumber}.`;
  } finally {
    isPageLoading.value = false;
  }
};

const goToPage = (pageNumber) => {
  const target = Math.max(1, parseInt(pageNumber, 10) || 1);
  if (target === currentPage.value && pageData.value) return;
  fetchPageContent(target);
};

const nextPage = () => {
  goToPage(currentPage.value + 1);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

// ==========================================
// TEXT SELECTION & SEND TO ANALYZE
// ==========================================
const handleTextSelection = () => {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : "";
  if (text && text.length > 2) {
    selectedText.value = text;
  } else {
    selectedText.value = "";
  }
};

const sendToAnalyzePanel = async (customText = null) => {
  const textToSend = customText || selectedText.value || pageData.value?.text || "";
  if (!textToSend.trim()) return;

  isAnalyzeOpen.value = true;
  await nextTick();
  if (inputSectionRef.value) {
    inputSectionRef.value.setText(textToSend.trim());
  }
  selectedText.value = "";
};

// ==========================================
// ANALYZE HANDLERS
// ==========================================
const refreshTokenStats = async () => {
  if (user.value?.id) {
    tokenStats.value = await getUserTokenStats();
  } else {
    tokenStats.value = null;
  }
};

const handleAnalyze = async (text, isShort) => {
  isAnalyzing.value = true;
  analyzeError.value = "";
  analyzeResult.value = null;
  try {
    const response = await analyzeText(text, isShort);
    analyzeResult.value = { ...response, isShort };

    if (user.value?.id) {
      await saveAnalysisToHistory(user.value.id, text, analyzeResult.value);
      await refreshTokenStats();
    }
  } catch (err) {
    analyzeError.value = err.message || "Terjadi kesalahan saat menganalisa teks.";
  } finally {
    isAnalyzing.value = false;
  }
};

const handleLimitReached = () => {
  analyzeError.value =
    "Limit token harian Anda sudah habis. Silakan tunggu reset harian atau upgrade token Anda.";
};

// ==========================================
// INDEX FILTERING
// ==========================================
const filteredIndexes = computed(() => {
  if (!bookInfo.value?.indexes || !Array.isArray(bookInfo.value.indexes)) return [];
  const q = indexSearchQuery.value.trim().toLowerCase();
  if (!q) return bookInfo.value.indexes;
  return bookInfo.value.indexes.filter((item) => {
    const title = (item.title || item.name || "").toLowerCase();
    return title.includes(q);
  });
});

const jumpToIndexPage = (idx) => {
  const targetPage = idx.page || idx.pg || idx.page_id || 1;
  isIndexModalOpen.value = false;
  goToPage(targetPage);
};

// Paper Styles
const paperClasses = computed(() => {
  if (paperTheme.value === "dark") {
    return "bg-gray-900 text-gray-100 border-gray-800 shadow-xl";
  }
  if (paperTheme.value === "white") {
    return "bg-white text-gray-900 border-gray-200 shadow-md";
  }
  // Classic (Kuning Kertas Kitab)
  return "bg-[#fcf8f0] text-[#2c2013] border-[#e8dcc6] dark:bg-[#1e1913] dark:text-[#f3e9d8] dark:border-[#382b1d] shadow-md";
});

watch(
  () => route.params.bookId,
  (newId) => {
    if (newId) {
      fetchBookMetadata();
      fetchPageContent(currentPage.value);
    }
  }
);

onMounted(() => {
  fetchBookMetadata();
  fetchPageContent(currentPage.value);
  refreshTokenStats();
});

onUnmounted(() => {
  stopResize();
});
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-background-dark overflow-hidden">
    <!-- Top Header Toolbar -->
    <header class="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-3 sm:px-5 py-2.5 z-30">
      <div class="max-w-full mx-auto flex flex-wrap items-center justify-between gap-2">
        <!-- Left: Back + Book Title -->
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <router-link
            to="/kitab-digital"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300 flex-shrink-0"
            title="Kembali ke Perpustakaan Kitab"
          >
            <span class="material-symbols-outlined block text-[22px]">arrow_back</span>
          </router-link>

          <div v-if="bookInfo" class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h1 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate font-arabic">
                {{ bookInfo.name }}
              </h1>
              <span
                v-if="pageData?.vol && pageData.vol !== '1'"
                class="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex-shrink-0"
              >
                Jilid {{ pageData.vol }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ bookInfo.author || "Ulama Klasik" }}
            </p>
          </div>
          <div v-else class="text-xs text-gray-400 animate-pulse">
            Memuat metadata kitab...
          </div>
        </div>

        <!-- Right: Actions & Display Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Tombol Daftar Isi -->
          <button
            v-if="bookInfo?.indexes?.length > 0"
            @click="isIndexModalOpen = true"
            class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Buka Daftar Isi / Indeks Bab"
          >
            <span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
            <span class="hidden md:inline">Daftar Isi</span>
          </button>

          <!-- Font Size Adjustment -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-0.5">
            <button
              @click="setFontSize(Math.max(16, fontSize - 2))"
              class="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Perkecil Font"
            >
              A-
            </button>
            <span class="text-[11px] font-semibold text-gray-400 px-1">{{ fontSize }}px</span>
            <button
              @click="setFontSize(Math.min(36, fontSize + 2))"
              class="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Perbesar Font"
            >
              A+
            </button>
          </div>

          <!-- Paper Theme Selector -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-0.5">
            <button
              @click="setPaperTheme('classic')"
              :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                paperTheme === 'classic' ? 'bg-[#fcf8f0] text-amber-900 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900'
              ]"
              title="Kertas Kuning Klasik"
            >
              <span class="w-3.5 h-3.5 rounded-full bg-[#e8dcc6] border border-amber-800/30"></span>
            </button>
            <button
              @click="setPaperTheme('white')"
              :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                paperTheme === 'white' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900'
              ]"
              title="Kertas Putih"
            >
              <span class="w-3.5 h-3.5 rounded-full bg-white border border-gray-300"></span>
            </button>
            <button
              @click="setPaperTheme('dark')"
              :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                paperTheme === 'dark' ? 'bg-gray-800 text-white font-bold shadow-sm' : 'text-gray-500 hover:text-gray-300'
              ]"
              title="Mode Gelap"
            >
              <span class="w-3.5 h-3.5 rounded-full bg-gray-900 border border-gray-600"></span>
            </button>
          </div>

          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

          <!-- Toggle Panel Analisa -->
          <button
            @click="isAnalyzeOpen = !isAnalyzeOpen"
            :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95',
              isAnalyzeOpen
                ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'
            ]"
            title="Buka / Tutup Panel Analisa I'rab"
          >
            <span class="material-symbols-outlined text-[17px]">analytics</span>
            <span>{{ isAnalyzeOpen ? "Tutup Analisa" : "Buka Analisa" }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace (Split View) -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- LEFT: Book Reader Section -->
      <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-gray-100/70 dark:bg-gray-900/60">
        <!-- Error State -->
        <div v-if="errorMessage" class="flex-1 flex items-center justify-center p-6 text-center">
          <div class="max-w-md p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl space-y-3">
            <span class="material-symbols-outlined text-4xl text-red-600">error</span>
            <p class="text-sm text-red-700 dark:text-red-300 font-medium">{{ errorMessage }}</p>
            <button
              @click="fetchPageContent(currentPage)"
              class="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Muat Ulang
            </button>
          </div>
        </div>

        <!-- Scrollable Book Content -->
        <div
          v-else
          class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start"
          @mouseup="handleTextSelection"
          @keyup="handleTextSelection"
        >
          <!-- Loading Spinner -->
          <div v-if="isPageLoading && !pageData" class="py-24 text-center">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Memuat teks kitab...</p>
          </div>

          <!-- Book Page Sheet -->
          <article
            v-else
            :class="[
              'w-full max-w-3xl rounded-3xl p-6 sm:p-10 md:p-12 border transition-all duration-300 min-h-[500px] select-text relative',
              paperClasses
            ]"
          >
            <!-- Page Header Meta -->
            <div class="flex items-center justify-between pb-4 mb-6 border-b border-black/10 dark:border-white/10 text-xs opacity-75">
              <span class="font-arabic font-bold truncate max-w-[70%]">{{ bookInfo?.name }}</span>
              <span class="font-semibold whitespace-nowrap">Halaman {{ currentPage }}</span>
            </div>

            <!-- Headings / Judul Bab pada Halaman -->
            <div v-if="pageData?.headings && pageData.headings.length > 0" class="mb-6 space-y-2 text-center">
              <div
                v-for="(h, idx) in pageData.headings"
                :key="idx"
                class="font-arabic font-extrabold text-amber-800 dark:text-amber-300 text-xl md:text-2xl leading-relaxed"
                dir="rtl"
              >
                {{ h }}
              </div>
            </div>

            <!-- Teks Arab Asli -->
            <div
              class="font-arabic text-right whitespace-pre-wrap select-text tracking-wide"
              :style="{ fontSize: `${fontSize}px`, lineHeight: '2.4' }"
              dir="rtl"
            >
              {{ pageData?.text || "Halaman kosong atau tidak ada teks." }}
            </div>

            <!-- Page Footer Actions inside Paper -->
            <div class="mt-12 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-2 text-xs opacity-80">
              <button
                @click="sendToAnalyzePanel(pageData?.text)"
                class="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-1 font-bold shadow-sm"
              >
                <span class="material-symbols-outlined text-[15px]">analytics</span>
                Analisa Seluruh Halaman
              </button>
            </div>
          </article>
        </div>

        <!-- Floating Selection Toolbar (Muncul saat kalimat diblok) -->
        <Transition
          enter-active-class="transform transition ease-out duration-200"
          enter-from-class="translate-y-4 opacity-0 scale-95"
          enter-to-class="translate-y-0 opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="translate-y-4 opacity-0 scale-95"
        >
          <div
            v-if="selectedText"
            class="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-3 backdrop-blur-md max-w-[94%]"
          >
            <div class="flex items-center gap-1.5 text-xs text-amber-300 truncate">
              <span class="material-symbols-outlined text-base flex-shrink-0">check_circle</span>
              <span class="font-bold truncate">{{ selectedText.length }} karakter terpilih</span>
            </div>

            <button
              @click="sendToAnalyzePanel()"
              class="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span class="material-symbols-outlined text-base">analytics</span>
              <span>Kirim ke Analisa</span>
            </button>

            <button
              @click="selectedText = ''"
              class="p-1 text-gray-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
              title="Tutup"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </Transition>

        <!-- Bottom Page Navigation Bar -->
        <div class="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 text-xs">
          <button
            @click="prevPage"
            :disabled="currentPage <= 1 || isPageLoading"
            class="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">chevron_left</span>
            <span class="hidden sm:inline">Sebelumnya</span>
          </button>

          <!-- Input Halaman Langsung -->
          <div class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <span>Halaman</span>
            <input
              type="number"
              min="1"
              :value="currentPage"
              @change="goToPage($event.target.value)"
              class="w-16 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            @click="nextPage"
            :disabled="isPageLoading"
            class="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <span class="hidden sm:inline">Selanjutnya</span>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- RESIZABLE SPLITTER (Visible on lg and above) -->
      <div
        v-if="isAnalyzeOpen"
        @mousedown="startResize"
        @touchstart="startResize"
        class="hidden lg:flex w-2.5 hover:w-3.5 bg-gray-200 dark:bg-gray-700 hover:bg-primary/50 cursor-col-resize transition-all items-center justify-center flex-shrink-0 z-20 select-none group"
        title="Tarik untuk mengubah ukuran lebar panel kitab & analisa"
      >
        <div class="w-1 h-8 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-white transition-colors"></div>
      </div>

      <!-- Mobile Backdrop for Analyze Drawer -->
      <div
        v-if="isAnalyzeOpen"
        @click="isAnalyzeOpen = false"
        class="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
      ></div>

      <!-- RIGHT: Unified Resizable Analyze Panel (Desktop Split / Mobile Bottom Drawer) -->
      <aside
        v-show="isAnalyzeOpen"
        :style="`--desktop-width: ${analyzePanelWidth}px`"
        class="fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t shadow-2xl z-40 flex flex-col bg-gray-50 dark:bg-background-dark border-gray-200 dark:border-gray-700 lg:static lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none flex-shrink-0 overflow-hidden lg:w-[var(--desktop-width)]"
      >
        <!-- Panel Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">analytics</span>
            <h2 class="font-bold text-sm text-gray-900 dark:text-white">
              Analisa I'rab & Makna
            </h2>
          </div>
          <button
            @click="isAnalyzeOpen = false"
            class="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Tutup Panel Analisa"
          >
            <span class="material-symbols-outlined block text-[18px]">close</span>
          </button>
        </div>

        <!-- Scrollable Analyze Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-5 pb-8">
          <div
            v-if="analyzeError"
            class="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center justify-between gap-2"
          >
            <span>{{ analyzeError }}</span>
            <button @click="analyzeError = ''" class="text-red-500 hover:text-red-700">
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <InputSection
            ref="inputSectionRef"
            @analyze="handleAnalyze"
            @refresh-stats="refreshTokenStats"
            @limit-reached="handleLimitReached"
            :isLoading="isAnalyzing"
            :tokenStats="tokenStats"
            :hideMediaActions="true"
          />

          <ResultSection v-if="analyzeResult" :result="analyzeResult" />
        </div>
      </aside>
    </div>

    <!-- Modal Daftar Isi / Indeks Bab -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isIndexModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="isIndexModalOpen = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-xl">
                <span class="material-symbols-outlined text-xl">menu_book</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">Daftar Isi (Index Bab)</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-arabic truncate max-w-[260px]">
                  {{ bookInfo?.name }}
                </p>
              </div>
            </div>
            <button
              @click="isIndexModalOpen = false"
              class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div class="p-4 border-b border-gray-100 dark:border-gray-700">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <span class="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                type="text"
                v-model="indexSearchQuery"
                placeholder="Cari bab atau topik..."
                dir="auto"
                class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-3 divide-y divide-gray-100 dark:divide-gray-700/50">
            <div v-if="filteredIndexes.length === 0" class="py-12 text-center text-xs text-gray-400">
              Bab tidak ditemukan
            </div>
            <button
              v-for="(idx, i) in filteredIndexes"
              :key="i"
              type="button"
              @click="jumpToIndexPage(idx)"
              class="w-full text-right p-3 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-colors flex items-center justify-between gap-3 group"
              dir="rtl"
            >
              <span class="font-arabic text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                {{ idx.title || idx.name }}
              </span>
              <span class="text-xs text-gray-400 font-sans font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60">
                Hal. {{ idx.page || idx.pg || idx.page_id }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
