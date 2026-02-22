<template>
  <nav
    class="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10"
  >
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center">
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
    </div>
  </nav>
</template>

<script setup>
// Navbar logic here if needed
</script>
