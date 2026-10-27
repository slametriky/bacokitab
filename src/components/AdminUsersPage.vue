<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import TheNavbar from "./TheNavbar.vue";
import {
  isAdmin,
  getAdminUsersList,
  adminUpdateUser,
  getAdminReviewsList,
  adminToggleReviewVisibility,
  getAdminTransactionsList,
} from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

useHead({
  title: "Panel Admin - BacoKitab",
});

const route = useRoute();
const router = useRouter();

// Active Tab: 'users' | 'reviews' | 'transactions'
const activeTab = ref(route.query.tab || "users");

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ["users", "reviews", "transactions"].includes(newTab)) {
      activeTab.value = newTab;
    }
  }
);

const setTab = (tab) => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
  if (tab === "users" && users.value.length === 0) fetchUsers();
  if (tab === "reviews" && reviews.value.length === 0) fetchReviews();
  if (tab === "transactions" && transactions.value.length === 0) fetchTransactions();
};

// Global Toast Notification
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success"); // 'success' | 'error'
let toastTimeout = null;

const triggerToast = (msg, type = "success") => {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = msg;
  toastType.value = type;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// ==========================================
// 1. TAB PENGGUNA (USERS)
// ==========================================
const isUsersLoading = ref(false);
const isUserUpdating = ref(false);
const users = ref([]);
const userStats = ref({ total_users: 0, premium_users: 0, admin_users: 0 });
const usersFilteredCount = ref(0);
const usersSearch = ref("");
const usersFilter = ref("all"); // 'all' | 'free' | 'premium' | 'admin'
const usersPage = ref(1);
const usersPageSize = ref(20);

// Modal Edit User
const isUserModalOpen = ref(false);
const selectedUser = ref(null);
const userEditForm = ref({
  plan_type: "free",
  is_admin: false,
  max_premium_tokens: 0,
  daily_token_limit: 10000,
});

const fetchUsers = async () => {
  isUsersLoading.value = true;
  try {
    const offset = (usersPage.value - 1) * usersPageSize.value;
    const res = await getAdminUsersList(
      usersSearch.value.trim(),
      usersFilter.value,
      usersPageSize.value,
      offset
    );
    if (res) {
      users.value = res.users || [];
      userStats.value = res.stats || { total_users: 0, premium_users: 0, admin_users: 0 };
      usersFilteredCount.value = res.filtered_count || 0;
    }
  } catch (err) {
    console.error("Gagal memuat pengguna:", err);
    triggerToast("Gagal memuat daftar pengguna: " + (err.message || err), "error");
  } finally {
    isUsersLoading.value = false;
  }
};

let usersSearchTimer = null;
const handleUsersSearch = () => {
  if (usersSearchTimer) clearTimeout(usersSearchTimer);
  usersSearchTimer = setTimeout(() => {
    usersPage.value = 1;
    fetchUsers();
  }, 400);
};

const handleUsersFilterChange = (filter) => {
  usersFilter.value = filter;
  usersPage.value = 1;
  fetchUsers();
};

const usersTotalPages = computed(() => {
  return Math.ceil(usersFilteredCount.value / usersPageSize.value) || 1;
});

const openEditUserModal = (u) => {
  selectedUser.value = u;
  userEditForm.value = {
    plan_type: u.plan_type || "free",
    is_admin: !!u.is_admin,
    max_premium_tokens: u.max_premium_tokens || 0,
    daily_token_limit: u.daily_token_limit || 10000,
  };
  isUserModalOpen.value = true;
};

const saveUserEdit = async () => {
  if (!selectedUser.value) return;
  isUserUpdating.value = true;
  try {
    await adminUpdateUser(selectedUser.value.id, {
      plan_type: userEditForm.value.plan_type,
      is_admin: userEditForm.value.is_admin,
      max_premium_tokens: Number(userEditForm.value.max_premium_tokens),
      daily_token_limit: Number(userEditForm.value.daily_token_limit),
    });
    triggerToast(`Data pengguna ${selectedUser.value.email} berhasil diperbarui!`, "success");
    isUserModalOpen.value = false;
    await fetchUsers();
  } catch (err) {
    triggerToast("Gagal update pengguna: " + (err.message || err), "error");
  } finally {
    isUserUpdating.value = false;
  }
};

// ==========================================
// 2. TAB ULASAN (REVIEWS)
// ==========================================
const isReviewsLoading = ref(false);
const reviews = ref([]);
const reviewStats = ref({ total_reviews: 0, visible_reviews: 0, hidden_reviews: 0 });
const reviewsFilteredCount = ref(0);
const reviewsSearch = ref("");
const reviewsStatus = ref("all"); // 'all' | 'visible' | 'hidden'
const reviewsPage = ref(1);
const reviewsPageSize = ref(20);
const updatingReviewId = ref(null);

const fetchReviews = async () => {
  isReviewsLoading.value = true;
  try {
    const offset = (reviewsPage.value - 1) * reviewsPageSize.value;
    const res = await getAdminReviewsList(
      reviewsSearch.value.trim(),
      reviewsStatus.value,
      reviewsPageSize.value,
      offset
    );
    if (res) {
      reviews.value = res.reviews || [];
      reviewStats.value = res.stats || { total_reviews: 0, visible_reviews: 0, hidden_reviews: 0 };
      reviewsFilteredCount.value = res.filtered_count || 0;
    }
  } catch (err) {
    console.error("Gagal memuat ulasan:", err);
    triggerToast("Gagal memuat daftar ulasan: " + (err.message || err), "error");
  } finally {
    isReviewsLoading.value = false;
  }
};

let reviewsSearchTimer = null;
const handleReviewsSearch = () => {
  if (reviewsSearchTimer) clearTimeout(reviewsSearchTimer);
  reviewsSearchTimer = setTimeout(() => {
    reviewsPage.value = 1;
    fetchReviews();
  }, 400);
};

const handleReviewsStatusChange = (status) => {
  reviewsStatus.value = status;
  reviewsPage.value = 1;
  fetchReviews();
};

const reviewsTotalPages = computed(() => {
  return Math.ceil(reviewsFilteredCount.value / reviewsPageSize.value) || 1;
});

const toggleReviewVisibility = async (r) => {
  updatingReviewId.value = r.id;
  const newVisibility = !r.is_visible;
  try {
    await adminToggleReviewVisibility(r.id, newVisibility);
    r.is_visible = newVisibility;
    if (newVisibility) {
      reviewStats.value.visible_reviews++;
      reviewStats.value.hidden_reviews = Math.max(0, reviewStats.value.hidden_reviews - 1);
      triggerToast("Ulasan berhasil dipublikasikan ke Landing Page!", "success");
    } else {
      reviewStats.value.visible_reviews = Math.max(0, reviewStats.value.visible_reviews - 1);
      reviewStats.value.hidden_reviews++;
      triggerToast("Ulasan disembunyikan dari Landing Page.", "success");
    }
  } catch (err) {
    triggerToast("Gagal mengubah visibilitas ulasan: " + (err.message || err), "error");
  } finally {
    updatingReviewId.value = null;
  }
};

// ==========================================
// 3. TAB TRANSAKSI (TRANSACTIONS / TOKENS)
// ==========================================
const isTxLoading = ref(false);
const transactions = ref([]);
const txStats = ref({
  total_transactions: 0,
  total_tokens: 0,
  today_transactions: 0,
  today_tokens: 0,
});
const txFilteredCount = ref(0);
const txSearch = ref("");
const txFeature = ref("all");
const txDate = ref("");
const txPage = ref(1);
const txPageSize = ref(20);

// Modal Detail Metadata Transaksi
const selectedTx = ref(null);
const isTxModalOpen = ref(false);

const fetchTransactions = async () => {
  isTxLoading.value = true;
  try {
    const offset = (txPage.value - 1) * txPageSize.value;
    const res = await getAdminTransactionsList(
      txSearch.value.trim(),
      txFeature.value,
      txDate.value,
      txPageSize.value,
      offset
    );
    if (res) {
      transactions.value = res.transactions || [];
      txStats.value = res.stats || {
        total_transactions: 0,
        total_tokens: 0,
        today_transactions: 0,
        today_tokens: 0,
      };
      txFilteredCount.value = res.filtered_count || 0;
    }
  } catch (err) {
    console.error("Gagal memuat transaksi:", err);
    triggerToast("Gagal memuat daftar transaksi: " + (err.message || err), "error");
  } finally {
    isTxLoading.value = false;
  }
};

let txSearchTimer = null;
const handleTxSearch = () => {
  if (txSearchTimer) clearTimeout(txSearchTimer);
  txSearchTimer = setTimeout(() => {
    txPage.value = 1;
    fetchTransactions();
  }, 400);
};

const handleTxFeatureChange = (f) => {
  txFeature.value = f;
  txPage.value = 1;
  fetchTransactions();
};

const handleTxDateChange = () => {
  txPage.value = 1;
  fetchTransactions();
};

const clearTxDate = () => {
  txDate.value = "";
  txPage.value = 1;
  fetchTransactions();
};

const txTotalPages = computed(() => {
  return Math.ceil(txFilteredCount.value / txPageSize.value) || 1;
});

const openTxDetailModal = (tx) => {
  selectedTx.value = tx;
  isTxModalOpen.value = true;
};

// Utilities
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  triggerToast("ID disalin ke clipboard!");
};

const formatDate = (isoString) => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoString;
  }
};

const getFeatureBadgeClass = (f) => {
  const feat = (f || "").toLowerCase();
  if (feat.includes("analis")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  if (feat.includes("ocr") || feat.includes("foto")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (feat.includes("chat")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
  if (feat.includes("tashrif")) return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
};

onMounted(() => {
  if (activeTab.value === "reviews") {
    fetchReviews();
  } else if (activeTab.value === "transactions") {
    fetchTransactions();
  } else {
    fetchUsers();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark">
    <TheNavbar />

    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <router-link
            to="/home"
            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-400"
            title="Kembali ke Beranda"
          >
            <span class="material-symbols-outlined block">arrow_back</span>
          </router-link>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Panel Administrator
              </h1>
              <span class="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                Admin
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Kelola data pengguna terdaftar, pantau ulasan & testimoni, serta pantau pemakaian token.
            </p>
          </div>
        </div>

        <button
          @click="
            activeTab === 'users'
              ? fetchUsers()
              : activeTab === 'reviews'
              ? fetchReviews()
              : fetchTransactions()
          "
          :disabled="isUsersLoading || isReviewsLoading || isTxLoading"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <span
            class="material-symbols-outlined text-[18px]"
            :class="{ 'animate-spin': isUsersLoading || isReviewsLoading || isTxLoading }"
          >
            sync
          </span>
          Segarkan Data
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto pb-1">
        <button
          @click="setTab('users')"
          :class="[
            'px-4 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'users'
              ? 'border-primary text-primary dark:text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">group</span>
          <span>Daftar Pengguna</span>
          <span class="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {{ userStats.total_users || 0 }}
          </span>
        </button>

        <button
          @click="setTab('reviews')"
          :class="[
            'px-4 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'reviews'
              ? 'border-primary text-primary dark:text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">rate_review</span>
          <span>Ulasan Pengguna</span>
          <span class="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {{ reviewStats.total_reviews || 0 }}
          </span>
        </button>

        <button
          @click="setTab('transactions')"
          :class="[
            'px-4 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'transactions'
              ? 'border-primary text-primary dark:text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          <span class="material-symbols-outlined text-[20px]">token</span>
          <span>Transaksi & Token</span>
          <span class="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {{ txStats.total_transactions || 0 }}
          </span>
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: PENGGUNA TERDAFTAR                                -->
      <!-- ======================================================== -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Pengguna
              </p>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {{ userStats.total_users.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Semua user terdaftar</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">group</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Pengguna Premium
              </p>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {{ userStats.premium_users.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Limit 1.000 karakter</p>
            </div>
            <div class="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Administrator
              </p>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                {{ userStats.admin_users.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Akses kelola sistem</p>
            </div>
            <div class="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">security</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              v-model="usersSearch"
              @input="handleUsersSearch"
              placeholder="Cari email, nama, atau UUID user..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              v-if="usersSearch"
              @click="usersSearch = ''; handleUsersSearch();"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              @click="handleUsersFilterChange('all')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                usersFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              ]"
            >
              Semua ({{ userStats.total_users }})
            </button>
            <button
              @click="handleUsersFilterChange('free')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                usersFilter === 'free'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              ]"
            >
              Free
            </button>
            <button
              @click="handleUsersFilterChange('premium')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1',
                usersFilter === 'premium'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              ]"
            >
              <span class="material-symbols-outlined text-[14px]">workspace_premium</span>
              Premium ({{ userStats.premium_users }})
            </button>
            <button
              @click="handleUsersFilterChange('admin')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1',
                usersFilter === 'admin'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              ]"
            >
              <span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
              Admin ({{ userStats.admin_users }})
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div v-if="isUsersLoading" class="flex flex-col items-center justify-center py-20">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Memuat data pengguna...</p>
          </div>

          <div v-else-if="users.length === 0" class="text-center py-16 px-4">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <span class="material-symbols-outlined text-3xl">person_search</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Tidak ada pengguna ditemukan</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
          </div>

          <div v-else class="hidden md:block overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  <th class="py-3.5 px-4">Pengguna</th>
                  <th class="py-3.5 px-4">Tipe Akun</th>
                  <th class="py-3.5 px-4">Status Admin</th>
                  <th class="py-3.5 px-4">Sisa Token</th>
                  <th class="py-3.5 px-4">Terdaftar</th>
                  <th class="py-3.5 px-4">Login Terakhir</th>
                  <th class="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="u.avatar_url"
                        :src="u.avatar_url"
                        alt="Avatar"
                        class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                      />
                      <div v-else class="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                        {{ u.email ? u.email.charAt(0).toUpperCase() : 'U' }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-bold text-gray-900 dark:text-white truncate">
                          {{ u.full_name || u.email?.split('@')[0] || 'Pengguna' }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ u.email }}</p>
                        <button
                          @click="copyToClipboard(u.id)"
                          class="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-mono flex items-center gap-0.5 mt-0.5"
                          title="Salin UUID"
                        >
                          <span>{{ u.id.substring(0, 8) }}...</span>
                          <span class="material-symbols-outlined text-[11px]">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span
                      v-if="u.plan_type === 'premium'"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    >
                      <span class="material-symbols-outlined text-[14px]">workspace_premium</span>
                      Premium
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      Free
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    <span
                      v-if="u.is_admin"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                    >
                      <span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                      Admin
                    </span>
                    <span v-else class="text-xs text-gray-400 font-medium">User Biasa</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <div v-if="u.plan_type === 'premium'">
                      <span class="font-bold text-amber-600 dark:text-amber-400">
                        {{ (u.max_premium_tokens || 0).toLocaleString("id-ID") }}
                      </span>
                      <span class="text-xs text-gray-400 ml-1">token</span>
                    </div>
                    <div v-else>
                      <span class="font-medium text-gray-700 dark:text-gray-300">
                        {{ (u.daily_token_limit || 10000).toLocaleString("id-ID") }}
                      </span>
                      <span class="text-[11px] text-gray-400 ml-1">/ hari</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {{ formatDate(u.created_at) }}
                  </td>
                  <td class="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ formatDate(u.last_sign_in_at) }}
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <button
                      @click="openEditUserModal(u)"
                      class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                      title="Edit Pengguna"
                    >
                      <span class="material-symbols-outlined text-[18px] block">edit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div v-if="users.length > 0" class="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
            <div v-for="u in users" :key="'mobile-' + u.id" class="p-4 space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="u.avatar_url"
                    :src="u.avatar_url"
                    alt="Avatar"
                    class="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                  />
                  <div v-else class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                    {{ u.email ? u.email.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 dark:text-white truncate">
                      {{ u.full_name || u.email?.split('@')[0] || 'Pengguna' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ u.email }}</p>
                  </div>
                </div>
                <button
                  @click="openEditUserModal(u)"
                  class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 flex-shrink-0"
                >
                  <span class="material-symbols-outlined text-[18px] block">edit</span>
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-2 pt-1">
                <span
                  v-if="u.plan_type === 'premium'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                >
                  <span class="material-symbols-outlined text-[13px]">workspace_premium</span>
                  Premium
                </span>
                <span v-else class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  Free
                </span>

                <span
                  v-if="u.is_admin"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                >
                  <span class="material-symbols-outlined text-[13px]">admin_panel_settings</span>
                  Admin
                </span>

                <span class="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {{ u.plan_type === 'premium' ? `${(u.max_premium_tokens || 0).toLocaleString('id-ID')} token` : `${(u.daily_token_limit || 10000).toLocaleString('id-ID')}/hari` }}
                </span>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="users.length > 0"
            class="p-4 bg-gray-50/60 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400"
          >
            <div>
              Menampilkan <span class="font-bold text-gray-900 dark:text-white">{{ (usersPage - 1) * usersPageSize + 1 }}</span>
              sampai
              <span class="font-bold text-gray-900 dark:text-white">{{ Math.min(usersPage * usersPageSize, usersFilteredCount) }}</span>
              dari <span class="font-bold text-gray-900 dark:text-white">{{ usersFilteredCount }}</span> pengguna
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="usersPage > 1 && (usersPage--, fetchUsers())"
                :disabled="usersPage === 1 || isUsersLoading"
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span class="font-bold">{{ usersPage }} / {{ usersTotalPages }}</span>
              <button
                @click="usersPage < usersTotalPages && (usersPage++, fetchUsers())"
                :disabled="usersPage >= usersTotalPages || isUsersLoading"
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: ULASAN PENGGUNA (REVIEWS)                         -->
      <!-- ======================================================== -->
      <div v-else-if="activeTab === 'reviews'" class="space-y-6">
        <!-- Review Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Ulasan
              </p>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {{ reviewStats.total_reviews.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Semua review masuk</p>
            </div>
            <div class="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">rate_review</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                Tampil di Beranda
              </p>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1">
                {{ reviewStats.visible_reviews.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Testimoni publik aktif</p>
            </div>
            <div class="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">visibility</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Disembunyikan
              </p>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-gray-700 dark:text-gray-300 mt-1">
                {{ reviewStats.hidden_reviews.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Belum dipublikasi</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">visibility_off</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              v-model="reviewsSearch"
              @input="handleReviewsSearch"
              placeholder="Cari isi ulasan, asal tahu aplikasi, atau email..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              v-if="reviewsSearch"
              @click="reviewsSearch = ''; handleReviewsSearch();"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              @click="handleReviewsStatusChange('all')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                reviewsStatus === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              ]"
            >
              Semua ({{ reviewStats.total_reviews }})
            </button>
            <button
              @click="handleReviewsStatusChange('visible')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1',
                reviewsStatus === 'visible'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              ]"
            >
              <span class="material-symbols-outlined text-[14px]">visibility</span>
              Tampil ({{ reviewStats.visible_reviews }})
            </button>
            <button
              @click="handleReviewsStatusChange('hidden')"
              :class="[
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1',
                reviewsStatus === 'hidden'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              ]"
            >
              <span class="material-symbols-outlined text-[14px]">visibility_off</span>
              Disembunyikan ({{ reviewStats.hidden_reviews }})
            </button>
          </div>
        </div>

        <!-- Reviews List -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div v-if="isReviewsLoading" class="flex flex-col items-center justify-center py-20">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Memuat data ulasan pengguna...</p>
          </div>

          <div v-else-if="reviews.length === 0" class="text-center py-16 px-4">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <span class="material-symbols-outlined text-3xl">chat_bubble_outline</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Tidak ada ulasan ditemukan</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Belum ada review yang sesuai dengan filter.</p>
          </div>

          <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/60">
            <div
              v-for="r in reviews"
              :key="r.id"
              class="p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div class="flex items-start gap-3.5 min-w-0 flex-1">
                <img
                  v-if="r.avatar_url"
                  :src="r.avatar_url"
                  alt="Avatar"
                  class="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                />
                <div v-else class="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                  {{ r.email ? r.email.charAt(0).toUpperCase() : 'U' }}
                </div>

                <div class="space-y-1.5 min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-bold text-sm text-gray-900 dark:text-white">
                      {{ r.full_name || r.email?.split('@')[0] || 'Pengguna' }}
                    </span>
                    <span class="text-xs text-gray-400 font-normal">({{ r.email }})</span>
                    <span class="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                      <span class="material-symbols-outlined text-[12px]">info</span>
                      Dari: {{ r.source }}
                    </span>
                  </div>

                  <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-normal bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    "{{ r.feedback }}"
                  </p>

                  <p class="text-[11px] text-gray-400">
                    Waktu: {{ formatDate(r.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Toggle Visibility Button -->
              <div class="flex items-center gap-2 sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700">
                <button
                  @click="toggleReviewVisibility(r)"
                  :disabled="updatingReviewId === r.id"
                  :class="[
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50',
                    r.is_visible
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                  :title="r.is_visible ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan di beranda'"
                >
                  <span
                    v-if="updatingReviewId === r.id"
                    class="material-symbols-outlined animate-spin text-[16px]"
                  >
                    progress_activity
                  </span>
                  <span v-else class="material-symbols-outlined text-[16px]">
                    {{ r.is_visible ? 'visibility' : 'visibility_off' }}
                  </span>
                  <span>{{ r.is_visible ? 'Tampil di Beranda' : 'Disembunyikan' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="reviews.length > 0"
            class="p-4 bg-gray-50/60 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400"
          >
            <div>
              Menampilkan <span class="font-bold text-gray-900 dark:text-white">{{ (reviewsPage - 1) * reviewsPageSize + 1 }}</span>
              sampai
              <span class="font-bold text-gray-900 dark:text-white">{{ Math.min(reviewsPage * reviewsPageSize, reviewsFilteredCount) }}</span>
              dari <span class="font-bold text-gray-900 dark:text-white">{{ reviewsFilteredCount }}</span> ulasan
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="reviewsPage > 1 && (reviewsPage--, fetchReviews())"
                :disabled="reviewsPage === 1 || isReviewsLoading"
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span class="font-bold">{{ reviewsPage }} / {{ reviewsTotalPages }}</span>
              <button
                @click="reviewsPage < reviewsTotalPages && (reviewsPage++, fetchReviews())"
                :disabled="reviewsPage >= reviewsTotalPages || isReviewsLoading"
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 3: TRANSAKSI & TOKEN TERPAKAI                        -->
      <!-- ======================================================== -->
      <div v-else-if="activeTab === 'transactions'" class="space-y-6">
        <!-- Transaction Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Transaksi
              </p>
              <h3 class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {{ txStats.total_transactions.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Semua proses AI</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Total Token Terpakai
              </p>
              <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {{ txStats.total_tokens.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Sejak awal aplikasi</p>
            </div>
            <div class="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">toll</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Transaksi Hari Ini
              </p>
              <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {{ txStats.today_transactions.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Aktivitas 24 jam</p>
            </div>
            <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">today</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-primary dark:text-primary uppercase tracking-wider">
                Token Terpakai Hari Ini
              </p>
              <h3 class="text-2xl font-extrabold text-primary dark:text-primary mt-1">
                {{ txStats.today_tokens.toLocaleString("id-ID") }}
              </h3>
              <p class="text-[11px] text-gray-400 mt-0.5">Konsumsi token hari ini</p>
            </div>
            <div class="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">token</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              v-model="txSearch"
              @input="handleTxSearch"
              placeholder="Cari email user, nama, atau ID transaksi..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              v-if="txSearch"
              @click="txSearch = ''; handleTxSearch();"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Filter Fitur -->
            <select
              v-model="txFeature"
              @change="handleTxFeatureChange(txFeature)"
              class="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="all">Semua Fitur</option>
              <option value="analisis">Analisis I'rab</option>
              <option value="ocr">OCR Foto</option>
              <option value="chat">Chat AI</option>
              <option value="tashrif">Tashrif</option>
            </select>

            <!-- Filter Tanggal -->
            <div class="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1">
              <input
                type="date"
                v-model="txDate"
                @change="handleTxDateChange"
                class="bg-transparent text-xs text-gray-700 dark:text-gray-300 outline-none border-none focus:ring-0 p-1"
              />
              <button
                v-if="txDate"
                @click="clearTxDate"
                class="p-1 text-gray-400 hover:text-red-500 rounded-full"
                title="Hapus tanggal"
              >
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div v-if="isTxLoading" class="flex flex-col items-center justify-center py-20">
            <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Memuat log transaksi...</p>
          </div>

          <div v-else-if="transactions.length === 0" class="text-center py-16 px-4">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <span class="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Tidak ada transaksi ditemukan</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Belum ada aktivitas yang sesuai dengan filter.</p>
          </div>

          <div v-else class="hidden md:block overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  <th class="py-3.5 px-4">Pengguna</th>
                  <th class="py-3.5 px-4">Fitur</th>
                  <th class="py-3.5 px-4">Token Terpakai</th>
                  <th class="py-3.5 px-4">Ringkasan Input</th>
                  <th class="py-3.5 px-4">Waktu</th>
                  <th class="py-3.5 px-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                <tr v-for="t in transactions" :key="t.id" class="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="t.avatar_url"
                        :src="t.avatar_url"
                        alt="Avatar"
                        class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                      />
                      <div v-else class="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                        {{ t.email ? t.email.charAt(0).toUpperCase() : 'U' }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-bold text-gray-900 dark:text-white truncate">
                          {{ t.full_name || t.email?.split('@')[0] || 'Pengguna' }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ t.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td class="py-3.5 px-4">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider',
                        getFeatureBadgeClass(t.feature)
                      ]"
                    >
                      {{ t.feature }}
                    </span>
                  </td>

                  <td class="py-3.5 px-4">
                    <span class="font-bold text-amber-600 dark:text-amber-400">
                      {{ (t.total_tokens || 0).toLocaleString("id-ID") }}
                    </span>
                    <span class="text-xs text-gray-400 ml-1">token</span>
                  </td>

                  <td class="py-3.5 px-4 max-w-xs">
                    <p class="text-xs text-gray-600 dark:text-gray-300 truncate" dir="auto">
                      {{ t.metadata?.teks_asli || t.metadata?.query || t.metadata?.message || '-' }}
                    </p>
                  </td>

                  <td class="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ formatDate(t.created_at) }}
                  </td>

                  <td class="py-3.5 px-4 text-center">
                    <button
                      @click="openTxDetailModal(t)"
                      class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                      title="Lihat Detail Transaksi"
                    >
                      <span class="material-symbols-outlined text-[18px] block">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div v-if="transactions.length > 0" class="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
            <div v-for="t in transactions" :key="'tx-mobile-' + t.id" class="p-4 space-y-2.5">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="t.avatar_url"
                    :src="t.avatar_url"
                    alt="Avatar"
                    class="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                  />
                  <div v-else class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                    {{ t.email ? t.email.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {{ t.full_name || t.email?.split('@')[0] || 'Pengguna' }}
                    </p>
                    <p class="text-[11px] text-gray-400 truncate">{{ t.email }}</p>
                  </div>
                </div>

                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase',
                    getFeatureBadgeClass(t.feature)
                  ]"
                >
                  {{ t.feature }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div class="truncate max-w-[200px]" dir="auto">
                  <span class="text-gray-400">Input:</span>
                  <span class="text-gray-700 dark:text-gray-200 font-medium ml-1">
                    {{ t.metadata?.teks_asli || t.metadata?.query || '-' }}
                  </span>
                </div>
                <div class="font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap pl-2">
                  {{ (t.total_tokens || 0).toLocaleString("id-ID") }} token
                </div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>{{ formatDate(t.created_at) }}</span>
                <button
                  @click="openTxDetailModal(t)"
                  class="text-primary hover:underline font-bold flex items-center gap-0.5"
                >
                  Detail
                  <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="transactions.length > 0"
            class="p-4 bg-gray-50/60 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400"
          >
            <div>
              Menampilkan <span class="font-bold text-gray-900 dark:text-white">{{ (txPage - 1) * txPageSize + 1 }}</span>
              sampai
              <span class="font-bold text-gray-900 dark:text-white">{{ Math.min(txPage * txPageSize, txFilteredCount) }}</span>
              dari <span class="font-bold text-gray-900 dark:text-white">{{ txFilteredCount }}</span> transaksi
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="txPage > 1 && (txPage--, fetchTransactions())"
                :disabled="txPage === 1 || isTxLoading"
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span class="font-bold">{{ txPage }} / {{ txTotalPages }}</span>
              <button
                @click="txPage < txTotalPages && (txPage++, fetchTransactions())"
                :disabled="txPage >= txTotalPages || isTxLoading"
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ======================================================== -->
    <!-- MODAL EDIT USER                                          -->
    <!-- ======================================================== -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isUserModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="isUserModalOpen = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div class="flex items-center gap-2.5">
              <div class="p-2 bg-primary/10 text-primary rounded-xl">
                <span class="material-symbols-outlined block text-[22px]">manage_accounts</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Edit Pengguna</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px]">
                  {{ selectedUser?.email }}
                </p>
              </div>
            </div>
            <button
              @click="isUserModalOpen = false"
              class="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="material-symbols-outlined block text-[20px]">close</span>
            </button>
          </div>

          <form @submit.prevent="saveUserEdit" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Tipe Paket (Plan Type)
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  :class="[
                    'flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all',
                    userEditForm.plan_type === 'free'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  ]"
                >
                  <input type="radio" value="free" v-model="userEditForm.plan_type" class="hidden" />
                  <span>Free (Gratis)</span>
                </label>

                <label
                  :class="[
                    'flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all',
                    userEditForm.plan_type === 'premium'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  ]"
                >
                  <input type="radio" value="premium" v-model="userEditForm.plan_type" class="hidden" />
                  <span class="material-symbols-outlined text-[18px]">workspace_premium</span>
                  <span>Premium</span>
                </label>
              </div>
            </div>

            <div v-if="userEditForm.plan_type === 'premium'">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Total Sisa Token Premium
              </label>
              <input
                type="number"
                v-model="userEditForm.max_premium_tokens"
                min="0"
                step="1000"
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Batas Token Harian (Free)
              </label>
              <input
                type="number"
                v-model="userEditForm.daily_token_limit"
                min="0"
                step="1000"
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
              <label class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 cursor-pointer">
                <div>
                  <span class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-red-500 text-[18px]">admin_panel_settings</span>
                    Akses Administrator (is_admin)
                  </span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Memberikan hak akses penuh ke panel admin ini.
                  </p>
                </div>
                <input
                  type="checkbox"
                  v-model="userEditForm.is_admin"
                  class="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                />
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                @click="isUserModalOpen = false"
                class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 text-sm font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isUserUpdating"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md flex items-center gap-2"
              >
                <span v-if="isUserUpdating" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>{{ isUserUpdating ? "Menyimpan..." : "Simpan" }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ======================================================== -->
    <!-- MODAL DETAIL TRANSAKSI                                   -->
    <!-- ======================================================== -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isTxModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="isTxModalOpen = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Detail Log Transaksi</h3>
            </div>
            <button
              @click="isTxModalOpen = false"
              class="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="material-symbols-outlined block text-[20px]">close</span>
            </button>
          </div>

          <div v-if="selectedTx" class="space-y-3 text-sm">
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <p class="text-xs text-gray-500">Pengguna</p>
                <p class="font-bold text-gray-900 dark:text-white">{{ selectedTx.email }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Token Terpakai</p>
                <p class="font-bold text-amber-600 dark:text-amber-400 text-base">
                  {{ (selectedTx.total_tokens || 0).toLocaleString("id-ID") }} token
                </p>
              </div>
            </div>

            <div>
              <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Fitur & Waktu
              </p>
              <div class="flex items-center justify-between">
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-bold border', getFeatureBadgeClass(selectedTx.feature)]">
                  {{ selectedTx.feature }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(selectedTx.created_at) }}</span>
              </div>
            </div>

            <!-- Metadata Details -->
            <div v-if="selectedTx.metadata" class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rincian Input / Metadata
              </p>
              <div v-if="selectedTx.metadata.teks_asli" class="space-y-1">
                <p class="text-xs text-gray-400">Teks Arab Asli:</p>
                <p class="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl font-arabic text-base border border-gray-100 dark:border-gray-700 leading-relaxed text-right" dir="rtl">
                  {{ selectedTx.metadata.teks_asli }}
                </p>
              </div>

              <div v-if="selectedTx.metadata.terjemahan" class="space-y-1">
                <p class="text-xs text-gray-400">Terjemahan:</p>
                <p class="p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  {{ selectedTx.metadata.terjemahan }}
                </p>
              </div>

              <div class="mt-2">
                <p class="text-xs text-gray-400 mb-1">Raw JSON Payload:</p>
                <pre class="bg-gray-900 text-gray-200 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">{{ JSON.stringify(selectedTx.metadata, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              @click="isTxModalOpen = false"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Global Toast Notification -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="fixed bottom-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-xl shadow-lg border dark:text-gray-400 dark:bg-gray-800"
        :class="toastType === 'error' ? 'border-red-200 dark:border-red-900/50' : 'border-green-200 dark:border-green-900/50'"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
          :class="toastType === 'error' ? 'text-red-500 bg-red-100 dark:bg-red-800/30' : 'text-green-500 bg-green-100 dark:bg-green-800/30'"
        >
          <span class="material-symbols-outlined text-[20px]">
            {{ toastType === 'error' ? 'error' : 'check_circle' }}
          </span>
        </div>
        <div class="ml-3 text-sm font-normal text-gray-800 dark:text-gray-200">
          {{ toastMessage }}
        </div>
        <button
          type="button"
          @click="showToast = false"
          class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
