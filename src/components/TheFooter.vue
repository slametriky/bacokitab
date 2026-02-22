<template>
  <nav
    class="fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-background-dark border-t border-primary/10 px-6 py-3 pb-4 md:pb-3 flex justify-around items-center"
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
      <span class="material-symbols-outlined text-[28px]">home</span>
      <span class="text-[10px] font-bold uppercase tracking-widest"
        >Beranda</span
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
      <span class="material-symbols-outlined text-[28px]">info</span>
      <span class="text-[10px] font-bold uppercase tracking-widest"
        >Tentang</span
      >
    </router-link>
  </nav>
</template>

<script setup>
// Footer logic here if needed
</script>
