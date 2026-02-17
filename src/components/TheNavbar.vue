<template>
  <nav
    class="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-4 py-3 flex items-center justify-between"
  >
    <router-link
      to="/"
      class="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
    <div class="flex items-center gap-3">
      <button
        class="p-2 text-[#111814] dark:text-white hover:bg-primary/10 rounded-full transition-colors"
      >
        <span class="material-symbols-outlined">history</span>
      </button>
      <button
        class="p-2 text-[#111814] dark:text-white hover:bg-primary/10 rounded-full transition-colors"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
// Navbar logic here if needed
</script>
