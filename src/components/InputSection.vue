<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-xl font-bold px-1 text-[#111814] dark:text-white">
        Input Kalimat
      </h2>
      <div class="relative">
        <textarea
          v-model="inputText"
          class="w-full min-h-[160px] p-4 rounded-xl border border-primary/20 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent text-lg placeholder:text-gray-400 transition-all resize-none dark:text-white"
          maxlength="300"
          placeholder="Masukkan kalimat bahasa Arab atau Latin di sini..."
        ></textarea>
        <div class="flex items-center justify-between mt-2 px-1">
          <div class="flex gap-2">
            <button
              @click="triggerFileInput"
              :disabled="isOcrLoading"
              class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-wait"
              title="Ambil Foto / OCR"
            >
              <span v-if="isOcrLoading" class="text-xs font-bold"
                >{{ ocrProgress }}%</span
              >
              <span v-else class="material-symbols-outlined">photo_camera</span>
            </button>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept="image/*"
              capture="environment"
              @change="handleImageUpload"
            />
            <button
              @click="toggleSpeech"
              class="p-2 rounded-lg transition-colors border flex items-center justify-center transition-all duration-300"
              :class="
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse ring-2 ring-red-300'
                  : 'text-primary hover:bg-primary/10 border-primary/20'
              "
              title="Input Suara"
            >
              <span class="material-symbols-outlined">{{
                isListening ? "mic_off" : "mic"
              }}</span>
            </button>
            <button
              v-if="inputText.length > 0"
              @click="inputText = ''"
              :disabled="isLoading"
              class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hapus Teks"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
          <span class="text-xs text-gray-500 font-medium"
            >{{ inputText.length }} / 300 karakter</span
          >
        </div>
      </div>
    </div>
    <button
      @click="$emit('analyze', inputText)"
      :disabled="isLoading || !inputText.trim()"
      class="w-full bg-primary hover:bg-primary/90 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-white disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span v-if="isLoading" class="material-symbols-outlined animate-spin"
        >progress_activity</span
      >
      <span>{{
        isLoading ? "Sedang Menganalisis..." : "Analisis Kalimat"
      }}</span>
    </button>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
    >
      <div
        v-if="showToast"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 min-w-max"
      >
        <span class="material-symbols-outlined text-yellow-400">info</span>
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Tesseract from "tesseract.js";

const props = defineProps({
  isLoading: Boolean,
});

const emit = defineEmits(["analyze"]);

const inputText = ref("");
const showToast = ref(false);
const toastMessage = ref("");
let toastTimeout = null;

// Speech Recognition State
const isListening = ref(false);
let recognition = null;
let tempTranscript = "";

const triggerToast = (message) => {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.value = message;
  showToast.value = true;
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const initSpeechRecognition = () => {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    triggerToast("Browser anda tidak mendukung fitur ini.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "ar-SA"; // Default to Arabic
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let fullTranscript = "";

    // Iterate through ALL results to avoid duplication issues on some mobile browsers
    for (let i = 0; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        fullTranscript += event.results[i][0].transcript;
      }
    }

    tempTranscript = fullTranscript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    isListening.value = false;
    triggerToast("Terjadi kesalahan: " + event.error);
  };

  recognition.onend = () => {
    isListening.value = false;

    // Commit the accumulated transcript to inputText
    if (tempTranscript) {
      if (tempTranscript.length > 300) {
        tempTranscript = tempTranscript.substring(0, 300);
        triggerToast("Teks dipotong (maks 300 karakter).");
      } else {
        triggerToast("Teks berhasil ditambahkan.");
      }
      inputText.value = tempTranscript;
    }
  };
};

const toggleSpeech = () => {
  if (!recognition) {
    initSpeechRecognition();
  }

  if (!recognition) return; // Still not available

  if (isListening.value) {
    recognition.stop();
    // onend will handle the state update and text commit
  } else {
    inputText.value = ""; // Clear existing text
    recognition.start();
    isListening.value = true;
    triggerToast("Mendengarkan...");
  }
};

// OCR Logic
const isOcrLoading = ref(false);
const ocrProgress = ref(0);
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isOcrLoading.value = true;
  ocrProgress.value = 0;
  triggerToast("Memproses gambar...");

  try {
    const {
      data: { text },
    } = await Tesseract.recognize(
      file,
      "ara", // Arabic
      {
        logger: (m) => {
          if (m.status === "recognizing text") {
            ocrProgress.value = Math.round(m.progress * 100);
          }
        },
      },
    );

    if (text) {
      // Clear existing text before adding new OCR result
      let newText = text;

      if (newText.length > 300) {
        newText = newText.substring(0, 300);
        triggerToast("Teks dipotong (maks 300 karakter).");
      } else {
        triggerToast("Teks berhasil diekstrak.");
      }

      inputText.value = newText;
    } else {
      triggerToast("Tidak ada teks yang ditemukan.");
    }
  } catch (err) {
    console.error(err);
    triggerToast("Gagal memproses gambar: " + err.message);
  } finally {
    isOcrLoading.value = false;
    ocrProgress.value = 0;
    // Reset file input so same file can be selected again if needed
    if (fileInput.value) fileInput.value.value = "";
  }
};

onMounted(() => {
  // Optional: Check support on mount logic if needed
});

onUnmounted(() => {
  if (recognition && isListening.value) {
    recognition.stop();
  }
});
</script>
