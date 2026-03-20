<template>
  <div class="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display overflow-x-hidden">
    <main class="flex-1 max-w-3xl mx-auto w-full px-4 py-6 md:py-10 pb-32 space-y-8">
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="$router.push('/latihan')" class="p-2 sm:p-2.5 bg-white dark:bg-[#1a2f24] hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all shadow-sm border border-[#dbe6e0] dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200">
            <span class="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <h2 class="text-xl sm:text-2xl font-black tracking-tight text-[#111814] dark:text-white">Latihan Membaca</h2>
        </div>
        <div class="hidden sm:flex bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider items-center gap-1">
          <span class="material-symbols-outlined text-sm">stars</span>
          {{ practiceLevel }}
        </div>
      </div>
      
      <div v-if="isLoading" class="flex justify-center py-20 flex-col items-center gap-4">
        <span class="material-symbols-outlined text-5xl text-primary animate-spin" style="font-variation-settings: 'FILL' 0, 'wght' 700, 'GRAD' 0, 'opsz' 48;">progress_activity</span>
        <p class="text-gray-500 font-medium tracking-wide">Menyiapkan Latihan Harakat...</p>
      </div>

      <!-- Practice Area -->
      <div v-else class="bg-white dark:bg-[#1a2f24] rounded-3xl p-6 md:p-10 shadow-sm border border-[#dbe6e0] dark:border-white/10 relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 p-8 opacity-5">
          <span class="material-symbols-outlined text-9xl">menu_book</span>
        </div>
        
        <h3 v-if="title" class="arabic-text text-4xl md:text-5xl font-bold text-center mb-12 text-primary dark:text-gray-100 border-b border-[#dbe6e0] dark:border-white/10 pb-8 relative z-10">{{ title }}</h3>
        
        <div class="space-y-10 relative z-10">
          <p v-for="(para, pIdx) in paragraphs" :key="pIdx" class="arabic-text text-3xl md:text-4xl leading-[4.5rem] md:leading-[5rem] text-right" dir="rtl">
            <template v-for="(seg, idx) in para" :key="idx">
              <span v-if="seg.type === 'text'" class="text-[#111814] dark:text-gray-200">{{ seg.content }}</span>
              <span v-else-if="seg.type === 'question'" class="inline-block mx-1 align-baseline">
                <!-- Idle/Selected state (Waiting to be checked) -->
                <button 
                  v-if="getQuestion(seg.id).status === 'idle'"
                  @click="openOptions(seg.id)"
                  :class="[
                    'transition-all px-4 py-1 rounded-xl border-b-2 transform hover:scale-105 active:scale-95 border-dashed',
                    getQuestion(seg.id).selected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-400 font-bold' 
                      : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 hover:bg-primary/5 hover:text-primary dark:hover:text-primary'
                  ]"
                >
                  {{ getQuestion(seg.id).selected || getQuestion(seg.id).word }}
                </button>
                
                <!-- Checked State: Correct -->
                <span 
                  v-else-if="getQuestion(seg.id).status === 'correct'"
                  class="text-green-600 dark:text-green-400 font-bold px-2 inline-block animate-bounce-short"
                >
                  {{ getQuestion(seg.id).selected }}
                </span>
                
                <!-- Checked State: Wrong -->
                <button 
                  v-else-if="getQuestion(seg.id).status === 'wrong'"
                  @click="openOptions(seg.id)"
                  class="bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-1 rounded-xl border-b-2 border-red-500 border-dashed animate-shake line-through decoration-red-400 dark:decoration-red-600 decoration-2"
                >
                  {{ getQuestion(seg.id).selected }}
                </button>
              </span>
            </template>
          </p>
        </div>
      </div>
      
      <!-- Check Button -->
      <div v-if="!isSubmitted && !isLoading" class="flex justify-center mt-8">
        <button 
          @click="checkAnswers"
          :disabled="!allAnswered"
          class="bg-primary hover:bg-primary-light text-white font-bold py-4 px-12 rounded-2xl w-full md:w-auto shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Periksa Jawaban
        </button>
      </div>

      <!-- Result View -->
      <div v-if="isSubmitted" class="space-y-6">
        <!-- Progress/Score -->
        <div class="flex items-center justify-between bg-white dark:bg-[#1a2f24] p-5 rounded-2xl border border-[#dbe6e0] dark:border-white/10 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <span class="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Skor Berhasil</div>
              <div class="font-black text-lg text-[#111814] dark:text-white">{{ correctCount }} dari {{ questions.length }} Benar</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-1/3 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-500 ease-out" :style="{ width: `${(correctCount / questions.length) * 100}%` }"></div>
          </div>
        </div>
      
      <!-- Success Message -->
      <Transition
        enter-active-class="transition ease-out duration-500 transform"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div v-if="correctCount === questions.length" class="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/20 p-8 rounded-3xl border border-green-200 dark:border-green-800/50 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div class="absolute -top-10 -right-10 text-green-500/10 dark:text-green-400/5 transform rotate-12">
            <span class="material-symbols-outlined" style="font-size: 150px">verified</span>
          </div>
          <span class="material-symbols-outlined text-6xl text-green-500 dark:text-green-400 relative z-10 animate-bounce">task_alt</span>
          <h3 class="text-2xl font-black text-green-800 dark:text-green-300 relative z-10">Alhamdulillah, Luar Biasa!</h3>
          <p class="text-green-700 dark:text-green-400 font-medium relative z-10">Anda berhasil melengkapi semua harakat di paragraf ini dengan tepat.</p>
          <button @click="resetLatihan" class="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/25 active:scale-95 relative z-10 flex items-center gap-2 mx-auto">
            <span class="material-symbols-outlined">refresh</span>
            Ulangi Latihan
          </button>
        </div>
      </Transition>

        <!-- Extra Actions -->
        <div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button @click="showFullText = true" class="text-primary hover:text-primary/80 dark:hover:text-primary-light font-bold flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 px-6 py-3 rounded-2xl transition-all border border-primary/20 dark:border-primary/30 w-full sm:w-auto">
            <span class="material-symbols-outlined">auto_stories</span>
            Lihat Jawaban & Terjemahan Lengkap
          </button>
          <button v-if="correctCount < questions.length" @click="resetLatihan" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 bg-gray-100/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-700 font-bold flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
            <span class="material-symbols-outlined">refresh</span>
            Coba Lagi
          </button>
        </div>
      </div>

    </main>
    <TheFooter />

    <!-- Full Text & Translation Modal -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-200" leave-to-class="opacity-0">
      <div v-if="showFullText" @click="showFullText = false" class="fixed inset-0 bg-black/40 dark:bg-black/60 z-[90] backdrop-blur-sm"></div>
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div v-if="showFullText" class="fixed bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-10 md:bottom-10 z-[100] bg-background-light dark:bg-[#111814] rounded-t-3xl md:rounded-3xl shadow-2xl border border-[#dbe6e0] dark:border-white/10 w-full md:max-w-3xl flex flex-col max-h-[85vh] md:max-h-[min(90vh,800px)]">
        <div class="px-6 py-5 border-b border-[#dbe6e0] dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#1a2f24] rounded-t-3xl">
          <h3 class="text-xl font-black text-[#111814] dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">g_translate</span>
            Kunci Jawaban Teks
          </h3>
          <button @click="showFullText = false" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-10">
          <div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Teks Berharakat Lengkap</h4>
            <p v-for="(p, i) in fullHarakatParagraphs" :key="i" class="arabic-text text-3xl leading-[4.5rem] text-right mb-6 text-[#111814] dark:text-white" dir="rtl">
              {{ p }}
            </p>
          </div>
          <div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Terjemahan Indonesia</h4>
            <p v-for="(p, i) in translationParagraphs" :key="i" class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4 text-justify">
              {{ p }}
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop for Bottom Sheet -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-200" leave-to-class="opacity-0">
      <div v-if="activeQuestionId" @click="activeQuestionId = null" class="fixed inset-0 bg-black/40 dark:bg-black/60 z-[60] backdrop-blur-sm"></div>
    </Transition>

    <!-- Options Bottom Sheet -->
    <Transition
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div v-if="activeQuestionId" class="fixed inset-x-0 bottom-0 z-[70] bg-white dark:bg-[#111814] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_30px_rgba(0,0,0,0.5)] border-t border-[#dbe6e0] dark:border-white/10 p-6 pb-12 max-h-[80vh] overflow-y-auto w-full md:max-w-2xl md:mx-auto">
        <div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-[#111814] dark:text-white tracking-tight">Pilih Harakat yang Tepat</h3>
          <button @click="activeQuestionId = null" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" dir="rtl">
          <button 
            v-for="(opt, idx) in activeQuestion.options" 
            :key="idx"
            @click="selectOption(opt)"
            class="arabic-text text-4xl py-6 rounded-2xl border-2 hover:border-primary transition-all text-[#111814] dark:text-white shadow-sm active:scale-95 flex items-center justify-center"
            :class="activeQuestion.selected === opt ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/20' : 'border-[#dbe6e0] dark:border-gray-700 hover:bg-primary/5 dark:hover:border-primary/50 dark:hover:bg-primary/10'"
          >
            {{ opt }}
          </button>
        </div>
      </div>
    </Transition>
        <!-- Toast Notification -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="toastMessage" 
             class="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2 z-50 text-white"
             :class="toastType === 'correct' ? 'bg-green-500' : 'bg-red-500'">
          <span class="material-symbols-outlined">{{ toastType === 'correct' ? 'check_circle' : 'error' }}</span>
          {{ toastMessage }}
        </div>
      </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPracticeById, savePracticeScore } from '../lib/supabase.js';

const route = useRoute();
const router = useRouter();

const title = ref("");
const practiceLevel = ref("Pemula");
const isLoading = ref(true);

// Master Template with potential questions
let rawParagraphs = [];

const fullHarakatParagraphs = ref([]);
const translationParagraphs = ref([]);

const selectedQuestionIds = ref([]);
const questions = ref([]);
const paragraphs = ref([]);

const showFullText = ref(false);
const isSubmitted = ref(false);

const initRandomPractice = () => {
  if (rawParagraphs.length === 0) return;
  
  // Reset
  questions.value = [];
  selectedQuestionIds.value = [];
  isSubmitted.value = false;
  showFullText.value = false;
  
  // Extract all potential IDs and data
  let allParams = [];
  rawParagraphs.forEach(para => {
    para.forEach(seg => {
      if (seg.type === 'potential_question') {
        allParams.push(seg);
      }
    });
  });
  
  // Shuffle array and pick Top 6
  const shuffled = allParams.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 10);
  
  selected.forEach(q => {
    selectedQuestionIds.value.push(q.id);
    questions.value.push({
      ...q,
      selected: null,
      status: 'idle'
    });
  });
  
  // Build rendering paragraphs
  paragraphs.value = rawParagraphs.map(para => {
    return para.map(seg => {
      if (seg.type === 'potential_question') {
        if (selectedQuestionIds.value.includes(seg.id)) {
          return { type: 'question', id: seg.id };
        } else {
          return { type: 'text', content: seg.word + ' ' }; // Blend in as normal gundul text
        }
      }
      return seg;
    });
  });
};

onMounted(async () => {
  const practiceId = route.params.id;
  const practiceData = await getPracticeById(practiceId);
  
  if (practiceData) {
    title.value = practiceData.title;
    practiceLevel.value = practiceData.level === 'mubtadi' ? "Mubtadi'" : practiceData.level;
    rawParagraphs = practiceData.content_data;
    fullHarakatParagraphs.value = practiceData.full_harakat_text;
    translationParagraphs.value = practiceData.translation_text;
    
    initRandomPractice();
  } else {
    showToast("Gagal memuat latihan, kembali ke menu awal.", "error");
    setTimeout(() => {
      router.push('/latihan');
    }, 2000);
  }
  
  isLoading.value = false;
});

const activeQuestionId = ref(null);
const toastMessage = ref('');
const toastType = ref('');
let toastTimeout = null;

const activeQuestion = computed(() => {
  return questions.value.find(q => q.id === activeQuestionId.value);
});

const getQuestion = (id) => {
  return questions.value.find(q => q.id === id);
};

const correctCount = computed(() => {
  return questions.value.filter(q => q.status === 'correct').length;
});

const showToast = (msg, type) => {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = msg;
  toastType.value = type;
  toastTimeout = setTimeout(() => {
    toastMessage.value = '';
  }, 2000);
};

const allAnswered = computed(() => {
  return questions.value.every(q => q.selected !== null);
});

const openOptions = (id) => {
  activeQuestionId.value = id;
};

const selectOption = (opt) => {
  const q = activeQuestion.value;
  q.selected = opt;
  q.status = 'idle'; // Reset status if they tap to change after submitting
  activeQuestionId.value = null; // close sheet
  
  // If they change answer after submitting previously, reset submission state
  isSubmitted.value = false;
};

const checkAnswers = async () => {
  if (!allAnswered.value) return;
  
  let allCorrect = true;
  questions.value.forEach(q => {
    if (q.selected === q.answer) {
      q.status = 'correct';
    } else {
      q.status = 'wrong';
      allCorrect = false;
    }
  });
  
  isSubmitted.value = true;
  
  // Save to Database (Upsert handles taking the latest score per user + practice)
  await savePracticeScore(route.params.id, correctCount.value, questions.value.length);
  
  if (allCorrect) {
    showToast('Masya Allah, Sempurna!', 'correct');
  } else {
    showToast('Ada beberapa yang kurang tepat, yuk perbaiki!', 'error');
  }
};

const resetLatihan = () => {
  initRandomPractice();
};
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px) rotate(-2deg); }
  50% { transform: translateX(6px) rotate(2deg); }
  75% { transform: translateX(-6px) rotate(-1deg); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-short {
  animation: bounce-short 0.5s ease-in-out;
}
</style>
