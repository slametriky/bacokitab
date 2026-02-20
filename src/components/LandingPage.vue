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
          <button
            class="text-sm font-bold text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            Masuk
          </button>
          <router-link
            to="/analisa"
            class="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:brightness-105 transition-all text-center flex items-center"
          >
            Mulai
          </router-link>
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
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
            >
              <span class="relative flex h-2 w-2 dark:text-gray-200">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 dark:text-gray-200"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-primary dark:text-gray-200"
                ></span>
              </span>
              Didukung AI Terkini
            </div>
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
              Analisis I'rab otomatis dari teks, foto, atau suara dengan akurasi
              tinggi. Solusi cerdas untuk pelajar dan pengajar bahasa Arab di
              era digital.
            </p>
            <div
              class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
            >
              <router-link
                to="/analisa"
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
                class="absolute inset-0 flex items-center justify-center"
                style="
                  background-image: url(&quot;https://lh3.googleusercontent.com/aida-public/AB6AXuALg6l3Y4LneNl4RZtDYQphjXh4NInPSPwo0V9Zq9OFhHEBH14YitWPe-YfqGtt6Q9cMmkhbz0Mk81vRC5toB6yNALsAPhV34LpKKR3R7RZM0q4p3eaRUf1e-pzD6VmYAh7kaHWbdjk0yBesqDInQIcUEJ-gYMUG9iJDKLs6pk9fGlv6wXcYdyGCSVqYtu8X5RLIcKuDk5caxgMwhZMTYDwj02rp_UYxqjEzJyeizmW8ctS2QpsySS3BFc7QNyuHkajY4mzIRb51I8&quot;);
                  background-size: cover;
                  background-position: center;
                "
              >
                <div
                  class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
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
                    class="w-full h-full object-cover"
                    src="/screen.png"
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

<script setup></script>
