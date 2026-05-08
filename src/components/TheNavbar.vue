<template>
  <nav
    class="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10"
  >
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <router-link
        to="/"
        class="flex items-center gap-2 hover:opacity-80 transition-opacity block"
      >
        <div
          class="bg-primary p-1.5 rounded-lg flex items-center justify-center text-white"
        >
          <span class="material-symbols-outlined dark:text-gray-200"
            >menu_book</span
          >
        </div>
        <h1
          class="text-xl font-bold tracking-tight text-[#111814] dark:text-white"
        >
          Bacokitab
        </h1>
      </router-link>

      <!-- Auth Section -->
      <div class="flex items-center gap-4">

        <div v-if="user" class="flex items-center gap-2 sm:gap-4">
          <router-link to="/history" class="text-sm font-bold text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1.5" active-class="text-primary dark:text-primary">
            <span class="material-symbols-outlined text-[20px]">history</span>
            <span class="hidden sm:inline">Riwayat</span>
          </router-link>
          
          <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          
          <div class="flex items-center gap-1 sm:gap-2">
            <!-- Notification Icon -->
            <button class="relative p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
              <span class="material-symbols-outlined">notifications</span>
              <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
            </button>

            <!-- User Dropdown -->
            <div class="relative z-50">
              <button
                @click="isDropdownOpen = !isDropdownOpen"
                class="flex items-center gap-2 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 p-1 sm:pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <img
                  v-if="user.user_metadata?.avatar_url"
                  :src="user.user_metadata.avatar_url"
                  alt="Profile"
                  class="w-8 h-8 rounded-full border border-gray-200"
                />
                <div v-else class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {{ user.email ? user.email.charAt(0).toUpperCase() : 'U' }}
                </div>
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block"
                  >{{ user.user_metadata?.full_name || user.email }}</span
                >
                <span class="material-symbols-outlined text-gray-400 text-[20px] hidden sm:block">expand_more</span>
              </button>

              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isDropdownOpen"
                  class="absolute right-0 mt-2 w-48 bg-white dark:bg-background-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 overflow-hidden"
                >
                  <div class="px-4 py-3 sm:hidden border-b border-gray-100 dark:border-gray-700">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ user.user_metadata?.full_name || user.email }}
                    </p>
                  </div>
                  
                  <router-link
                    to="/transaksi"
                    @click="isDropdownOpen = false"
                    class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 font-medium flex items-center gap-2 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                    Log Transaksi
                  </router-link>

                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 font-bold flex items-center gap-2 transition-colors"
                  >
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    Logout
                  </button>
                </div>
              </transition>
            </div>
            
            <!-- Invisible overlay to close dropdown -->
            <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="fixed inset-0 z-40 cursor-default"></div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import { user, signOut } from "../lib/supabase.js";
import { useRouter } from "vue-router";

const router = useRouter();
const isDropdownOpen = ref(false);

const handleLogout = async () => {
  isDropdownOpen.value = false;
  await signOut();
  router.push("/");
};
</script>
