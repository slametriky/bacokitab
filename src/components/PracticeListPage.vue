<template>
  <div
    class="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display"
  >
    <TheNavbar />
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pb-32 space-y-8">
      <div class="flex flex-col gap-2">
        <h2
          class="text-3xl font-black tracking-tight text-[#111814] dark:text-white"
        >
          Daftar Latihan
        </h2>
        <p class="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          Pilih materi bacaan berdasarkan level kemampuan Anda.
        </p>
      </div>

      <!-- Levels -->
      <div class="space-y-12">
        <!-- Pemula (Beginner) -->
        <div class="space-y-4">
          <div
            class="flex items-center gap-3 border-b border-[#dbe6e0] dark:border-white/10 pb-3"
          >
            <span class="material-symbols-outlined text-green-500 text-3xl"
              >local_florist</span
            >
            <h3
              class="text-xl font-bold text-[#111814] dark:text-white tracking-tight"
            >
              Level Pemula (Mubtadi')
            </h3>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <span
              class="material-symbols-outlined text-4xl text-primary animate-spin"
              style="
                font-variation-settings:
                  &quot;FILL&quot; 0,
                  &quot;wght&quot; 700,
                  &quot;GRAD&quot; 0,
                  &quot;opsz&quot; 48;
              "
              >progress_activity</span
            >
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <template v-for="(prac, index) in mubtadiPractices" :key="prac.id">
              <!-- Unlocked State -->
              <router-link
                v-if="!isLocked(index, mubtadiPractices)"
                :to="`/latihan/${prac.id}`"
                class="group bg-white dark:bg-[#1a2f24] rounded-3xl p-6 border border-[#dbe6e0] dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(33,181,115,0.1)] hover:border-primary/50 transition-all block relative overflow-hidden hover:-translate-y-1 duration-300"
              >
                <div
                  class="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform -scale-x-100"
                >
                  <span class="material-symbols-outlined text-8xl"
                    >menu_book</span
                  >
                </div>

                <div
                  class="flex justify-between items-start mb-6 relative z-10"
                >
                  <div
                    class="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[14px]"
                      >stars</span
                    >
                    {{ prac.level === "mubtadi" ? "Mubtadi'" : prac.level }}
                  </div>
                  <span
                    class="material-symbols-outlined text-gray-300 dark:text-gray-600"
                    >radio_button_unchecked</span
                  >
                </div>

                <h4
                  class="arabic-text text-3xl md:text-4xl font-bold text-right mb-2 text-[#111814] dark:text-white relative z-10"
                  dir="rtl"
                >
                  {{ prac.title }}
                </h4>
                <p
                  class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 relative z-10 text-right"
                >
                  {{ prac.description }}
                </p>

                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold relative z-10 pt-4 border-t border-gray-100 dark:border-gray-800"
                >
                  <div
                    v-if="userScores[prac.id]"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border self-start"
                    :class="
                      getScoreClass(
                        userScores[prac.id].score,
                        userScores[prac.id].total,
                      )
                    "
                  >
                    <span class="material-symbols-outlined text-[18px]">{{
                      getScoreIcon(
                        userScores[prac.id].score,
                        userScores[prac.id].total,
                      )
                    }}</span>
                    Nilai Terakhir: {{ userScores[prac.id].score }}/{{
                      userScores[prac.id].total
                    }}
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-1.5 text-gray-400 px-2 py-1.5 font-medium self-start"
                  >
                    Belum dikerjakan
                  </div>
                  <div
                    class="text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end sm:self-auto mt-1 sm:mt-0"
                  >
                    Mulai
                    <span
                      class="material-symbols-outlined text-[18px] font-bold"
                      >arrow_forward</span
                    >
                  </div>
                </div>
              </router-link>

              <!-- Locked State -->
              <div
                v-else
                class="group bg-gray-50 dark:bg-[#111814] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 opacity-60 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[220px]"
              >
                <div class="absolute top-0 right-0 p-4 opacity-10">
                  <span class="material-symbols-outlined text-4xl">lock</span>
                </div>
                <span
                  class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 mb-4 block"
                  >lock</span
                >
                <h4
                  class="arabic-text text-3xl md:text-4xl font-bold text-center mb-2 text-gray-400 dark:text-gray-600"
                  dir="rtl"
                >
                  {{ prac.title }}
                </h4>
                <p class="text-xs text-gray-400 font-medium tracking-wide">
                  Selesaikan materi sebelumnya dengan nilai sempurna (100%)
                  untuk membuka
                </p>
              </div>
            </template>
          </div>
        </div>

        <!-- Menengah (Intermediate) -->
        <div class="space-y-4">
          <div
            class="flex items-center gap-3 border-b border-[#dbe6e0] dark:border-white/10 pb-3"
          >
            <span class="material-symbols-outlined text-blue-500 text-3xl"
              >psychology</span
            >
            <h3
              class="text-xl font-bold text-[#111814] dark:text-white tracking-tight"
            >
              Level Menengah (Mutawassith)
            </h3>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
            <span
              class="material-symbols-outlined text-4xl text-primary animate-spin"
              style="
                font-variation-settings:
                  &quot;FILL&quot; 0,
                  &quot;wght&quot; 700,
                  &quot;GRAD&quot; 0,
                  &quot;opsz&quot; 48;
              "
              >progress_activity</span
            >
          </div>

          <div
            v-else-if="mutawassithPractices.length === 0"
            class="bg-gray-50 dark:bg-[#111814] rounded-3xl p-8 border border-[#dbe6e0] dark:border-gray-800 text-center flex flex-col justify-center items-center py-12 opacity-50"
          >
            <span class="material-symbols-outlined text-gray-400 text-5xl mb-4"
              >hourglass_empty</span
            >
            <p class="text-gray-500 font-bold tracking-wide">
              Kumpulan latihan level menengah akan segera hadir.
            </p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <template
              v-for="(prac, index) in mutawassithPractices"
              :key="prac.id"
            >
              <!-- Unlocked State -->
              <router-link
                v-if="!isLocked(index, mutawassithPractices)"
                :to="`/latihan/${prac.id}`"
                class="group bg-white dark:bg-[#1a2f24] rounded-3xl p-6 border border-[#dbe6e0] dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(33,181,115,0.1)] hover:border-blue-500/50 transition-all block relative overflow-hidden hover:-translate-y-1 duration-300"
              >
                <div
                  class="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform -scale-x-100"
                >
                  <span class="material-symbols-outlined text-8xl"
                    >menu_book</span
                  >
                </div>

                <div
                  class="flex justify-between items-start mb-6 relative z-10"
                >
                  <div
                    class="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[14px]"
                      >stars</span
                    >
                    Mutawassith
                  </div>
                  <span
                    class="material-symbols-outlined text-gray-300 dark:text-gray-600"
                    >radio_button_unchecked</span
                  >
                </div>

                <h4
                  class="arabic-text text-3xl md:text-4xl font-bold text-right mb-2 text-[#111814] dark:text-white relative z-10"
                  dir="rtl"
                >
                  {{ prac.title }}
                </h4>
                <p
                  class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 relative z-10 text-right"
                >
                  {{ prac.description }}
                </p>

                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold relative z-10 pt-4 border-t border-gray-100 dark:border-gray-800"
                >
                  <div
                    v-if="userScores[prac.id]"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border self-start"
                    :class="
                      getScoreClass(
                        userScores[prac.id].score,
                        userScores[prac.id].total,
                      )
                    "
                  >
                    <span class="material-symbols-outlined text-[18px]">{{
                      getScoreIcon(
                        userScores[prac.id].score,
                        userScores[prac.id].total,
                      )
                    }}</span>
                    Nilai Terakhir: {{ userScores[prac.id].score }}/{{
                      userScores[prac.id].total
                    }}
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-1.5 text-gray-400 px-2 py-1.5 font-medium self-start"
                  >
                    Belum dikerjakan
                  </div>
                  <div
                    class="text-blue-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end sm:self-auto mt-1 sm:mt-0"
                  >
                    Mulai
                    <span
                      class="material-symbols-outlined text-[18px] font-bold"
                      >arrow_forward</span
                    >
                  </div>
                </div>
              </router-link>

              <!-- Locked State -->
              <div
                v-else
                class="group bg-gray-50 dark:bg-[#111814] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 opacity-60 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[220px]"
              >
                <div class="absolute top-0 right-0 p-4 opacity-10">
                  <span class="material-symbols-outlined text-4xl">lock</span>
                </div>
                <span
                  class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 mb-4 block"
                  >lock</span
                >
                <h4
                  class="arabic-text text-3xl md:text-4xl font-bold text-center mb-2 text-gray-400 dark:text-gray-600"
                  dir="rtl"
                >
                  {{ prac.title }}
                </h4>
                <p class="text-xs text-gray-400 font-medium tracking-wide">
                  Selesaikan materi sebelumnya dengan nilai sempurna (100%)
                  untuk membuka
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getPractices, getUserPracticeScores } from "../lib/supabase.js";
import { useHead } from "@unhead/vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";

useHead({
  title: "Daftar Latihan - BacoKitab",
  meta: [
    {
      name: "description",
      content:
        "Pilih materi bacaan dan latihan i'rab berdasarkan level kemampuan Anda. Mulai dari level pemula (Mubtadi') hingga lanjutan.",
    },
  ],
});

const practices = ref([]);
const userScores = ref({});
const isLoading = ref(true);

const mubtadiPractices = computed(() => {
  return practices.value.filter((p) => p.level === "mubtadi");
});

const mutawassithPractices = computed(() => {
  return practices.value.filter((p) => p.level === "mutawassith");
});

const isLocked = (index, levelPractices) => {
  if (index === 0) {
    const currentLevel = levelPractices[0]?.level;
    if (currentLevel === "mutawassith" && mubtadiPractices.value.length > 0) {
      const lastMubtadiId =
        mubtadiPractices.value[mubtadiPractices.value.length - 1].id;
      const prevScore = userScores.value[lastMubtadiId];
      if (!prevScore) return true;
      return prevScore.score < prevScore.total;
    }
    return false; // First item of mubtadi is accessible
  }

  const prevPracId = levelPractices[index - 1].id;
  const prevScore = userScores.value[prevPracId];

  // If no previous score, or score is not perfect, lock current item
  if (!prevScore) return true;
  return prevScore.score < prevScore.total;
};

onMounted(async () => {
  try {
    const [practicesData, scoresData] = await Promise.all([
      getPractices(),
      getUserPracticeScores(),
    ]);
    practices.value = practicesData || [];

    const scoresMap = {};
    if (scoresData) {
      scoresData.forEach((s) => {
        scoresMap[s.practice_id] = { score: s.score, total: s.total };
      });
    }
    userScores.value = scoresMap;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const getScoreClass = (score, total) => {
  if (!total) return "";
  const ratio = score / total;
  if (ratio === 1) {
    // 100%
    return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800";
  } else if (ratio >= 0.7) {
    // 70-99%
    return "bg-amber-50 dark:bg-amber-900/20 text-yellow-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  } else {
    // 0-69%
    return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
  }
};

const getScoreIcon = (score, total) => {
  if (!total) return "";
  const ratio = score / total;
  if (ratio === 1) return "military_tech";
  if (ratio >= 0.7) return "star";
  return "local_fire_department";
};
</script>
