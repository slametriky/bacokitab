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
        <router-link to="/latihan" class="text-sm font-bold text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1.5" active-class="text-primary dark:text-primary">
          <span class="material-symbols-outlined text-[20px]">quiz</span>
          <span class="hidden sm:inline">Latihan</span>
        </router-link>
        
        <div v-if="user" class="flex items-center gap-4">
          <router-link to="/history" class="text-sm font-bold text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1.5" active-class="text-primary dark:text-primary">
            <span class="material-symbols-outlined text-[20px]">history</span>
            <span class="hidden sm:inline">Riwayat</span>
          </router-link>
          
          <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          
          <div class="flex items-center gap-3">
          <img
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            alt="Profile"
            class="w-8 h-8 rounded-full border border-gray-200"
          />
          <span
            class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block"
            >{{ user.user_metadata?.full_name || user.email }}</span
          >
          <button
            @click="handleLogout"
            class="text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { user, signOut } from "../lib/supabase.js";
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogout = async () => {
  await signOut();
  router.push("/");
};
</script>
