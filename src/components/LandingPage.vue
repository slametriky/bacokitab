<template>
  <div
    class="bg-background-light dark:bg-background-dark text-[#111814] dark:text-white transition-colors duration-300 min-h-screen font-display"
  >
    <!-- Top Navigation -->
    <header
      class="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#dbe6e0] dark:border-white/10"
    >
      <div
        class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div
            class="bg-primary p-1.5 rounded-lg flex items-center justify-center text-white"
          >
            <span class="material-symbols-outlined dark:text-gray-200"
              >menu_book</span
            >
          </div>
          <h2 class="text-xl font-bold tracking-tight">Bacokitab</h2>
        </div>

        <div class="flex items-center gap-4">
          <!-- Buttons removed as requested -->
        </div>
      </div>
    </header>

    <main>
      <!-- Hero Section -->
      <section class="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32">
        <div
          class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12"
        >
          <div class="flex-1 space-y-6 text-center md:text-left">
            <h1
              class="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-[#111814] dark:text-white"
            >
              Pahami Tata Bahasa Arab Lebih
              <span class="text-primary dark:text-gray-200">Mudah</span> dengan
              AI
            </h1>
            <p
              class="text-lg md:text-xl dark:text-gray-300 leading-relaxed max-w-2xl"
            >
              Analisis I'rab otomatis dari teks, foto, atau suara. Solusi cerdas
              untuk pelajar dan pengajar bahasa Arab di era digital.
            </p>
            <!-- Social Proof -->
            <div v-if="totalUsers > 0" class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-2">
              <div class="flex -space-x-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 border-2 border-white dark:border-background-dark flex items-center justify-center text-blue-600 text-xs font-bold z-30">U</div>
                <div class="w-8 h-8 rounded-full bg-green-100 border-2 border-white dark:border-background-dark flex items-center justify-center text-green-600 text-xs font-bold z-20">A</div>
                <div class="w-8 h-8 rounded-full bg-purple-100 border-2 border-white dark:border-background-dark flex items-center justify-center text-purple-600 text-xs font-bold z-10">S</div>
                <div class="w-8 h-8 rounded-full bg-gray-100 border-2 border-white dark:border-background-dark flex items-center justify-center text-gray-600 text-xs font-bold z-0">+</div>
              </div>
              <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Bergabunglah bersama <strong class="text-[#111814] dark:text-white">{{ totalUsers }}+</strong> pengguna lainnya
              </p>
            </div>

            <div
              class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
            >
              <router-link
                :to="user ? '/analisa' : '/login'"
                class="w-full sm:w-auto min-w-[200px] h-14 bg-primary text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span class="dark:text-gray-200">Coba Sekarang</span>
                <span class="material-symbols-outlined dark:text-gray-200"
                  >arrow_forward</span
                >
              </router-link>
            </div>
          </div>
          <div class="flex-1 w-full relative">
            <div
              class="relative z-10 w-full aspect-square md:aspect-video rounded-3xl bg-white dark:bg-[#1a2f24] shadow-2xl border border-[#dbe6e0] dark:border-white/10 overflow-hidden group"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
              ></div>
              <div
                class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-800 to-[#1a2f24]"
              >
                <!-- Decorative Arabic Typography Background -->
                <div class="absolute inset-0 flex flex-wrap items-center justify-center opacity-5 select-none pointer-events-none overflow-hidden" aria-hidden="true">
                  <span class="text-6xl md:text-8xl font-amiri text-white m-4 rotate-12">النحو</span>
                  <span class="text-7xl md:text-9xl font-amiri text-white m-4 -rotate-6">الصرف</span>
                  <span class="text-5xl md:text-7xl font-amiri text-white m-4 rotate-45">الإعراب</span>
                  <span class="text-8xl md:text-9xl font-amiri text-white m-4 -rotate-12">الكلمة</span>
                  <span class="text-6xl md:text-8xl font-amiri text-white m-4 rotate-6">الفعل</span>
                  <span class="text-7xl md:text-9xl font-amiri text-white m-4 -rotate-12">الاسم</span>
                </div>
                
                <div
                  class="absolute inset-0 bg-black/20"
                ></div>
                <div
                  class="relative z-20 text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
                >
                  <p
                    class="text-white text-3xl font-bold mb-2 dark:text-gray-200"
                  >
                    كَتَبَ الطَّالِبُ الدَّرْسَ
                  </p>
                  <div
                    class="h-1 w-full bg-primary/50 rounded-full overflow-hidden mb-4"
                  >
                    <div class="h-full bg-primary w-2/3"></div>
                  </div>
                  <p
                    class="text-primary-foreground text-xs uppercase tracking-widest font-bold text-white/80 dark:text-gray-200"
                  >
                    Analyzing Sentence Structure...
                  </p>
                </div>
              </div>
            </div>
            <div
              class="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
            ></div>
            <div
              class="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"
            ></div>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section v-if="reviews.length > 0" class="py-16 bg-gray-50/50 dark:bg-background-dark/20 overflow-hidden border-y border-[#dbe6e0] dark:border-white/5">
        <div class="max-w-7xl mx-auto px-4 mb-10 text-center">
          <h3 class="text-3xl font-black text-[#111814] dark:text-white tracking-tight">Apa Kata Mereka?</h3>
        </div>
        
        <div class="marquee-container">
          <!-- First track -->
          <div class="marquee-content">
            <div v-for="review in reviews" :key="review.id" class="flex flex-col bg-white dark:bg-background-dark/60 p-6 rounded-2xl border border-[#dbe6e0] dark:border-white/10 shadow-sm w-80 shrink-0 transition-transform hover:-translate-y-1">
              <div class="flex items-center gap-4 mb-4">
                <img v-if="review.user_avatar" :src="review.user_avatar" class="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="Avatar" />
                <div v-else class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {{ review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                  <h4 class="font-bold text-[#111814] dark:text-white truncate max-w-[180px]">{{ review.user_name || 'Pengguna BacoKitab' }}</h4>
                  <div class="flex text-yellow-400 text-sm">
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                  </div>
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 italic text-[15px] leading-relaxed line-clamp-4">"{{ review.feedback }}"</p>
            </div>
          </div>

          <!-- Second track for seamless loop -->
          <div class="marquee-content" aria-hidden="true">
            <div v-for="review in reviews" :key="'copy-'+review.id" class="flex flex-col bg-white dark:bg-background-dark/60 p-6 rounded-2xl border border-[#dbe6e0] dark:border-white/10 shadow-sm w-80 shrink-0 transition-transform hover:-translate-y-1">
              <div class="flex items-center gap-4 mb-4">
                <img v-if="review.user_avatar" :src="review.user_avatar" class="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="Avatar" />
                <div v-else class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {{ review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                  <h4 class="font-bold text-[#111814] dark:text-white truncate max-w-[180px]">{{ review.user_name || 'Pengguna BacoKitab' }}</h4>
                  <div class="flex text-yellow-400 text-sm">
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                    <span class="material-symbols-outlined text-[16px]">star</span>
                  </div>
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 italic text-[15px] leading-relaxed line-clamp-4">"{{ review.feedback }}"</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-white dark:bg-background-dark/50">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h3
              class="text-3xl md:text-4xl font-black text-[#111814] dark:text-white leading-tight"
            >
              Bedah Kitab Gundul dalam Genggaman
            </h3>
            <p class="text-lg dark:text-gray-200">
              Bacokitab hadir sebagai asisten digital cerdas untuk membantu Anda
              memahami struktur kalimat bahasa Arab secara mendalam. Cukup input
              teks, suara, atau foto, dan biarkan AI kami bekerja untuk Anda.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              class="group p-8 rounded-2xl border border-[#dbe6e0] dark:border-white/10 bg-background-light dark:bg-background-dark/40 hover:border-primary/50 transition-all duration-300"
            >
              <div
                class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform"
              >
                <span
                  class="material-symbols-outlined text-3xl dark:text-gray-200"
                  >bolt</span
                >
              </div>
              <h4 class="text-xl font-bold mb-3">Analisis AI Instan</h4>
              <p class="leading-relaxed dark:text-gray-200">
                Bedah gramatikal (I'rab) akurat dalam hitungan detik.
              </p>
            </div>
            <div
              class="group p-8 rounded-2xl border border-[#dbe6e0] dark:border-white/10 bg-background-light dark:bg-background-dark/40 hover:border-primary/50 transition-all duration-300"
            >
              <div
                class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform"
              >
                <span
                  class="material-symbols-outlined text-3xl dark:text-gray-200"
                  >photo_camera</span
                >
              </div>
              <h4 class="text-xl font-bold mb-3">Multi-Input</h4>
              <p class="leading-relaxed dark:text-gray-200">
                Masukkan teks melalui ketikan, rekaman suara, atau foto kitab.
              </p>
            </div>
            <div
              class="group p-8 rounded-2xl border border-[#dbe6e0] dark:border-white/10 bg-background-light dark:bg-background-dark/40 hover:border-primary/50 transition-all duration-300"
            >
              <div
                class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform"
              >
                <span
                  class="material-symbols-outlined text-3xl dark:text-gray-200"
                  >menu_book</span
                >
              </div>
              <h4 class="text-xl font-bold mb-3">Penjelasan Lengkap</h4>
              <p class="leading-relaxed dark:text-gray-200">
                Otomatis beri harakat, terjemah, dan i'rab Nahwu secara detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section class="py-20 md:py-32">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-16 items-center">
            <div class="flex-1 space-y-12">
              <div class="space-y-4">
                <h2
                  class="text-primary text-base font-bold uppercase tracking-widest text-left"
                >
                  Langkah Mudah
                </h2>
                <h3
                  class="text-3xl md:text-4xl font-black text-[#111814] dark:text-white leading-tight text-left"
                >
                  Mulai Analisis Dalam 3 Langkah Sederhana
                </h3>
              </div>
              <div class="space-y-8">
                <!-- Step 1 -->
                <div class="flex gap-6">
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg"
                  >
                    1
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2">Masukkan Kalimat</h4>
                    <p class="dark:text-gray-200">
                      Ketik kalimat, unggah foto halaman kitab, atau rekam
                      ucapan bahasa Arab Anda.
                    </p>
                  </div>
                </div>
                <!-- Step 2 -->
                <div class="flex gap-6">
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white dark:text-white flex items-center justify-center font-bold text-lg"
                  >
                    2
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2">Proses AI</h4>
                    <p class="dark:text-gray-200">
                      Teknologi kami melakukan pemindaian sintaksis dan
                      morfologi secara real-time.
                    </p>
                  </div>
                </div>
                <!-- Step 3 -->
                <div class="flex gap-6">
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white dark:text-white flex items-center justify-center font-bold text-lg"
                  >
                    3
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2">Hasil Detail</h4>
                    <p class="dark:text-gray-200">
                      Dapatkan tabel I'rab lengkap dengan penjelasan kedudukan
                      setiap kata (Mubtada, Khabar, dll).
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1 w-full flex justify-center">
              <div class="relative w-full max-w-lg">
                <div
                  class="bg-white/50 dark:bg-white/5 rounded-3xl overflow-hidden border border-[#dbe6e0] dark:border-white/10 flex items-center justify-center shadow-xl shadow-primary/5"
                >
                  <img
                    alt="App Screenshot"
                    class="w-full h-auto object-cover"
                    src="/screen.webp"
                    width="400"
                    height="436"
                    fetchpriority="high"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer
      class="bg-white dark:bg-background-dark border-t border-[#dbe6e0] dark:border-white/10 pt-10 pb-6"
    >
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div class="flex items-center gap-2 shrink-0">
            <div
              class="bg-primary p-1.5 rounded-lg flex items-center justify-center text-white"
            >
              <span class="material-symbols-outlined dark:text-gray-200"
                >menu_book</span
              >
            </div>
            <h2 class="text-2xl font-bold tracking-tight">Bacokitab</h2>
          </div>
          <p
            class="leading-relaxed dark:text-gray-200 text-center md:text-left text-sm md:text-base"
          >
            Solusi cerdas berbasis AI untuk menganalisis struktur bahasa Arab
            secara instan dan akurat.
          </p>
        </div>
        <div
          class="pt-6 border-t border-[#dbe6e0] dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p class="text-sm dark:text-gray-200">
            © 2026 Bacokitab. Made with <span class="text-red-500">❤️</span> in
            Palembang.
          </p>
          <div class="flex gap-8 text-sm">
            <a
              class="hover:text-primary transition-colors dark:text-gray-200"
              href="#"
              >Kebijakan Privasi</a
            >
            <a
              class="hover:text-primary transition-colors dark:text-gray-200"
              href="#"
              >Syarat &amp; Ketentuan</a
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { user, getVisibleReviews, getTotalUsers } from '../lib/supabase.js'
import { useHead } from '@unhead/vue'
import { ref, onMounted } from 'vue'

const reviews = ref([])
const totalUsers = ref(0)

onMounted(async () => {
  try {
    totalUsers.value = await getTotalUsers()
    
    const data = await getVisibleReviews()
    // Duplicate reviews to make the marquee longer if there are too few reviews
    // so it doesn't leave an empty space at the end of the scrolling list.
    if (data && data.length > 0 && data.length < 5) {
      reviews.value = [...data, ...data, ...data].slice(0, 5)
    } else {
      reviews.value = data || []
    }
  } catch (err) {
    console.error('Error fetching reviews:', err)
  }
})

useHead({
  title: 'BacoKitab - Aplikasi Analisa I\'rab Bahasa Arab dengan AI',
  meta: [
    {
      name: 'description',
      content: 'Aplikasi AI terbaik untuk analisa I\'rab, Nahwu, dan Shorof secara instan. Membantu pelajar, santri, dan pengajar membaca kitab gundul dan memahami tata bahasa Arab dengan mudah.'
    },
    {
      property: 'og:title',
      content: 'BacoKitab - Aplikasi Analisa I\'rab Bahasa Arab dengan AI'
    },
    {
      property: 'og:description',
      content: 'Aplikasi AI terbaik untuk analisa I\'rab, Nahwu, dan Shorof secara instan. Cara termudah belajar membaca kitab gundul.'
    }
  ]
})
</script>

<style scoped>
.marquee-container {
  display: flex;
  overflow: hidden;
  user-select: none;
  gap: 1.5rem;
  padding-left: 1.5rem;
}
.marquee-content {
  flex-shrink: 0;
  display: flex;
  justify-content: space-around;
  min-width: 100%;
  gap: 1.5rem;
  animation: scroll 80s linear infinite;
}
.marquee-container:hover .marquee-content {
  animation-play-state: paused;
}
@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - 1.5rem));
  }
}
</style>
