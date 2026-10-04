<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { supabase } from '../lib/supabase';
import VuePdfEmbed from 'vue-pdf-embed';
import 'vue-pdf-embed/dist/styles/annotationLayer.css';
import 'vue-pdf-embed/dist/styles/textLayer.css';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import ResultSection from "./ResultSection.vue";
import { analyzeText } from "../services/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const fileInput = ref(null);
const isUploading = ref(false);
const uploadError = ref(null);
const currentPdfUrl = ref(null);
const currentKitabName = ref("");

// List of kitabs
const kitabList = ref([]);
const isLoadingList = ref(true);

const isLoadingPdf = ref(false);
const pdfContainer = ref(null);

// Interactive features state
const selectedText = ref("");
const showActionBtn = ref(false);
const actionBtnPos = ref({ top: 0, left: 0 });
const isAnalyzing = ref(false);
const result = ref(null);
const showResultModal = ref(false);

const fetchKitabs = async () => {
  isLoadingList.value = true;
  try {
    const { data, error } = await supabase.storage.from('kitabs').list();
    if (error) throw error;
    // Filter out potential empty folders (usually '.emptyFolderPlaceholder')
    kitabList.value = data.filter(f => f.name !== '.emptyFolderPlaceholder');
  } catch (err) {
    console.error('Error fetching kitabs:', err);
  } finally {
    isLoadingList.value = false;
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.type !== 'application/pdf') {
    uploadError.value = 'File must be a PDF';
    return;
  }

  isUploading.value = true;
  uploadError.value = null;

  try {
    const fileExt = file.name.split('.').pop();
    // Gunakan nama asli (hilangkan spasi/karakter aneh) + timestamp agar terbaca enak
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').replace('.pdf', '');
    const fileName = `${safeName}_${Date.now()}.${fileExt}`;
    
    const { error: uploadErrorData } = await supabase.storage
      .from('kitabs')
      .upload(fileName, file);

    if (uploadErrorData) throw uploadErrorData;

    // Refresh list
    await fetchKitabs();
    
    // Auto open
    openKitab(fileName);
  } catch (err) {
    console.error('Error uploading PDF:', err);
    uploadError.value = err.message || 'Gagal mengunggah PDF.';
  } finally {
    isUploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const openKitab = (fileName) => {
  const { data: { publicUrl } } = supabase.storage
    .from('kitabs')
    .getPublicUrl(fileName);

  currentKitabName.value = fileName;
  currentPdfUrl.value = publicUrl;
  isLoadingPdf.value = true;
  showActionBtn.value = false;
};

const closeKitab = () => {
  currentPdfUrl.value = null;
  currentKitabName.value = "";
  showActionBtn.value = false;
};

const handlePdfLoaded = () => {
  isLoadingPdf.value = false;
};

// Handle text selection
const handleSelection = () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    selectedText.value = text;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    actionBtnPos.value = {
      top: rect.top + window.scrollY - 40,
      left: rect.left + window.scrollX + (rect.width / 2) - 60
    };
    showActionBtn.value = true;
  } else {
    showActionBtn.value = false;
  }
};

const handleAnalyzeSelection = async () => {
  if (!selectedText.value) return;
  
  showActionBtn.value = false;
  isAnalyzing.value = true;
  result.value = null;
  showResultModal.value = true;

  try {
    const response = await analyzeText(selectedText.value, true);
    result.value = { ...response, isShort: true };
  } catch (error) {
    alert("Terjadi kesalahan saat menganalisis: " + error.message);
    showResultModal.value = false;
  } finally {
    isAnalyzing.value = false;
  }
};

const closeResultModal = () => {
  showResultModal.value = false;
  setTimeout(() => {
    result.value = null;
  }, 300);
};

const handleGlobalMouseDown = (e) => {
  if (showActionBtn.value && !e.target.closest('#pdf-action-btn') && !e.target.closest('#pdf-reverse-btn')) {
    showActionBtn.value = false;
  }
};

const formatFileName = (name) => {
  // Buang ekstensi
  let niceName = name.replace('.pdf', '');
  // Coba hapus timestamp _17... di belakang jika ada
  niceName = niceName.replace(/_\d{13}$/, '');
  // Ganti underscore dengan spasi
  return niceName.replace(/_/g, ' ');
};

onMounted(() => {
  fetchKitabs();
  document.addEventListener('selectionchange', handleSelection);
  document.addEventListener('mousedown', handleGlobalMouseDown);
});

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelection);
  document.removeEventListener('mousedown', handleGlobalMouseDown);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <TheNavbar />
    
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-8 pb-24 relative">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
          {{ currentPdfUrl ? formatFileName(currentKitabName) : 'Koleksi Kitab' }}
        </h1>
        
        <button v-if="currentPdfUrl" @click="closeKitab" class="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Daftar Kitab
        </button>
        <router-link v-else to="/home" class="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-2">
           <span class="material-symbols-outlined text-[18px]">home</span>
           Beranda
        </router-link>
      </div>

      <!-- Library View -->
      <div v-if="!currentPdfUrl" class="space-y-6">
        <!-- Upload Section -->
        <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-primary/10 space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-primary text-2xl">upload_file</span>
            <h2 class="text-xl font-bold text-[#111814] dark:text-white">Tambahkan Kitab Baru</h2>
          </div>
          
          <div class="flex items-center space-x-4">
            <input
              type="file"
              accept="application/pdf"
              ref="fileInput"
              @change="handleFileUpload"
              :disabled="isUploading"
              class="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
                file:transition-colors file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div v-if="isUploading" class="text-primary text-sm flex items-center space-x-2 bg-primary/5 p-3 rounded-xl w-fit">
            <span class="material-symbols-outlined animate-spin">progress_activity</span>
            <span class="font-medium">Mengunggah Kitab...</span>
          </div>
          
          <div v-if="uploadError" class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2">
            <span class="material-symbols-outlined">error</span>
            {{ uploadError }}
          </div>
        </div>

        <!-- Grid Kitab -->
        <div>
          <h2 class="text-xl font-bold text-[#111814] dark:text-white mb-4">Pilih Kitab Untuk Dibaca</h2>
          
          <div v-if="isLoadingList" class="flex justify-center py-12">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-2">progress_activity</span>
          </div>
          
          <div v-else-if="kitabList.length === 0" class="bg-white/50 dark:bg-gray-900/50 p-12 rounded-2xl border border-primary/20 border-dashed text-center">
            <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">library_books</span>
            <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada koleksi kitab.<br/>Silakan unggah PDF pertama Anda.</p>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="kitab in kitabList" 
              :key="kitab.name"
              @click="openKitab(kitab.name)"
              class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
            >
              <div class="w-16 h-20 bg-primary/10 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform relative overflow-hidden">
                 <div class="absolute inset-y-0 left-2 w-px bg-primary/20"></div>
                 <span class="material-symbols-outlined text-3xl text-primary">menu_book</span>
              </div>
              <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-2" :title="formatFileName(kitab.name)">
                {{ formatFileName(kitab.name) }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF Document</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Viewer Section -->
      <div v-if="currentPdfUrl" class="bg-white dark:bg-gray-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden flex flex-col relative">
        <div class="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md text-primary">
            <span class="material-symbols-outlined text-[14px]">touch_app</span>
            Blok teks Arab untuk opsi terjemah & I'rab
          </div>
          <a :href="currentPdfUrl" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            Tab Baru <span class="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        </div>

        <div v-if="isLoadingPdf" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-2">progress_activity</span>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Memuat Dokumen PDF...</p>
        </div>

        <div ref="pdfContainer" class="w-full overflow-auto bg-gray-100 dark:bg-gray-950 p-2 sm:p-4" style="max-height: 80vh;">
          <VuePdfEmbed
            :source="currentPdfUrl"
            :textLayer="true"
            :annotationLayer="true"
            @loaded="handlePdfLoaded"
            class="pdf-container w-full mx-auto max-w-full bg-white rounded shadow"
          />
        </div>
      </div>

    </main>
    <TheFooter />

    <!-- Action Button (Floating on text selection) -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="transform opacity-0 scale-90 translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-90 translate-y-2"
    >
      <button
        v-if="showActionBtn"
        id="pdf-action-btn"
        @click.stop="handleAnalyzeSelection"
        class="fixed z-50 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-full shadow-lg border border-primary-light flex items-center gap-2 transform active:scale-95 transition-all"
        :style="{ top: `${actionBtnPos.top}px`, left: `${actionBtnPos.left}px` }"
      >
        <span class="material-symbols-outlined text-[18px]">translate</span>
        Terjemah & I'rab
      </button>
    </Transition>

    <!-- Analysis Result Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showResultModal"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div class="bg-gray-50 dark:bg-gray-950 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-primary/10 flex flex-col relative">
          
          <!-- Modal Header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
            <h3 class="font-bold text-[#111814] dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">auto_awesome</span>
              Hasil Analisa
            </h3>
            <button @click="closeResultModal" class="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <!-- Modal Body -->
          <div class="p-4 sm:p-6 overflow-y-auto">
            <div v-if="isAnalyzing" class="flex flex-col items-center justify-center py-12 space-y-4">
              <div class="relative w-16 h-16">
                <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <span class="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary animate-pulse">auto_awesome</span>
              </div>
              <p class="font-medium text-gray-600 dark:text-gray-400">AI sedang menganalisa teks...</p>
              <p class="text-sm text-gray-500 max-w-sm text-center italic" dir="rtl">"{{ selectedText }}"</p>
            </div>
            
            <div v-else-if="result" class="w-full">
              <!-- Reusing ResultSection inside modal -->
              <ResultSection :result="result" />
            </div>
          </div>
          
        </div>
      </div>
    </Transition>
    
  </div>
</template>

<style>
/* Make text layer invisible but selectable */
.textLayer {
  opacity: 0.1; /* slightly visible for debug */
  mix-blend-mode: multiply;
}
.dark .textLayer {
  mix-blend-mode: screen;
}
::selection {
  background: rgba(52, 211, 153, 0.4);
  color: inherit;
}
</style>
