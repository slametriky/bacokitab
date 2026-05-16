<script setup>
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import { user } from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

useHead({
  title: 'Beranda - BacoKitab',
});

const menus = [
  {
    title: "Analisa I'rab",
    description: "Analisa teks bahasa Arab, nahwu, shorof, dan i'rab dari teks atau foto.",
    icon: "analytics",
    link: "/analisa",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    title: "Chat AI",
    description: "Tanya jawab seputar tata bahasa Arab dengan asisten AI pintar.",
    icon: "chat",
    link: "/chat",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
  },
  {
    title: "Latihan",
    description: "Uji pemahaman Anda dengan soal-soal latihan interaktif.",
    icon: "menu_book",
    link: "/latihan",
    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
  },
  {
    title: "Hiwar",
    description: "Praktik percakapan bahasa Arab dengan roleplay AI.",
    icon: "forum",
    link: "/hiwar",
    color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
  },
  {
    title: "Tentang",
    description: "Informasi mengenai aplikasi dan fitur BacoKitab.",
    icon: "info",
    link: "/about",
    color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  }
];
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50/50 dark:bg-[#111814]">
    <TheNavbar />
    
    <main class="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-24">
      <div class="mb-8 text-center sm:text-left">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Selamat datang{{ user?.email ? ', ' + user.email.split('@')[0] : '' }}! 👋
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Pilih menu di bawah ini untuk memulai belajar bahasa Arab.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <router-link
          v-for="menu in menus"
          :key="menu.title"
          :to="menu.link"
          class="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group flex flex-col items-start gap-4 active:scale-[0.98]"
        >
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', menu.color]">
            <span class="material-symbols-outlined text-2xl">{{ menu.icon }}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
              {{ menu.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {{ menu.description }}
            </p>
          </div>
        </router-link>
      </div>
    </main>

    <TheFooter />
  </div>
</template>
