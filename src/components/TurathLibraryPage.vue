<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TheNavbar from './TheNavbar.vue';
import { useHead } from '@unhead/vue';
import { searchTurath, POPULAR_RECOMMENDATIONS } from '../lib/turath.js';

useHead({
  title: 'Kitab Teks Digital (Turath) - BacoKitab',
  meta: [
    {
      name: 'description',
      content: 'Cari dan baca ribuan kitab Arab klasik secara langsung berupa teks digital, tanpa file PDF dan siap dianalisa instan.'
    }
  ]
});

const router = useRouter();

const searchQuery = ref('');
const isLoading = ref(false);
const searchResults = ref([]);
const totalCount = ref(0);
const hasSearched = ref(false);
const errorMessage = ref('');

const executeSearch = async (queryToSearch) => {
  const query = (queryToSearch !== undefined ? queryToSearch : searchQuery.value).trim();
  if (!query) return;

  searchQuery.value = query;
  isLoading.value = true;
  errorMessage.value = '';
  hasSearched.value = true;

  try {
    const res = await searchTurath(query);
    searchResults.value = res.uniqueBooks || [];
    totalCount.value = res.count || 0;
  } catch (err) {
    console.error('Error searching Turath:', err);
    errorMessage.value = err.message || 'Gagal mencari kitab dari Turath.';
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleSelectRecommendation = (book) => {
  executeSearch(book.query);
};

const openBook = (bookId, page = 1) => {
  router.push({
    name: 'TurathReader',
    params: { bookId },
    query: { page }
  });
};

onMounted(() => {
  // Lakukan pencarian default awal agar layar tidak kosong
  executeSearch('الآجرومية');
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark">
    <TheNavbar />

    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <!-- Simple Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link
            to="/home"
            class="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300 shadow-sm"
            title="Kembali ke Beranda"
          >
            <span class="material-symbols-outlined block">arrow_back</span>
          </router-link>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Kitab Digital
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Cari dan baca teks digital ribuan kitab Arab klasik secara langsung.
            </p>
          </div>
        </div>

        <router-link
          to="/kitab"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          <span>Pustaka Kitab PDF</span>
        </router-link>
      </div>

      <!-- Search Section -->
      <div class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <form @submit.prevent="executeSearch()" class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <span class="material-symbols-outlined text-xl">search</span>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Ketik judul kitab Arab atau topik (contoh: الآجرومية, رياض الصالحين, نحو)..."
              dir="auto"
              class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="searchQuery = '';"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !searchQuery.trim()"
            class="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="isLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            <span v-else class="material-symbols-outlined text-lg">manage_search</span>
            <span>Cari Kitab</span>
          </button>
        </form>

        <!-- Rekomendasi Kitab Cepat (Chips) -->
        <div class="space-y-3 pt-2">
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">stars</span>
            Rekomendasi Cepat (Klik untuk Mencari)
          </p>

          <div class="space-y-2">
            <div
              v-for="cat in POPULAR_RECOMMENDATIONS"
              :key="cat.category"
              class="flex flex-wrap items-center gap-2"
            >
              <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 min-w-[140px]">
                {{ cat.category }}:
              </span>
              <button
                v-for="b in cat.books"
                :key="b.name"
                type="button"
                @click="handleSelectRecommendation(b)"
                class="px-3 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-800 dark:bg-gray-700/60 dark:hover:bg-amber-900/40 dark:text-gray-200 hover:text-amber-900 dark:hover:text-amber-200 rounded-lg text-xs font-medium transition-colors border border-gray-200 dark:border-gray-700 hover:border-amber-300 flex items-center gap-1"
                :title="b.desc"
              >
                <span class="font-arabic text-sm">{{ b.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hasil Pencarian -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">auto_stories</span>
            Hasil Kitab
            <span v-if="!isLoading && searchResults.length > 0" class="text-xs font-normal text-gray-500">
              ({{ searchResults.length }} kitab ditemukan)
            </span>
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Menghubungi katalog Turath...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl text-center space-y-2">
          <span class="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">error</span>
          <p class="text-sm text-red-700 dark:text-red-300 font-medium">{{ errorMessage }}</p>
          <button
            @click="executeSearch()"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-sm">refresh</span>
            Coba Lagi
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="hasSearched && searchResults.length === 0" class="p-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center space-y-2">
          <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-200">Tidak ada kitab ditemukan</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Coba gunakan kata kunci Arab yang lebih umum atau pilih salah satu rekomendasi cepat di atas.
          </p>
        </div>

        <!-- Cards List -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="item in searchResults"
            :key="item.bookId"
            class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between gap-4 group"
          >
            <div class="space-y-2.5">
              <div class="flex items-start justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-1.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    ID: {{ item.bookId }}
                  </span>
                  <span v-if="item.matchType === 'title'" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[12px]">verified</span>
                    Judul Cocok
                  </span>
                  <span v-else-if="item.matchType === 'author'" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                    Pengarang Cocok
                  </span>
                </div>
                <span v-if="item.vol && item.vol !== '1'" class="text-xs text-gray-400 font-medium">
                  Jilid {{ item.vol }}
                </span>
              </div>

              <!-- Judul Kitab Arab -->
              <h3
                class="font-arabic text-xl font-bold text-gray-900 dark:text-white leading-relaxed group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors"
                dir="rtl"
              >
                {{ item.bookName }}
              </h3>

              <!-- Penulis & Kategori -->
              <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-gray-400">person</span>
                  <span class="font-medium">{{ item.authorName }}</span>
                </div>
                <span v-if="item.category" class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-[11px]">
                  {{ item.category }}
                </span>
              </div>

              <!-- Kutipan Cuplikan Teks -->
              <p
                v-if="item.snip"
                class="text-xs font-arabic text-gray-600 dark:text-gray-300 line-clamp-3 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 leading-loose"
                dir="rtl"
              >
                "{{ item.snip }}"
              </p>
            </div>

            <div class="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <span class="text-[11px] text-gray-400">
                Halaman {{ item.page || 1 }}
              </span>

              <button
                @click="openBook(item.bookId, item.page)"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 group-hover:scale-105 active:scale-95"
              >
                <span class="material-symbols-outlined text-base">chrome_reader_mode</span>
                <span>Buka & Baca</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
