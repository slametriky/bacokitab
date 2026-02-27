<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <h2 class="text-xl font-bold px-1 text-[#111814] dark:text-white">
        Input Kalimat
      </h2>
      <div class="relative">
        <textarea
          v-model="inputText"
          @paste="handlePaste"
          class="w-full min-h-[160px] p-4 rounded-xl border border-primary/20 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent text-lg placeholder:text-gray-400 transition-all resize-none dark:text-white"
          maxlength="400"
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
            <!-- Camera Input (Direct Capture) -->
            <input
              ref="cameraInput"
              type="file"
              class="hidden"
              accept="image/*"
              capture="environment"
              @change="handleImageUpload"
            />
            <!-- Gallery Input (File Picker) -->
            <input
              ref="galleryInput"
              type="file"
              class="hidden"
              accept="image/*"
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
            >{{ inputText.length }} / 400 karakter</span
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

    <!-- Selection Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isSelectionModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="isSelectionModalOpen = false"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xs overflow-hidden"
        >
          <div class="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="font-bold text-center text-gray-900 dark:text-white">
              Pilih Sumber Gambar
            </h3>
          </div>
          <div
            class="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700"
          >
            <button
              @click="selectCamera"
              class="p-6 flex flex-col items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:bg-gray-100 group"
            >
              <div
                class="p-3 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors"
              >
                <span class="material-symbols-outlined text-2xl"
                  >photo_camera</span
                >
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200"
                >Kamera</span
              >
            </button>
            <button
              @click="selectGallery"
              class="p-6 flex flex-col items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:bg-gray-100 group"
            >
              <div
                class="p-3 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors"
              >
                <span class="material-symbols-outlined text-2xl">image</span>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200"
                >Galeri</span
              >
            </button>
          </div>
          <button
            @click="isSelectionModalOpen = false"
            class="w-full p-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50 transition-colors border-t border-gray-100 dark:border-gray-700"
          >
            Batal
          </button>
        </div>
      </div>
    </Transition>

    <!-- Webcam Modal (Desktop) -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isWebcamModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        @click.self="closeWebcamModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div
            class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"
          >
            <h3 class="font-bold text-gray-900 dark:text-white">Ambil Foto</h3>
            <button
              @click="closeWebcamModal"
              class="text-gray-500 hover:text-red-500 transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div
            class="relative bg-black flex-1 flex items-center justify-center overflow-hidden"
          >
            <video
              ref="videoRef"
              autoplay
              playsinline
              class="w-full h-full object-contain"
            ></video>
            <canvas ref="canvasRef" class="hidden"></canvas>
          </div>
          <div
            class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4"
          >
            <button
              @click="captureWebcam"
              class="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95"
            >
              <span class="material-symbols-outlined">camera</span>
              Ambil Gambar
            </button>
            <button
              @click="closeWebcamModal"
              class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Crop Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isCropModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="closeCropModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]"
        >
          <div
            class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10"
          >
            <h3 class="font-bold text-gray-900 dark:text-white">
              Potong Gambar
            </h3>
            <button
              @click="closeCropModal"
              class="text-gray-500 hover:text-red-500 transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div
            class="flex-1 bg-black relative overflow-hidden flex items-center justify-center p-4"
          >
            <cropper
              ref="cropImageRef"
              :src="cropImageUrl"
              class="max-h-[60vh] w-full"
              :stencil-props="{
                handlers: {},
                movable: true,
                scalable: true,
              }"
              :resize-image="{
                adjustStencil: false,
              }"
              image-restriction="stencil"
            />
          </div>
          <div
            class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4 bg-white dark:bg-gray-800 z-10"
          >
            <button
              @click="confirmCrop"
              class="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95"
            >
              <span class="material-symbols-outlined">crop</span>
              Proses
            </button>
            <button
              @click="closeCropModal"
              class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import Tesseract from "tesseract.js";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

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

  const isAndroid = /Android/i.test(navigator.userAgent);

  recognition.onresult = (event) => {
    let fullTranscript = "";

    if (isAndroid) {
      // Android Chrome bug: the recognizer returns the cumulative transcript
      // of the entire session in the very last result item.
      fullTranscript = event.results[event.results.length - 1][0].transcript;
    } else {
      // Desktop Chrome: the recognizer returns incremental chunks,
      // so we must concatenate them all.
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
    }

    tempTranscript = fullTranscript;
    inputText.value = tempTranscript; // Show real-time feedback
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
      if (tempTranscript.length > 400) {
        tempTranscript = tempTranscript.substring(0, 400);
        triggerToast("Teks dipotong (maks 400 karakter).");
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
  // Instead of clicking input directly, open selection modal
  isSelectionModalOpen.value = true;
};

// Selection Modal Logic
const isSelectionModalOpen = ref(false);
const cameraInput = ref(null);
const galleryInput = ref(null);

// Webcam Modal Logic
const isWebcamModalOpen = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
let mediaStream = null;

const startWebcam = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
    }
  } catch (err) {
    console.error("Error accessing webcam:", err);
    triggerToast("Gagal mengakses kamera: " + err.message);
    isWebcamModalOpen.value = false;
  }
};

const stopWebcam = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
};

const closeWebcamModal = () => {
  stopWebcam();
  isWebcamModalOpen.value = false;
};

const captureWebcam = () => {
  if (!videoRef.value || !canvasRef.value) return;

  const context = canvasRef.value.getContext("2d");
  canvasRef.value.width = videoRef.value.videoWidth;
  canvasRef.value.height = videoRef.value.videoHeight;
  context.drawImage(videoRef.value, 0, 0);

  canvasRef.value.toBlob((blob) => {
    const file = new File([blob], "webcam-capture.png", { type: "image/png" });
    const event = { target: { files: [file] } };
    handleImageUpload(event);
    closeWebcamModal();
  }, "image/png");
};

const selectCamera = () => {
  isSelectionModalOpen.value = false;

  // Simple check for mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  if (isMobile) {
    // Use native camera input on mobile
    cameraInput.value.click();
  } else {
    // Open custom webcam modal on desktop
    isWebcamModalOpen.value = true;
    // Wait for modal transition then start camera
    setTimeout(() => {
      startWebcam();
    }, 300);
  }
};

const selectGallery = () => {
  isSelectionModalOpen.value = false;
  galleryInput.value.click();
};

const resizeImage = (file, maxDimension = 1024) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          0.7, // Quality compression
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Crop Logic
const isCropModalOpen = ref(false);
const cropImageRef = ref(null); // Ref to the cropper component
const cropImageUrl = ref("");

const openCropModal = (file) => {
  isCropModalOpen.value = true;
  // Create URL for the file
  cropImageUrl.value = URL.createObjectURL(file);
};

const closeCropModal = () => {
  isCropModalOpen.value = false;
  if (cropImageUrl.value) {
    URL.revokeObjectURL(cropImageUrl.value);
    cropImageUrl.value = "";
  }
  // Reset inputs
  if (cameraInput.value) cameraInput.value.value = "";
  if (galleryInput.value) galleryInput.value.value = "";
};

const confirmCrop = () => {
  if (!cropImageRef.value) {
    console.error("Cropper component not found");
    return;
  }

  const { canvas } = cropImageRef.value.getResult();

  if (canvas) {
    canvas.toBlob((blob) => {
      const file = new File([blob], "cropped-image.png", { type: "image/png" });
      processOcr(file);
      closeCropModal();
    }, "image/png");
  }
};

const handlePaste = async (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      event.preventDefault();
      let file = items[i].getAsFile();
      if (!file) continue;

      if (file.size > 1024 * 1024 || file.type.startsWith("image/")) {
        triggerToast("Mengoptimalkan gambar dari clipboard...");
        try {
          const resizedBlob = await resizeImage(file);
          file = new File([resizedBlob], "pasted-image.png", {
            type: file.type,
          });
        } catch (e) {
          console.error("Resize error", e);
        }
      }

      // Bypass crop modal and process directly
      processOcr(file);
      break;
    }
  }
};

const handleImageUpload = async (event) => {
  let file = event.target.files[0];
  if (!file) return;

  // Resize first for performance, then crop
  if (file.size > 1024 * 1024 || file.type.startsWith("image/")) {
    triggerToast("Mengoptimalkan gambar...");
    try {
      const resizedBlob = await resizeImage(file);
      file = new File([resizedBlob], file.name, { type: file.type });
    } catch (e) {
      console.error("Resize error", e);
    }
  }

  // Open Crop Modal instead of direct processing
  openCropModal(file);
};

const processOcr = async (file) => {
  isOcrLoading.value = true;
  ocrProgress.value = 0;
  triggerToast("Memproses teks...");

  try {
    const processedFile = await preprocessImage(file);

    const {
      data: { text },
    } = await Tesseract.recognize(
      processedFile,
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

      if (newText.length > 400) {
        newText = newText.substring(0, 400);
        triggerToast("Teks dipotong (maks 400 karakter).");
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
  }
};

const preprocessImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalBrightness = 0;

        // 1. Grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = gray;
          totalBrightness += gray;
        }

        // 2. Adaptive Binarization
        const avgBrightness = totalBrightness / (data.length / 4);
        const threshold = avgBrightness * 0.9; // Adjustable factor

        for (let i = 0; i < data.length; i += 4) {
          const v = data[i] > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = v;
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
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
