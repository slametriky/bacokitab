<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "pdfjs-dist/web/pdf_viewer.css";
import InputSection from "./InputSection.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api.js";
import {
  user,
  getKitabPdfById,
  saveAnalysisToHistory,
  getUserTokenStats,
} from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const route = useRoute();

// Kitab & Mode State
const isLoading = ref(true);
const kitab = ref(null);
const errorMessage = ref("");

// PDF.js State
let pdfDoc = null; // Non-reactive PDFDocumentProxy for performance
let pdfLoadingTask = null;
const isPdfLoading = ref(false);
const pdfLoadError = ref("");
const currentPage = ref(1);
const totalPages = ref(0);
const pageInput = ref(1);
const scale = ref(1.25);
const isRenderingPage = ref(false);
const canvasRef = ref(null);
const textLayerRef = ref(null);
const pageWrapperRef = ref(null);
const scrollContainerRef = ref(null);
let currentTextLayer = null;
let renderTask = null;

// Region Snip / Area Block (OCR) State
const isSnipMode = ref(false);
const snipAction = ref(null); // 'draw' | 'move' | 'nw' | 'ne' | 'sw' | 'se' | null
const snipRect = ref({ x: 0, y: 0, w: 0, h: 0 });
const snipOrigin = ref({ pointerX: 0, pointerY: 0, rect: { x: 0, y: 0, w: 0, h: 0 } });
const isExtractingOcr = ref(false);

const hasSnipBox = computed(() => snipRect.value.w >= 16 && snipRect.value.h >= 16);
const isTokenLimitReached = computed(() => Boolean(tokenStats.value?.isLimitReached));

const snipBoxStyle = computed(() => ({
  left: `${snipRect.value.x}px`,
  top: `${snipRect.value.y}px`,
  width: `${snipRect.value.w}px`,
  height: `${snipRect.value.h}px`,
}));

// Side / Drawer Analyze Panel State
const isAnalyzeOpen = ref(false);
const isAnalyzing = ref(false);
const analyzeResult = ref(null);
const analyzeError = ref("");
const tokenStats = ref(null);
const inputSectionRef = ref(null);

useHead(() => ({
  title: kitab.value ? `${kitab.value.title} - BacoKitab` : "Baca Kitab PDF - BacoKitab",
}));

// ==========================================
// DATA FETCHING
// ==========================================
const fetchKitab = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const data = await getKitabPdfById(route.params.id);
    if (!data) {
      errorMessage.value = "Kitab tidak ditemukan atau bersifat privat.";
    } else {
      kitab.value = data;
      await loadPdfWithPdfJs(data.pdf_url);
    }
  } catch (err) {
    errorMessage.value = err.message || "Gagal memuat data kitab.";
  } finally {
    isLoading.value = false;
  }
};

const refreshTokenStats = async () => {
  if (user.value?.id) {
    tokenStats.value = await getUserTokenStats();
  } else {
    tokenStats.value = null;
  }
};

// ==========================================
// PDF.JS LOADING & RENDERING
// ==========================================
const cleanupPdf = async () => {
  if (renderTask) {
    try { renderTask.cancel(); } catch {}
    renderTask = null;
  }
  if (currentTextLayer) {
    try { currentTextLayer.cancel(); } catch {}
    currentTextLayer = null;
  }
  if (pdfDoc && typeof pdfDoc.cleanup === "function") {
    try { await pdfDoc.cleanup(); } catch {}
  }
  pdfDoc = null;
  if (pdfLoadingTask && typeof pdfLoadingTask.destroy === "function") {
    try { await pdfLoadingTask.destroy(); } catch {}
  }
  pdfLoadingTask = null;
};

const loadPdfWithPdfJs = async (rawUrl) => {
  isPdfLoading.value = true;
  pdfLoadError.value = "";

  try {
    await cleanupPdf();

    const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(rawUrl)}`;
    pdfLoadingTask = pdfjsLib.getDocument({
      url: proxyUrl,
      withCredentials: false,
    });

    pdfDoc = await pdfLoadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    currentPage.value = 1;
    pageInput.value = 1;

    await nextTick();
    await fitToWidth(1, false);
    await renderPage(1);
  } catch (err) {
    console.warn("PDF.js gagal memuat via proxy:", err);
    pdfLoadError.value =
      err?.message || "Gagal memuat file PDF dari tautan tersebut.";
  } finally {
    isPdfLoading.value = false;
  }
};

const renderPage = async (pageNum) => {
  if (!pdfDoc || !canvasRef.value || !textLayerRef.value) return;

  isRenderingPage.value = true;
  snipRect.value = { x: 0, y: 0, w: 0, h: 0 };
  snipAction.value = null;

  try {
    if (renderTask) {
      renderTask.cancel();
      renderTask = null;
    }
    if (currentTextLayer) {
      currentTextLayer.cancel();
      currentTextLayer = null;
    }

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale.value });
    const dpr = window.devicePixelRatio || 1;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    renderTask = page.render({
      canvasContext: ctx,
      viewport,
    });
    await renderTask.promise;
    renderTask = null;

    // Render selectable text layer on top of canvas
    const textLayerEl = textLayerRef.value;
    textLayerEl.innerHTML = "";
    textLayerEl.style.width = `${Math.floor(viewport.width)}px`;
    textLayerEl.style.height = `${Math.floor(viewport.height)}px`;

    const textContent = await page.getTextContent();
    currentTextLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayerEl,
      viewport,
    });
    await currentTextLayer.render();
  } catch (err) {
    if (err?.name !== "RenderingCancelledException") {
      console.error("Render page error:", err);
    }
  } finally {
    isRenderingPage.value = false;
  }
};

const goToPage = async (num) => {
  if (pageJumpTimer) {
    clearTimeout(pageJumpTimer);
    pageJumpTimer = null;
  }
  const parsed = parseInt(String(num).replace(/\D/g, ""), 10);
  const target = Math.max(1, Math.min(totalPages.value, parsed || 1));
  currentPage.value = target;
  pageInput.value = target;
  await renderPage(target);
};

let pageJumpTimer = null;
const handlePageInput = () => {
  if (pageJumpTimer) clearTimeout(pageJumpTimer);
  const raw = String(pageInput.value || "").replace(/\D/g, "");
  if (!raw) return;
  pageJumpTimer = setTimeout(() => {
    const parsed = parseInt(raw, 10);
    if (parsed >= 1 && parsed <= totalPages.value && parsed !== currentPage.value) {
      goToPage(parsed);
    }
  }, 600);
};

const commitPageInput = () => {
  const raw = String(pageInput.value || "").replace(/\D/g, "");
  if (!raw) {
    pageInput.value = currentPage.value;
    return;
  }
  goToPage(raw);
};

const fitToWidth = async (pageNum = currentPage.value, shouldRender = true) => {
  if (!pdfDoc || !scrollContainerRef.value) return;
  try {
    const page = await pdfDoc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const containerWidth = scrollContainerRef.value.clientWidth;
    const padding = window.innerWidth < 640 ? 24 : 48;
    const targetScale = (containerWidth - padding) / unscaledViewport.width;
    scale.value = Math.max(0.4, Math.min(1.25, Number(targetScale.toFixed(2))));
    if (shouldRender) {
      await renderPage(pageNum);
    }
  } catch {
    // keep current scale
  }
};

const zoomIn = async () => {
  scale.value = Math.min(2.5, Number((scale.value + 0.2).toFixed(2)));
  await renderPage(currentPage.value);
};

const zoomOut = async () => {
  scale.value = Math.max(0.4, Number((scale.value - 0.2).toFixed(2)));
  await renderPage(currentPage.value);
};

// ==========================================
// REGION SNIP ("BLOK AREA OCR LANGSUNG")
// ==========================================
const clearSnipBox = () => {
  snipRect.value = { x: 0, y: 0, w: 0, h: 0 };
  snipAction.value = null;
};

const toggleSnipMode = () => {
  if (!isSnipMode.value && isTokenLimitReached.value) {
    handleLimitReached();
    isAnalyzeOpen.value = true;
    return;
  }
  isSnipMode.value = !isSnipMode.value;
  clearSnipBox();
  window.getSelection()?.removeAllRanges();
};

const getRelativeCoords = (event) => {
  const rect = pageWrapperRef.value.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
    y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    maxW: rect.width,
    maxH: rect.height,
  };
};

const onSnipPointerDown = (event) => {
  if (!isSnipMode.value || !pageWrapperRef.value) return;
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  const pos = getRelativeCoords(event);
  snipAction.value = "draw";
  snipOrigin.value = {
    pointerX: pos.x,
    pointerY: pos.y,
    rect: { x: pos.x, y: pos.y, w: 0, h: 0 },
  };
  snipRect.value = { x: pos.x, y: pos.y, w: 0, h: 0 };
};

const startSnipEdit = (action, event) => {
  if (!isSnipMode.value || !pageWrapperRef.value) return;
  event.preventDefault();
  event.stopPropagation();
  pageWrapperRef.value.setPointerCapture(event.pointerId);
  const pos = getRelativeCoords(event);
  snipAction.value = action;
  snipOrigin.value = {
    pointerX: pos.x,
    pointerY: pos.y,
    rect: { ...snipRect.value },
  };
};

const onSnipPointerMove = (event) => {
  if (!snipAction.value || !pageWrapperRef.value) return;
  const pos = getRelativeCoords(event);
  const { pointerX, pointerY, rect: orig } = snipOrigin.value;
  const dx = pos.x - pointerX;
  const dy = pos.y - pointerY;
  const minSize = 20;

  if (snipAction.value === "draw") {
    snipRect.value = {
      x: Math.min(pointerX, pos.x),
      y: Math.min(pointerY, pos.y),
      w: Math.abs(pos.x - pointerX),
      h: Math.abs(pos.y - pointerY),
    };
  } else if (snipAction.value === "move") {
    snipRect.value = {
      x: Math.max(0, Math.min(pos.maxW - orig.w, orig.x + dx)),
      y: Math.max(0, Math.min(pos.maxH - orig.h, orig.y + dy)),
      w: orig.w,
      h: orig.h,
    };
  } else {
    let { x, y, w, h } = orig;
    if (snipAction.value.includes("w")) {
      const newX = Math.max(0, Math.min(orig.x + orig.w - minSize, orig.x + dx));
      w = orig.x + orig.w - newX;
      x = newX;
    }
    if (snipAction.value.includes("e")) {
      w = Math.max(minSize, Math.min(pos.maxW - orig.x, orig.w + dx));
    }
    if (snipAction.value.includes("n")) {
      const newY = Math.max(0, Math.min(orig.y + orig.h - minSize, orig.y + dy));
      h = orig.y + orig.h - newY;
      y = newY;
    }
    if (snipAction.value.includes("s")) {
      h = Math.max(minSize, Math.min(pos.maxH - orig.y, orig.h + dy));
    }
    snipRect.value = { x, y, w, h };
  }
};

const onSnipPointerUp = () => {
  if (!snipAction.value) return;
  snipAction.value = null;
  if (!hasSnipBox.value) {
    clearSnipBox();
  }
};

const confirmSnipOcr = () => {
  if (isTokenLimitReached.value) {
    isSnipMode.value = false;
    clearSnipBox();
    handleLimitReached();
    isAnalyzeOpen.value = true;
    return;
  }
  if (!hasSnipBox.value || !canvasRef.value) return;
  const { x, y, w, h } = snipRect.value;

  isExtractingOcr.value = true;
  const sourceCanvas = canvasRef.value;
  const rect = sourceCanvas.getBoundingClientRect();
  const scaleX = sourceCanvas.width / rect.width;
  const scaleY = sourceCanvas.height / rect.height;

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = Math.floor(w * scaleX);
  cropCanvas.height = Math.floor(h * scaleY);
  const cropCtx = cropCanvas.getContext("2d");

  cropCtx.drawImage(
    sourceCanvas,
    Math.floor(x * scaleX),
    Math.floor(y * scaleY),
    Math.floor(w * scaleX),
    Math.floor(h * scaleY),
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  cropCanvas.toBlob(
    async (blob) => {
      try {
        if (!blob) return;
        const file = new File([blob], "kitab-snip.jpg", { type: "image/jpeg" });
        isSnipMode.value = false;
        clearSnipBox();
        isAnalyzeOpen.value = true;
        await nextTick();
        if (inputSectionRef.value) {
          await inputSectionRef.value.runOcrFile(file);
        }
      } finally {
        isExtractingOcr.value = false;
      }
    },
    "image/jpeg",
    0.95
  );
};

// ==========================================
// ANALYZE HANDLERS
// ==========================================
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
    "Limit token harian Anda sudah habis. Silakan tunggu reset harian atau upgrade ke Token Premium melalui halaman Analisa.";
};

onMounted(() => {
  fetchKitab();
  refreshTokenStats();
});

onUnmounted(() => {
  cleanupPdf();
});

watch(
  () => user.value?.id,
  () => {
    refreshTokenStats();
  }
);
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-background-dark overflow-hidden">
    <!-- Top Reader Toolbar -->
    <header class="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-3 sm:px-5 py-2.5 z-30">
      <div class="max-w-full mx-auto flex flex-wrap items-center justify-between gap-2">
        <!-- Left: Back + Title -->
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <router-link
            to="/kitab"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300 flex-shrink-0"
            title="Kembali ke Pustaka Kitab"
          >
            <span class="material-symbols-outlined block text-[22px]">arrow_back</span>
          </router-link>

          <div v-if="kitab" class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h1
                class="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate"
                dir="auto"
              >
                {{ kitab.title }}
              </h1>
              <span class="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                {{ kitab.theme }}
              </span>
            </div>
            <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate" dir="auto">
              {{ kitab.author }}
              <span class="mx-1">•</span>
              <span>{{ kitab.is_public ? "Publik" : "Privat" }}</span>
            </p>
          </div>
          <div v-else class="text-sm font-bold text-gray-900 dark:text-white">
            Baca Kitab PDF
          </div>
        </div>

        <!-- Right Controls -->
        <div v-if="kitab" class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <!-- Snip Area OCR Button -->
          <button
            v-if="!isPdfLoading && totalPages > 0"
            @click="toggleSnipMode"
            :disabled="isTokenLimitReached"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl transition-all shadow-sm border disabled:opacity-50 disabled:cursor-not-allowed',
              isSnipMode
                ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
            :title="isTokenLimitReached ? 'Limit token habis. Tidak dapat menggunakan Blok Area (OCR).' : 'Tarik kotak di atas teks Arab (terutama PDF hasil scan) untuk mengekstrak teks ke input OCR'"
          >
            <span class="material-symbols-outlined text-[17px]">crop</span>
            <span class="hidden sm:inline">{{ isTokenLimitReached ? "Token Habis" : isSnipMode ? "Batal Blok Area" : "Blok Area (OCR)" }}</span>
          </button>

          <!-- Analyze Panel Toggle Button -->
          <button
            @click="isAnalyzeOpen = !isAnalyzeOpen"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl transition-all shadow-sm border',
              isAnalyzeOpen
                ? 'bg-primary text-white border-primary hover:bg-primary/90'
                : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
            ]"
            title="Buka/Tutup Panel Analisa I'rab"
          >
            <span class="material-symbols-outlined text-[17px]">analytics</span>
            <span>{{ isAnalyzeOpen ? "Tutup Analisa" : "Analisa I'rab" }}</span>
          </button>

          <a
            :href="kitab.pdf_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            title="Buka PDF di Tab Baru"
          >
            <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            <span class="hidden md:inline">Buka Asli</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Split Area -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Left: PDF Viewport -->
      <div class="flex-1 relative flex flex-col overflow-hidden bg-gray-200/80 dark:bg-gray-900 min-w-0">
        <!-- Loading Kitab Metadata -->
        <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-6">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Menyiapkan kitab...</p>
        </div>

        <!-- Error / Not Found -->
        <div v-else-if="errorMessage || !kitab" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-4xl">menu_book</span>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Tidak Dapat Membuka Kitab</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            {{ errorMessage || "Link PDF tidak valid." }}
          </p>
          <router-link
            to="/kitab"
            class="mt-5 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Kembali ke Pustaka Kitab
          </router-link>
        </div>

        <!-- PDF.JS DIRECT RENDERER -->
        <template v-else>
          <!-- Loading PDF Bytes Overlay -->
          <div v-if="isPdfLoading" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">Mengunduh & merender halaman PDF...</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sedang menyiapkan halaman kitab.
            </p>
          </div>

          <!-- PDF Load Error State -->
          <div v-else-if="pdfLoadError" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div class="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Gagal Memuat PDF Langsung</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              {{ pdfLoadError }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 mt-5">
              <button
                @click="loadPdfWithPdfJs(kitab.pdf_url)"
                class="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[18px]">refresh</span>
                Coba Muat Ulang
              </button>
              <a
                :href="kitab.pdf_url"
                target="_blank"
                rel="noopener noreferrer"
                class="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                Buka Tab Baru
              </a>
            </div>
          </div>

          <template v-else>
            <!-- Snip Mode Instruction Banner -->
            <div
              v-if="isSnipMode"
              class="flex-shrink-0 bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between gap-2 z-20 shadow"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">crop</span>
                <span>Mode Blok Area aktif: Tarik/seret kotak di atas paragraf Arab untuk mengekstrak teks (OCR) ke kotak input.</span>
              </div>
              <button @click="toggleSnipMode" class="underline hover:opacity-80 whitespace-nowrap">Batal</button>
            </div>

            <!-- Scrollable Page Container -->
            <div
              ref="scrollContainerRef"
              class="flex-1 overflow-auto p-3 sm:p-6 flex items-start"
            >
              <div
                ref="pageWrapperRef"
                class="relative mx-auto bg-white shadow-xl border border-gray-300 dark:border-gray-700 select-text"
                :class="{ 'cursor-crosshair select-none touch-none': isSnipMode }"
                :style="{ '--scale-factor': scale }"
                @pointerdown="onSnipPointerDown"
                @pointermove="onSnipPointerMove"
                @pointerup="onSnipPointerUp"
              >
                <canvas ref="canvasRef" class="block"></canvas>
                <div ref="textLayerRef" class="textLayer"></div>

                <!-- Editable Snip Rectangle Overlay -->
                <div
                  v-if="isSnipMode && (snipAction === 'draw' || hasSnipBox)"
                  class="absolute border-2 border-emerald-500 bg-emerald-500/15 z-30 cursor-move touch-none"
                  :style="snipBoxStyle"
                  @pointerdown="startSnipEdit('move', $event)"
                >
                  <!-- 4 Corner Resize Handles -->
                  <button
                    type="button"
                    aria-label="Ubah ukuran kiri atas"
                    class="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nwse-resize shadow touch-none"
                    @pointerdown="startSnipEdit('nw', $event)"
                  ></button>
                  <button
                    type="button"
                    aria-label="Ubah ukuran kanan atas"
                    class="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nesw-resize shadow touch-none"
                    @pointerdown="startSnipEdit('ne', $event)"
                  ></button>
                  <button
                    type="button"
                    aria-label="Ubah ukuran kiri bawah"
                    class="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nesw-resize shadow touch-none"
                    @pointerdown="startSnipEdit('sw', $event)"
                  ></button>
                  <button
                    type="button"
                    aria-label="Ubah ukuran kanan bawah"
                    class="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-600 rounded-full cursor-nwse-resize shadow touch-none"
                    @pointerdown="startSnipEdit('se', $event)"
                  ></button>
                </div>
              </div>
            </div>

            <!-- Floating Confirm / Edit Crop Action Bar -->
            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="isSnipMode && hasSnipBox && !snipAction"
                class="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 bg-[#2e200f] text-white px-3 py-2 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2 max-w-[94vw]"
              >
                <span class="hidden sm:inline text-xs text-amber-200 font-medium whitespace-nowrap">
                  Sesuaikan kotak lalu:
                </span>
                <button
                  @click="confirmSnipOcr"
                  :disabled="isExtractingOcr"
                  class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-sm disabled:opacity-50"
                >
                  <span v-if="isExtractingOcr" class="material-symbols-outlined animate-spin text-[15px]">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>{{ isExtractingOcr ? "Memproses..." : "Pilih & Ekstrak Teks" }}</span>
                </button>
                <button
                  @click="clearSnipBox"
                  class="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl whitespace-nowrap"
                >
                  Ulangi
                </button>
                <button
                  @click="toggleSnipMode"
                  class="px-2.5 py-1.5 bg-white/10 hover:bg-red-500/30 text-white text-xs font-semibold rounded-xl whitespace-nowrap"
                >
                  Batal
                </button>
              </div>
            </Transition>

            <!-- Bottom Page & Zoom Bar -->
            <div class="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-5 py-2 flex items-center justify-between gap-2 text-xs">
              <!-- Page Controls -->
              <div class="flex items-center gap-1.5">
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage <= 1 || isRenderingPage"
                  class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                  title="Halaman Sebelumnya"
                >
                  <span class="material-symbols-outlined block text-[18px]">chevron_left</span>
                </button>

                <form @submit.prevent="commitPageInput" class="flex items-center gap-1.5">
                  <input
                    type="text"
                    inputmode="numeric"
                    enterkeyhint="go"
                    v-model="pageInput"
                    @input="handlePageInput"
                    @blur="commitPageInput"
                    @focus="$event.target.select()"
                    class="w-14 sm:w-16 px-1.5 py-1 text-center text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    aria-label="Nomor halaman"
                  />
                  <span class="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">/ {{ totalPages }}</span>
                </form>

                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage >= totalPages || isRenderingPage"
                  class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                  title="Halaman Berikutnya"
                >
                  <span class="material-symbols-outlined block text-[18px]">chevron_right</span>
                </button>
              </div>

              <!-- Zoom Controls -->
              <div class="flex items-center gap-1">
                <button
                  @click="fitToWidth()"
                  :disabled="isRenderingPage"
                  class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                  title="Sesuaikan Lebar Layar"
                >
                  <span class="material-symbols-outlined block text-[18px]">fit_screen</span>
                </button>
                <button
                  @click="zoomOut"
                  :disabled="scale <= 0.4 || isRenderingPage"
                  class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                  title="Perkecil"
                >
                  <span class="material-symbols-outlined block text-[18px]">zoom_out</span>
                </button>
                <span class="w-11 text-center font-bold text-gray-900 dark:text-white">
                  {{ Math.round(scale * 100) }}%
                </span>
                <button
                  @click="zoomIn"
                  :disabled="scale >= 2.5 || isRenderingPage"
                  class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                  title="Perbesar"
                >
                  <span class="material-symbols-outlined block text-[18px]">zoom_in</span>
                </button>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Mobile Drawer Backdrop -->
      <div
        v-if="kitab && isAnalyzeOpen"
        @click="isAnalyzeOpen = false"
        class="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
      ></div>

      <!-- Unified Responsive Analyze Panel (Desktop Side Panel / Mobile Bottom Drawer) -->
      <aside
        v-show="kitab && isAnalyzeOpen"
        class="fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t shadow-2xl z-40 flex flex-col bg-gray-50 dark:bg-background-dark border-gray-200 dark:border-gray-700 lg:static lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none lg:w-[460px] xl:w-[520px] flex-shrink-0 overflow-hidden"
      >
        <!-- Mobile Drawer Header -->
        <div class="flex lg:hidden items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">analytics</span>
            <h2 class="font-bold text-sm text-gray-900 dark:text-white">
              Analisa I'rab & OCR
            </h2>
          </div>
          <button
            @click="isAnalyzeOpen = false"
            class="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span class="material-symbols-outlined block text-[20px]">close</span>
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
  </div>
</template>
