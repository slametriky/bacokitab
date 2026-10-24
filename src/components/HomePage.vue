<script setup>
import TheNavbar from "./TheNavbar.vue";
import { user } from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

useHead({
  title: "Beranda - BacoKitab",
});

const menus = [
  {
    title: "Analisa I'rab",
    description:
      "Analisa teks bahasa Arab, nahwu, shorof, dan i'rab dari teks atau foto.",
    icon: "analytics",
    link: "/analisa",
    color: "bg-blue-50/80 border border-blue-100 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-400",
  },
  {
    title: "Tashrif",
    description:
      "Jelajahi perubahan bentuk kata bahasa Arab dengan tashrif istilahi dan lughawi.",
    icon: "auto_stories",
    link: "/tashrif",
    color:
      "bg-indigo-50/80 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400",
  },
  {
    title: "Chat AI",
    description:
      "Tanya jawab seputar tata bahasa Arab dengan asisten AI pintar.",
    icon: "chat",
    link: "/chat",
    color:
      "bg-purple-50/80 border border-purple-100 text-purple-600 dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-400",
  },
  {
    title: "Latihan",
    description: "Uji pemahaman Anda dengan soal-soal latihan interaktif.",
    icon: "menu_book",
    link: "/latihan",
    color:
      "bg-amber-50/80 border border-amber-100 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-400",
  },
  {
    title: "Support",
    description: "Butuh bantuan atau punya saran? Silahkan hubungi Developer.",
    icon: "support_agent",
    link: "https://wa.me/62895352414040?text=Assalamualaikum...",
    color: "bg-emerald-50/80 border border-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-400",
    external: true
  },
];
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-100/70 dark:from-slate-950 dark:via-[#0c1222] dark:to-[#080d19]">
    <TheNavbar />

    <main class="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-24">
      <div class="mb-8 text-center sm:text-left">
        <h1
          class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight"
        >
          Selamat datang{{
            user?.email ? ", " + user.email.split("@")[0] : ""
          }}! 👋
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-sm md:text-base font-normal">
          Pilih menu di bawah ini untuk memulai belajar bahasa Arab.
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-4">
        <template v-for="menu in menus" :key="menu.title">
          <router-link
            v-if="!menu.external"
            :to="menu.link"
            class="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-primary/50 dark:hover:border-primary/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.15)] transition-all duration-300 group flex flex-col items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 active:scale-[0.98]"
          >
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mx-auto sm:mx-0 shadow-sm',
                menu.color,
              ]"
            >
              <span class="material-symbols-outlined text-2xl">{{ menu.icon }}</span>
            </div>
            <div class="w-full">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {{ menu.title }}
              </h3>
              <p class="hidden sm:block text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                {{ menu.description }}
              </p>
            </div>
          </router-link>
          <a
            v-else
            :href="menu.link"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-primary/50 dark:hover:border-primary/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.15)] transition-all duration-300 group flex flex-col items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 active:scale-[0.98]"
          >
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mx-auto sm:mx-0 shadow-sm',
                menu.color,
              ]"
            >
              <span class="material-symbols-outlined text-2xl">{{ menu.icon }}</span>
            </div>
            <div class="w-full">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {{ menu.title }}
              </h3>
              <p class="hidden sm:block text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                {{ menu.description }}
              </p>
            </div>
          </a>
        </template>
      </div>
    </main>
  </div>
</template>
