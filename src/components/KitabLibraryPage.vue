<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import TheNavbar from "./TheNavbar.vue";
import {
  user,
  isAdmin,
  getKitabPdfs,
  createKitabPdf,
  updateKitabPdf,
  deleteKitabPdf,
} from "../lib/supabase.js";
import { isValidPdfUrl } from "../lib/pdfUrl.js";
import { useHead } from "@unhead/vue";

useHead({
  title: "Pustaka Kitab PDF - BacoKitab",
});

const router = useRouter();

// Data State
const isLoading = ref(true);
const isSubmitting = ref(false);
const kitabList = ref([]);

// Filter & Search State
const searchQuery = ref("");
const visibilityFilter = ref("all"); // 'all' | 'public' | 'private'
const selectedTheme = ref("all");

// Common Theme Suggestions
const themeSuggestions = [
  "Fiqih",
  "Nahwu",
  "Shorof",
  "Tafsir",
  "Hadits",
  "Aqidah",
  "Tasawuf",
  "Akhlaq",
  "Sejarah",
  "Lainnya",
];

// Modal Add / Edit State
const isFormModalOpen = ref(false);
const editingId = ref(null);
const formError = ref("");
const form = ref({
  title: "",
  author: "",
  theme: "",
  pdf_url: "",
  is_public: false,
});

// Delete Confirmation Modal
const isDeleteModalOpen = ref(false);
const deletingKitab = ref(null);
const isDeleting = ref(false);

// Toast Notification
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
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

// Fetch List
const fetchKitabs = async () => {
  isLoading.value = true;
  try {
    kitabList.value = await getKitabPdfs();
  } catch (err) {
    triggerToast("Gagal memuat daftar kitab: " + (err.message || err), "error");
  } finally {
    isLoading.value = false;
  }
};

// Dynamic Available Themes
const availableThemes = computed(() => {
  const set = new Set();
  kitabList.value.forEach((k) => {
    if (k.theme) set.add(k.theme.trim());
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

// Counts
const counts = computed(() => {
  const all = kitabList.value.length;
  const pub = kitabList.value.filter((k) => k.is_public).length;
  const priv = kitabList.value.filter((k) => !k.is_public && k.user_id === user.value?.id).length;
  return { all, pub, priv };
});

// Filtered List
const filteredKitabs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return kitabList.value.filter((k) => {
    if (visibilityFilter.value === "public" && !k.is_public) return false;
    if (visibilityFilter.value === "private" && (k.is_public || k.user_id !== user.value?.id)) {
      return false;
    }
    if (selectedTheme.value !== "all" && k.theme?.trim().toLowerCase() !== selectedTheme.value.toLowerCase()) {
      return false;
    }
    if (q) {
      const matchTitle = (k.title || "").toLowerCase().includes(q);
      const matchAuthor = (k.author || "").toLowerCase().includes(q);
      const matchTheme = (k.theme || "").toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchTheme) return false;
    }
    return true;
  });
});

// Ownership Check
const canManage = (kitab) => {
  if (!user.value) return false;
  return kitab.user_id === user.value.id || isAdmin.value;
};

// Open Add Modal
const openAddModal = () => {
  editingId.value = null;
  formError.value = "";
  form.value = {
    title: "",
    author: "",
    theme: "",
    pdf_url: "",
    is_public: false,
  };
  isFormModalOpen.value = true;
};

// Open Edit Modal
const openEditModal = (kitab) => {
  editingId.value = kitab.id;
  formError.value = "";
  form.value = {
    title: kitab.title || "",
    author: kitab.author || "",
    theme: kitab.theme || "",
    pdf_url: kitab.pdf_url || "",
    is_public: !!kitab.is_public,
  };
  isFormModalOpen.value = true;
};

const closeFormModal = () => {
  isFormModalOpen.value = false;
  formError.value = "";
};

// Submit Add / Edit
const submitForm = async () => {
  formError.value = "";

  if (!form.value.title.trim()) {
    formError.value = "Judul kitab wajib diisi.";
    return;
  }
  if (!form.value.author.trim()) {
    formError.value = "Nama pengarang wajib diisi.";
    return;
  }
  if (!form.value.theme.trim()) {
    formError.value = "Tema / kategori kitab wajib diisi.";
    return;
  }
  if (!isValidPdfUrl(form.value.pdf_url)) {
    formError.value = "Masukkan link URL PDF yang valid (harus diawali http:// atau https://).";
    return;
  }

  isSubmitting.value = true;
  try {
    if (editingId.value) {
      await updateKitabPdf(editingId.value, form.value);
      triggerToast("Data kitab berhasil diperbarui!", "success");
    } else {
      await createKitabPdf(form.value);
      triggerToast("Kitab PDF berhasil ditambahkan!", "success");
    }
    closeFormModal();
    await fetchKitabs();
  } catch (err) {
    formError.value = err.message || "Gagal menyimpan data kitab.";
  } finally {
    isSubmitting.value = false;
  }
};

// Delete Handlers
const confirmDelete = (kitab) => {
  deletingKitab.value = kitab;
  isDeleteModalOpen.value = true;
};

const handleDelete = async () => {
  if (!deletingKitab.value) return;
  isDeleting.value = true;
  try {
    await deleteKitabPdf(deletingKitab.value.id);
    triggerToast("Kitab berhasil dihapus.", "success");
    isDeleteModalOpen.value = false;
    deletingKitab.value = null;
    await fetchKitabs();
  } catch (err) {
    triggerToast("Gagal menghapus kitab: " + (err.message || err), "error");
  } finally {
    isDeleting.value = false;
  }
};

// Navigate to Reader
const openReader = (kitab) => {
  router.push(`/kitab/${kitab.id}`);
};

onMounted(() => {
  fetchKitabs();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-background-dark">
    <TheNavbar />

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <router-link
            to="/home"
            class="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
            title="Kembali ke Beranda"
          >
            <span class="material-symbols-outlined block">arrow_back</span>
          </router-link>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Pustaka Kitab PDF
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Simpan tautan kitab PDF favorit Anda dan baca langsung dari aplikasi.
            </p>
          </div>
        </div>

        <button
          @click="openAddModal"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <span class="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Tambah Kitab</span>
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-6 space-y-4">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <!-- Visibility Tabs -->
          <div class="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              @click="visibilityFilter = 'all'"
              :class="[
                'flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                visibilityFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800'
              ]"
            >
              Semua ({{ counts.all }})
            </button>
            <button
              @click="visibilityFilter = 'public'"
              :class="[
                'flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1',
                visibilityFilter === 'public'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800'
              ]"
            >
              <span class="material-symbols-outlined text-[14px]">public</span>
              Publik ({{ counts.pub }})
            </button>
            <button
              @click="visibilityFilter = 'private'"
              :class="[
                'flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1',
                visibilityFilter === 'private'
                  ? 'bg-gray-800 dark:bg-gray-700 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800'
              ]"
            >
              <span class="material-symbols-outlined text-[14px]">lock</span>
              Privat ({{ counts.priv }})
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari judul kitab, pengarang, atau tema..."
              class="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <!-- Theme Pills -->
        <div v-if="availableThemes.length > 0" class="flex items-center gap-2 overflow-x-auto pb-1">
          <span class="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tema:</span>
          <button
            @click="selectedTheme = 'all'"
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap border',
              selectedTheme === 'all'
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/40'
            ]"
          >
            Semua Tema
          </button>
          <button
            v-for="theme in availableThemes"
            :key="theme"
            @click="selectedTheme = theme"
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap border',
              selectedTheme === theme
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/40'
            ]"
          >
            {{ theme }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Memuat pustaka kitab...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredKitabs.length === 0"
        class="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-4xl">picture_as_pdf</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ kitabList.length === 0 ? "Belum ada kitab PDF tersimpan" : "Kitab tidak ditemukan" }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          {{
            kitabList.length === 0
              ? "Mulai tambahkan link PDF kitab kuning atau buku referensi Anda (bisa diatur Privat atau Publik)."
              : "Coba ubah kata kunci pencarian atau pilih filter lain."
          }}
        </p>
        <button
          v-if="kitabList.length === 0"
          @click="openAddModal"
          class="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-md transition-all"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          Tambah Kitab Pertama
        </button>
      </div>

      <!-- Kitab Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="kitab in filteredKitabs"
          :key="kitab.id"
          class="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
        >
          <div class="space-y-3">
            <!-- Top Badges -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  <span class="material-symbols-outlined text-[13px]">label</span>
                  {{ kitab.theme }}
                </span>

                <span
                  v-if="kitab.is_public"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                >
                  <span class="material-symbols-outlined text-[13px]">public</span>
                  Publik
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                >
                  <span class="material-symbols-outlined text-[13px]">lock</span>
                  Privat
                </span>
              </div>

              <!-- Owner Actions -->
              <div v-if="canManage(kitab)" class="flex items-center gap-1 flex-shrink-0">
                <button
                  @click="openEditModal(kitab)"
                  class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Edit Kitab"
                >
                  <span class="material-symbols-outlined text-[18px] block">edit</span>
                </button>
                <button
                  @click="confirmDelete(kitab)"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Hapus Kitab"
                >
                  <span class="material-symbols-outlined text-[18px] block">delete</span>
                </button>
              </div>
            </div>

            <!-- Title & Author -->
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-2xl">picture_as_pdf</span>
              </div>
              <div class="min-w-0 flex-1">
                <h3
                  class="text-lg font-bold text-gray-900 dark:text-white leading-snug break-words"
                  dir="auto"
                >
                  {{ kitab.title }}
                </h3>
                <p
                  class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"
                  dir="auto"
                >
                  <span class="material-symbols-outlined text-[15px] flex-shrink-0">person</span>
                  <span class="truncate">{{ kitab.author }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              @click="openReader(kitab)"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <span class="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Baca Kitab</span>
            </button>
            <a
              :href="kitab.pdf_url"
              target="_blank"
              rel="noopener noreferrer"
              class="p-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors flex items-center justify-center"
              title="Buka Link Asli di Tab Baru"
            >
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </main>

    <!-- ========================================== -->
    <!-- MODAL TAMBAH / EDIT KITAB                  -->
    <!-- ========================================== -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isFormModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closeFormModal"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3.5">
            <div class="flex items-center gap-2.5">
              <div class="p-2 bg-primary/10 text-primary rounded-xl">
                <span class="material-symbols-outlined block text-[22px]">
                  {{ editingId ? "edit_document" : "library_add" }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ editingId ? "Edit Data Kitab" : "Tambah Kitab PDF" }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Masukkan informasi kitab beserta tautan link PDF-nya.
                </p>
              </div>
            </div>
            <button
              @click="closeFormModal"
              class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="material-symbols-outlined block text-[20px]">close</span>
            </button>
          </div>

          <!-- Error Alert -->
          <div
            v-if="formError"
            class="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
            <span>{{ formError }}</span>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Judul Kitab -->
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Judul Kitab <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="form.title"
                dir="auto"
                placeholder="Contoh: Fathul Qorib / فتح القريب المجيب"
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>

            <!-- Pengarang -->
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Pengarang (Muallif) <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="form.author"
                dir="auto"
                placeholder="Contoh: Syekh Muhammad bin Qasim Al-Ghazi"
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>

            <!-- Tema -->
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Tema / Bidang Ilmu <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="form.theme"
                placeholder="Contoh: Fiqih, Nahwu, Shorof, Tafsir..."
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none"
                required
              />
              <div class="flex flex-wrap gap-1.5 mt-2">
                <button
                  v-for="t in themeSuggestions"
                  :key="t"
                  type="button"
                  @click="form.theme = t"
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors',
                    form.theme === t
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/40'
                  ]"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Link PDF -->
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Link PDF <span class="text-red-500">*</span>
              </label>
              <input
                type="url"
                v-model="form.pdf_url"
                placeholder="https://example.com/kitab.pdf atau link Google Drive"
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary outline-none font-mono"
                required
              />
              <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Mendukung link file <code>.pdf</code> langsung maupun link berbagi Google Drive (pastikan akses link publik / siapa saja yang memiliki link).
              </p>
            </div>

            <!-- Visibilitas (Publik / Privat) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Visibilitas
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  :class="[
                    'flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all',
                    !form.is_public
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                  ]"
                >
                  <input type="radio" :value="false" v-model="form.is_public" class="hidden" />
                  <span class="flex items-center gap-1.5 font-bold text-sm">
                    <span class="material-symbols-outlined text-[18px]">lock</span>
                    Privat
                  </span>
                  <span class="text-[11px] opacity-80 leading-tight">
                    Hanya bisa dilihat oleh akun Anda.
                  </span>
                </label>

                <label
                  :class="[
                    'flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all',
                    form.is_public
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                  ]"
                >
                  <input type="radio" :value="true" v-model="form.is_public" class="hidden" />
                  <span class="flex items-center gap-1.5 font-bold text-sm">
                    <span class="material-symbols-outlined text-[18px]">public</span>
                    Publik
                  </span>
                  <span class="text-[11px] opacity-80 leading-tight">
                    Dapat dibaca oleh semua pengguna.
                  </span>
                </label>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                @click="closeFormModal"
                class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>{{ isSubmitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kitab" }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ========================================== -->
    <!-- MODAL KONFIRMASI HAPUS                     -->
    <!-- ========================================== -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isDeleteModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="isDeleteModalOpen = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined">delete_forever</span>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white">Hapus Kitab PDF?</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <p class="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700" dir="auto">
            <strong>{{ deletingKitab?.title }}</strong> — {{ deletingKitab?.author }}
          </p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              @click="isDeleteModalOpen = false"
              class="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              @click="handleDelete"
              :disabled="isDeleting"
              class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <span v-if="isDeleting" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              <span>{{ isDeleting ? "Menghapus..." : "Hapus" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
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
