<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark">
    <TheNavbar />
    
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
      <div class="flex items-center gap-4 mb-8">
        <router-link
          to="/"
          class="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Log Transaksi Token</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Riwayat penggunaan token Anda</p>
        </div>
      </div>

      <!-- Token Stats Summary -->
      <div v-if="tokenStats" class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary" v-if="tokenStats.isPremium">workspace_premium</span>
            <span>Tipe Akun: {{ tokenStats.isPremium ? 'Premium' : 'Free' }}</span>
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span v-if="tokenStats.isPremium">Total Token: {{ tokenStats.limit.toLocaleString('id-ID') }} Total</span>
            <span v-else>Batas Harian: {{ tokenStats.limit.toLocaleString('id-ID') }} per hari</span>
          </p>
        </div>
        <div class="bg-primary/10 px-4 py-2 rounded-xl text-primary font-bold text-lg border border-primary/20">
          <span class="text-sm font-medium mr-2">Sisa Token:</span>
          {{ tokenStats.remaining.toLocaleString('id-ID') }}
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="mb-4 flex flex-col sm:flex-row items-center justify-end gap-4">
        <div class="flex items-center gap-2 w-full sm:w-auto bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <label for="dateFilter" class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Filter Tanggal:</label>
          <input 
            type="date" 
            id="dateFilter" 
            v-model="dateFilter" 
            @change="handleFilterChange"
            class="px-2 py-1 border-none bg-transparent text-sm text-gray-900 dark:text-white focus:ring-0 outline-none w-full sm:w-auto"
          />
          <button 
            v-if="dateFilter"
            @click="clearFilter"
            class="p-1 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Hapus Filter"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <!-- Transaction List -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-2">progress_activity</span>
          <p>Memuat data transaksi...</p>
        </div>
        
        <div v-else-if="transactions.length === 0" class="p-12 text-center flex flex-col items-center">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-gray-400 text-3xl">receipt_long</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {{ dateFilter ? 'Tidak ada transaksi' : 'Belum ada transaksi' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            {{ dateFilter ? 'Tidak ditemukan transaksi pada tanggal yang dipilih.' : 'Anda belum pernah menggunakan token untuk fitur apapun.' }}
          </p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th class="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
                <th class="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Jenis</th>
                <th class="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Detail</th>
                <th class="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Jumlah Token</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="tx in transactions" 
                :key="tx.id"
                class="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td class="py-4 px-6 text-sm text-gray-900 dark:text-gray-200">
                  <div class="font-medium">{{ formatDate(tx.created_at) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(tx.created_at) }}</div>
                </td>
                <td class="py-4 px-6 text-sm">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <span class="material-symbols-outlined text-[14px]">
                      {{ getFeatureIcon(tx.feature) }}
                    </span>
                    {{ formatFeature(tx.feature) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                  <div class="truncate max-w-[200px] md:max-w-xs" :title="formatMetadata(tx.metadata)">
                    {{ formatMetadata(tx.metadata) || '-' }}
                  </div>
                </td>
                <td class="py-4 px-6 text-sm font-bold text-red-500 text-right">
                  -{{ (tx.total_tokens || 0).toLocaleString('id-ID') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1 && !isLoading" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Menampilkan <span class="font-bold text-gray-900 dark:text-white">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> - 
          <span class="font-bold text-gray-900 dark:text-white">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> 
          dari <span class="font-bold text-gray-900 dark:text-white">{{ totalItems }}</span> transaksi
        </span>
        
        <div class="flex items-center gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="p-2 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center"
            title="Halaman Sebelumnya"
          >
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          
          <div class="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Halaman {{ currentPage }} / {{ totalPages }}
          </div>

          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="p-2 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center justify-center"
            title="Halaman Selanjutnya"
          >
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase, getUserTokenStats } from '../lib/supabase.js';
import TheNavbar from './TheNavbar.vue';

const isLoading = ref(true);
const transactions = ref([]);
const tokenStats = ref(null);

// Pagination & Filter state
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);
const dateFilter = ref('');

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage) || 1;
});

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    tokenStats.value = await getUserTokenStats();
  }
  await fetchTransactions();
});

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchTransactions();
};

const clearFilter = () => {
  dateFilter.value = '';
  currentPage.value = 1;
  fetchTransactions();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchTransactions();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchTransactions();
  }
};

const fetchTransactions = async () => {
  isLoading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('user_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply date filter
    if (dateFilter.value) {
      const startOfDay = new Date(dateFilter.value);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateFilter.value);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    // Apply pagination
    const from = (currentPage.value - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;
    
    transactions.value = data || [];
    totalItems.value = count || 0;
  } catch (error) {
    console.error('Error fetching transactions:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFeature = (feature) => {
  if (!feature) return 'Analisa';
  if (feature.toLowerCase() === 'ocr') return 'OCR Gambar';
  if (feature.toLowerCase() === 'analyze') return 'Analisa Kalimat';
  return feature;
};

const getFeatureIcon = (feature) => {
  if (!feature) return 'analytics';
  if (feature.toLowerCase() === 'ocr') return 'photo_camera';
  if (feature.toLowerCase() === 'analyze') return 'text_snippet';
  return 'analytics';
};

const formatMetadata = (metadata) => {
  if (!metadata) return '';
  if (typeof metadata === 'string') return metadata;
  if (metadata.text) return metadata.text;
  try {
    return JSON.stringify(metadata);
  } catch(e) {
    return 'Data';
  }
};
</script>
