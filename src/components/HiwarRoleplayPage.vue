<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Header -->
    <header
      class="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm"
    >
      <!-- In standard UI back button is on the left. The screenshot seems to have stats icon on the left based on my reading of typical UIs? Actually wait, the screenshot has the back button on the right? No, `<-` is pointing left but is on the right? Wait, I will put back button on left, as standard. -->
      <button
        @click="router.back()"
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        <span class="material-symbols-outlined text-gray-700">arrow_back</span>
      </button>

      <div class="flex flex-col items-center">
        <h1 class="text-xl font-bold text-blue-600 tracking-tight">Hiwar</h1>
        <div
          class="h-1.5 w-12 bg-blue-600 rounded-full mt-1.5 shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
        ></div>
      </div>

      <button
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        <span class="material-symbols-outlined text-gray-700">trending_up</span>
        <!-- Screenshot left icon looks like a stock chart, I'll use trending_up or monitoring -->
      </button>
    </header>

    <!-- Main Content -->
    <main
      class="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-8 flex flex-col items-center relative w-full max-w-2xl mx-auto"
    >
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex justify-center items-center py-20 flex-col gap-4 w-full"
      >
        <span
          class="material-symbols-outlined text-4xl text-blue-500 animate-spin"
          style="font-variation-settings: &quot;wght&quot; 700"
          >progress_activity</span
        >
        <p class="text-gray-500 font-medium">Memuat percakapan...</p>
      </div>

      <template v-else-if="hiwar">
        <!-- Title Badge -->
        <div
          class="bg-gray-100 text-[#111814] px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm"
        >
          {{ hiwar.title }}
          <span class="material-symbols-outlined text-[18px] text-gray-500"
            >bed</span
          >
        </div>

        <!-- Chat Conversation List -->
        <div class="w-full flex flex-col gap-8 pb-4">
          <template v-for="(msg, index) in messages" :key="index">
            <!-- Bot / AI Bubble -->
            <div
              v-if="msg.sender === 'bot'"
              class="flex flex-col w-full relative group"
            >
              <!-- Bubble Container -->
              <div
                class="bg-white rounded-[28px] p-6 pr-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 w-[90%] self-end"
              >
                <div class="flex items-start gap-4" :dir="msg.lang === 'id' ? 'ltr' : 'rtl'">
                  <!-- Bot Text -->
                  <p
                    :class="msg.lang === 'id' ? 'text-lg font-medium text-gray-700 leading-relaxed' : 'arabic-text text-3xl font-black text-[#111814] leading-[1.6]'"
                  >
                    {{ msg.text }}
                  </p>
                </div>

                <!-- Hint Section -->
                <div
                  v-if="msg.hint"
                  class="mt-6 border-t border-gray-100 pt-4"
                  dir="rtl"
                >
                  <button
                    @click="msg.showHint = !msg.showHint"
                    class="flex items-center gap-2 text-blue-600 font-bold mb-3 hover:text-blue-700 transition"
                  >
                    <span
                      class="material-symbols-outlined text-[20px]"
                      :class="{ 'opacity-50': !msg.showHint }"
                      >lightbulb</span
                    >
                    {{
                      msg.showHint
                        ? "Sembunyikan Petunjuk"
                        : "Tampilkan Petunjuk"
                    }}
                  </button>

                  <div
                    v-if="msg.showHint"
                    class="bg-[#f0f5ff] border border-[#d1e0ff] rounded-2xl p-5 relative overflow-hidden"
                  >
                    <div
                      class="absolute top-0 right-0 w-1 h-full bg-blue-500"
                    ></div>
                    <p
                      class="arabic-text text-2xl font-bold text-blue-700 leading-relaxed mb-3"
                    >
                      {{ msg.hint }}
                    </p>
                    <p
                      class="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      Saran Jawaban
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Bubble -->
            <div v-else class="flex flex-col w-[85%] self-start">
              <div
                class="bg-blue-600 rounded-[24px] p-5 shadow-md shadow-blue-600/20"
              >
                <div class="flex items-center gap-4" dir="rtl">
                  <!-- Status icon -->
                  <span
                    class="material-symbols-outlined text-white/80 text-xl flex-shrink-0"
                    >check_circle</span
                  >
                  <p
                    class="arabic-text text-3xl font-bold text-white leading-relaxed"
                  >
                    {{ msg.text }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Live Transcript Bubble -->
          <div v-if="isRecording && tempTranscript" class="flex flex-col w-[85%] self-start">
            <div class="bg-blue-500/80 rounded-[24px] p-5 shadow-sm border border-blue-400 border-dashed animate-pulse">
              <div class="flex items-center gap-4" dir="rtl">
                <!-- Status icon -->
                <span class="material-symbols-outlined text-white/80 text-xl flex-shrink-0 animate-pulse">mic</span>
                <p class="arabic-text text-3xl font-bold text-white leading-relaxed">
                  {{ tempTranscript }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="flex flex-col w-full relative">
            <div
              class="bg-white rounded-[28px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 w-[80%] self-end"
            >
              <div class="flex gap-1 items-center justify-center p-2">
                <div
                  class="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce"
                ></div>
                <div
                  class="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce"
                  style="animation-delay: 0.1s"
                ></div>
                <div
                  class="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce"
                  style="animation-delay: 0.2s"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="flex justify-center py-20 w-full">
        <p class="text-gray-500 font-medium">Data Hiwar tidak ditemukan.</p>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <div class="fixed bottom-0 left-0 w-full z-30 flex justify-center pb-0">
      <div
        class="bg-white w-full max-w-2xl rounded-t-[36px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-8 py-6 h-24 flex items-center justify-center border-t border-gray-100 relative"
      >
        <!-- Mic / Action Button -->
        <button
          v-if="!isConversationFinished"
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @mouseleave="stopRecording"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          :class="
            isRecording
              ? 'scale-110 bg-blue-700 shadow-blue-700/50'
              : 'bg-blue-600 shadow-blue-600/30 hover:scale-105'
          "
          class="absolute bottom-6 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-[0_12px_30px_rgba(37,99,235,0.4)] transition-all duration-300 ease-out border-4 border-white z-40 active:scale-95"
        >
          <div
            v-if="isRecording"
            class="absolute inset-0 rounded-full bg-blue-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"
          ></div>
          <span
            class="material-symbols-outlined text-[36px] mb-1 relative z-10"
            >{{ isRecording ? "mic" : "mic_none" }}</span
          >
          <span v-if="!isRecording" class="text-[9px] font-black tracking-widest relative z-10 text-center leading-tight">TEKAN &<br>BICARA</span>
          <span v-else class="text-[9px] font-black tracking-widest relative z-10 text-center leading-tight">MEREKAM...</span>
        </button>

        <!-- Ulangi Button -->
        <button
          v-else
          @click="restartConversation"
          class="absolute bottom-6 w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 flex flex-col items-center justify-center text-white shadow-[0_12px_30px_rgba(34,197,94,0.4)] transition-all duration-300 ease-out border-4 border-white z-40 active:scale-95"
        >
          <span class="material-symbols-outlined text-[36px] mb-1 relative z-10">refresh</span>
          <span class="text-[9px] font-black tracking-widest relative z-10 text-center leading-tight">ULANGI<br>PERCAKAPAN</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getHiwarById, upsertHiwarHistory } from "../lib/supabase.js";
import { useHead } from "@unhead/vue";

const route = useRoute();
const router = useRouter();

const hiwar = ref(null);
const isLoading = ref(true);
const messages = ref([]);
const currentStep = ref(0);
const isTyping = ref(false);
const isRecording = ref(false);
const isConversationFinished = ref(false);

useHead({
  title: "Hiwar Roleplay - BacoKitab",
  meta: [{ name: "theme-color", content: "#ffffff" }],
});

const getBotMessage = (stepData) => {
  return {
    sender: "bot",
    text: stepData.ai_text,
    hint: stepData.hint_arabic,
    showHint: false,
    lang: "ar",
  };
};

onMounted(async () => {
  const id = route.params.id;
  if (!id) {
    isLoading.value = false;
    return;
  }

  try {
    const data = await getHiwarById(id);
    if (data) {
      hiwar.value = data;

      // Initialize with first step
      if (data.content && data.content.length > 0) {
        currentStep.value = 0;
        messages.value.push(getBotMessage(data.content[0]));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
});

const scrollToBottom = () => {
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 100);
};

const API_URL =
  "https://n8n-fzbuaxc5ergn.perak.sumopod.my.id/webhook/voice-agent";

let recognition = null;
const tempTranscript = ref("");

const initSpeechRecognition = () => {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    alert(
      "Browser anda tidak mendukung fitur pengenalan suara (Speech Recognition).",
    );
    return false;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "ar-SA"; // Bahasa Arab
  recognition.continuous = true;
  recognition.interimResults = true;

  const isAndroid = /Android/i.test(navigator.userAgent);

  recognition.onresult = (event) => {
    let fullTranscript = "";
    if (isAndroid) {
      fullTranscript = event.results[event.results.length - 1][0].transcript;
    } else {
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
    }
    tempTranscript.value = fullTranscript;
    scrollToBottom();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    isRecording.value = false;
  };

  recognition.onend = async () => {
    isRecording.value = false;

    if (!tempTranscript.value || tempTranscript.value.trim() === "") {
      // User didn't say anything or released immediately
      return;
    }

    const finalText = tempTranscript.value;

    isTyping.value = true;
    messages.value.push({
      sender: "user",
      text: finalText,
      lang: "ar",
    });
    scrollToBottom();

    try {
      const contentArray = hiwar.value?.content || [];
      const currentStepData = contentArray[currentStep.value];
      const nextStepData =
        currentStep.value + 1 < contentArray.length
          ? contentArray[currentStep.value + 1]
          : null;

      const result = await sendAnswerToAPI(
        finalText,
        currentStepData,
        nextStepData,
      );

      if (result.isValid) {
        // Update status chat jadi benar
        messages.value[messages.value.length - 1].text += " ✅";

        // Jika ada respons blob (audio), putar audio dan lanjut ke langkah berikutnya
        if (result.blob) {
          const audioUrl = URL.createObjectURL(result.blob);
          const audio = new Audio(audioUrl);
          audio.play();

          advanceConversationStep();
        } else {
          // Tidak ada blob (respons JSON { "is_valid": "true" }) berarti percakapan selesai
          isConversationFinished.value = true;
          
          // Save history
          if (hiwar.value?.id) {
            upsertHiwarHistory(hiwar.value.id).catch(console.error);
          }

          setTimeout(() => {
            messages.value.push({
              sender: "bot",
              text: "🎉 Alhamdulillah, percakapan selesai! Kerja bagus.",
              showHint: false,
              lang: "id",
            });
            scrollToBottom();
          }, 600);
        }
      } else {
        messages.value[messages.value.length - 1].text += " ❌";
        messages.value.push({
          sender: "bot",
          text: "Mohon ulangi lagi dengan lebih jelas atau coba gunakan petunjuk.",
          showHint: false,
          lang: "id",
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error sending answer to n8n:", err);
      messages.value.push({
        sender: "bot",
        text: "Terjadi kesalahan saat memproses jawaban Anda ke server.",
        showHint: false,
        lang: "id",
      });
      scrollToBottom();
    } finally {
      isTyping.value = false;
      tempTranscript.value = ""; // Reset transcript
    }
  };

  return true;
};

const sendAnswerToAPI = async (text, stepData, nextStepData) => {
  const payload = {
    user_input: text,
    step_data: {
      step: stepData.step,
      ai_text: stepData.ai_text,
      target_meaning: stepData.target_meaning,
      hint_arabic: stepData.hint_arabic,
      next_text: nextStepData ? nextStepData.ai_text : "",
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    return { isValid: String(data.is_valid) !== "false", data };
  } else {
    const responseAudioBlob = await response.blob();
    return { isValid: true, blob: responseAudioBlob };
  }
};

const startRecording = () => {
  if (isConversationFinished.value) return;

  if (!recognition) {
    const supported = initSpeechRecognition();
    if (!supported) return;
  }

  tempTranscript.value = "";
  try {
    recognition.start();
    isRecording.value = true;
  } catch (err) {
    console.error("Gagal memulai mic:", err);
  }
};

const stopRecording = () => {
  if (recognition && isRecording.value) {
    recognition.stop();
  }
};

const advanceConversationStep = () => {
  const contentArray = hiwar.value?.content;
  if (!contentArray || currentStep.value >= contentArray.length) return;

  currentStep.value++;

  if (currentStep.value < contentArray.length) {
    messages.value.push(getBotMessage(contentArray[currentStep.value]));
    scrollToBottom();
  }
};

const restartConversation = () => {
  if (hiwar.value && hiwar.value.content && hiwar.value.content.length > 0) {
    messages.value = [];
    currentStep.value = 0;
    isConversationFinished.value = false;
    messages.value.push(getBotMessage(hiwar.value.content[0]));
    scrollToBottom();
  }
};
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
