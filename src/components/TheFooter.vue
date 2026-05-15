<template>
  <nav
    class="fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-background-dark border-t border-primary/10 px-2 sm:px-6 py-3 pb-4 md:pb-3 flex justify-around items-center"
  >
    <router-link
      class="flex flex-col items-center gap-1 transition-colors"
      active-class="text-primary"
      inactive-class="text-[#111814] dark:text-white"
      exact-active-class="text-primary"
      :class="[
        $route.path === '/analisa' || $route.path === '/'
          ? 'text-primary'
          : 'text-[#111814] dark:text-white hover:text-primary',
      ]"
      to="/analisa"
    >
      <span class="material-symbols-outlined text-[24px] md:text-[28px]">home</span>
      <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest"
        >Beranda</span
      >
    </router-link>

    <router-link
      v-if="user"
      class="flex flex-col items-center gap-1 transition-colors"
      active-class="text-primary"
      exact-active-class="text-primary"
      :class="[
        $route.path === '/chat'
          ? 'text-primary'
          : 'text-[#111814] dark:text-white hover:text-primary',
      ]"
      to="/chat"
    >
      <span class="material-symbols-outlined text-[24px] md:text-[28px]">chat</span>
      <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest"
        >Chat AI</span
      >
    </router-link>

    <router-link
      v-if="user"
      class="flex flex-col items-center gap-1 transition-colors"
      active-class="text-primary"
      exact-active-class="text-primary"
      :class="[
        $route.path.startsWith('/latihan')
          ? 'text-primary'
          : 'text-[#111814] dark:text-white hover:text-primary',
      ]"
      to="/latihan"
    >
      <span class="material-symbols-outlined text-[24px] md:text-[28px]">menu_book</span>
      <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest"
        >Latihan</span
      >
    </router-link>

    <router-link
      v-if="user"
      class="flex flex-col items-center gap-1 transition-colors"
      active-class="text-primary"
      exact-active-class="text-primary"
      :class="[
        $route.path === '/hiwar'
          ? 'text-primary'
          : 'text-[#111814] dark:text-white hover:text-primary',
      ]"
      to="/hiwar"
    >
      <span class="material-symbols-outlined text-[24px] md:text-[28px]">forum</span>
      <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest"
        >Hiwar</span
      >
    </router-link>

    <router-link
      class="flex flex-col items-center gap-1 transition-colors"
      active-class="text-primary"
      exact-active-class="text-primary"
      :class="[
        $route.path === '/about'
          ? 'text-primary'
          : 'text-[#111814] dark:text-white hover:text-primary',
      ]"
      to="/about"
    >
      <span class="material-symbols-outlined text-[24px] md:text-[28px]">info</span>
      <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest"
        >Tentang</span
      >
    </router-link>
  </nav>
</template>

<script setup>
import { user } from "../lib/supabase.js";
</script>
