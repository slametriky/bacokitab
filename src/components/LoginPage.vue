<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-[#1a2f24] rounded-3xl shadow-2xl border border-[#dbe6e0] dark:border-white/10 p-8 space-y-8">
      <div class="text-center">
        <div class="bg-primary w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
          <span class="material-symbols-outlined text-2xl dark:text-gray-200">menu_book</span>
        </div>
        <h2 class="text-3xl font-black text-[#111814] dark:text-white mb-2">Selamat Datang</h2>
        <p class="text-gray-600 dark:text-gray-300">
          Silakan masuk untuk mulai menggunakan fitur analisa Bacokitab.
        </p>
      </div>

      <div class="space-y-4">
        <button
          @click="signInWithGoogle"
          class="w-full h-14 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3 font-bold text-gray-700 dark:text-gray-200"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-6 h-6" />
          Masuk dengan Google
        </button>
      </div>

      <div class="text-center">
        <router-link to="/" class="text-sm text-primary font-medium hover:underline">
          Kembali ke Beranda
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { user, signInWithGoogle } from '../lib/supabase.js'

const router = useRouter()

// If user is already logged in, redirect them to /analisa
watchEffect(() => {
  if (user.value) {
    router.push('/analisa')
  }
})
</script>
