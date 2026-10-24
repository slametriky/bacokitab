<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  duration: {
    type: Number,
    default: 1800
  }
});

const isVisible = ref(true);

onMounted(() => {
  const timer = setTimeout(() => {
    isVisible.value = false;
  }, props.duration);

  return () => clearTimeout(timer);
});
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-all duration-500 ease-out"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-105 pointer-events-none"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#111814] select-none px-4"
    >
      <!-- Logo Container -->
      <div class="flex items-center justify-center mb-4">
        <img
          src="/menu_book.svg"
          alt="BacoKitab Logo"
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-contain shadow-md"
        />
      </div>

      <!-- App Name -->
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        Baco<span class="text-primary">kitab</span>
      </h1>

      <!-- Tagline -->
      <p class="mt-1.5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide text-center">
        Semua Bisa Baca Kitab Gundul
      </p>

      <!-- Horizontal Loading Line -->
      <div class="mt-7 w-48 sm:w-56 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative shadow-inner">
        <div class="splash-progress-bar h-full rounded-full bg-gradient-to-r from-primary via-blue-400 to-primary"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash-progress-bar {
  animation: splashProgress 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes splashProgress {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 70%;
    margin-left: 20%;
  }
  100% {
    width: 100%;
    margin-left: 100%;
  }
}
</style>

