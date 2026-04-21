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
          Pilih Percakapan
        </h2>
        <p class="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          Tingkatkan kemampuan berbicara bahasa Arab Anda melalui simulasi
          dialog interaktif sehari-hari.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <article
          v-for="item in conversations"
          :key="item.id"
          class="group bg-white dark:bg-[#1a2f24] rounded-3xl p-6 border border-[#dbe6e0] dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(33,181,115,0.1)] transition-all block relative overflow-hidden hover:-translate-y-1 duration-300 hover:border-primary/50"
        >
          <div
            class="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform -scale-x-100"
          >
            <span class="material-symbols-outlined text-8xl">chat</span>
          </div>

          <h4
            class="arabic-text text-2xl md:text-3xl font-bold text-right mb-2 text-[#111814] dark:text-white relative z-10"
            dir="rtl"
          >
            {{ item.title }}
          </h4>
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold relative z-10 pt-4 border-t border-gray-100 dark:border-gray-800"
          >
            <div></div>
            <button
              @click="startConversation(item)"
              class="flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end sm:self-auto mt-1 sm:mt-0 text-primary"
            >
              Mulai
              <span class="material-symbols-outlined text-[18px] font-bold"
                >arrow_forward</span
              >
            </button>
          </div>
        </article>
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import TheNavbar from "./TheNavbar.vue";
import TheFooter from "./TheFooter.vue";
import { getHiwars } from "../lib/supabase.js";

useHead({
  title: "Hiwar Bahasa Arab - BacoKitab",
  meta: [
    {
      name: "description",
      content: "Belajar hiwar bahasa Arab dengan simulasi dialog interaktif.",
    },
  ],
});

const router = useRouter();

const conversations = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const data = await getHiwars();
    if (data) {
      conversations.value = data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const startConversation = (item) => {
  router.push(`/hiwar/${item.id}`);
};
</script>
