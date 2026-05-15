<template>
  <div class="h-[100dvh] overflow-hidden flex flex-col bg-background-light dark:bg-background-dark font-display">
    <TheNavbar />
    
    <main class="flex-1 max-w-3xl mx-auto w-full flex flex-col pt-[64px] pb-[75px] md:pb-[70px] min-h-0">
      
      <!-- Messages Area -->
      <div 
        ref="messagesContainer" 
        class="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        <!-- Empty State -->
        <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center opacity-70">
          <span class="material-symbols-outlined text-6xl text-primary/40 mb-4 block">forum</span>
          <h2 class="text-xl font-bold text-[#111814] dark:text-white">Mulai Obrolan</h2>
          <p class="text-sm text-gray-500 mt-2 max-w-sm">
            Tanyakan apa saja seputar bahasa Arab, i'rab, atau topik lainnya kepada AI BacoKitab.
          </p>
        </div>

        <!-- Message Bubbles -->
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div 
            class="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm"
            :class="[
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-sm' 
                : 'bg-white dark:bg-[#1a2f24] text-[#111814] dark:text-gray-100 border border-[#dbe6e0] dark:border-white/10 rounded-bl-sm'
            ]"
          >
            <!-- User Message -->
            <p v-if="msg.role === 'user'" class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
            
            <!-- Assistant Message -->
            <div v-else class="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap" v-html="formatResponse(msg.content)"></div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-4 bg-white dark:bg-[#1a2f24] border border-[#dbe6e0] dark:border-white/10 shadow-sm flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="w-full shrink-0 bg-background-light dark:bg-background-dark p-4 pb-2 md:pb-4 z-40 relative">
        <div class="max-w-3xl mx-auto relative">
          <form @submit.prevent="sendMessage" class="relative flex items-end gap-2 bg-white dark:bg-[#1a2f24] rounded-3xl border border-primary/20 p-2 shadow-lg focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              ref="inputRef"
              v-model="inputText"
              rows="1"
              class="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-4 pr-2 max-h-32 text-[#111814] dark:text-white"
              placeholder="Ketik pesan Anda di sini..."
              @keydown.enter.prevent="handleEnter"
              @input="adjustTextareaHeight"
              :disabled="isLoading"
            ></textarea>
            
            <button 
              type="submit" 
              :disabled="!inputText.trim() || isLoading"
              class="flex-shrink-0 bg-primary text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1"
            >
              <span class="material-symbols-outlined font-bold text-[20px] md:text-[24px]">arrow_upward</span>
            </button>
          </form>
          
          <p class="text-[10px] text-center text-gray-400 mt-2">
            AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
          </p>
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TheNavbar from './TheNavbar.vue';
import TheFooter from './TheFooter.vue';
import { sendChatMessage } from '../services/api.js';
import { useHead } from '@unhead/vue';
import { user } from '../lib/supabase.js';

useHead({
  title: 'Chat AI - BacoKitab',
  meta: [
    {
      name: 'description',
      content: 'Tanya jawab langsung dengan AI BacoKitab untuk memperdalam pemahaman bahasa Arab Anda.'
    }
  ]
});

const router = useRouter();
const messages = ref([
  {
    role: 'assistant',
    content: 'Ahlan wa sahlan! Saya adalah AI asisten dari BacoKitab. Ada yang bisa saya bantu seputar bahasa Arab hari ini?'
  }
]);
const inputText = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);
const inputRef = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const adjustTextareaHeight = () => {
  if (!inputRef.value) return;
  inputRef.value.style.height = 'auto';
  inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 128)}px`; // Max 128px (approx 5 lines)
};

const handleEnter = (e) => {
  if (e.shiftKey) {
    return; // Allow new line
  }
  sendMessage();
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || isLoading.value) return;

  // Add user message
  messages.value.push({
    role: 'user',
    content: text
  });
  
  inputText.value = '';
  adjustTextareaHeight();
  scrollToBottom();
  
  isLoading.value = true;
  
  try {
    const response = await sendChatMessage(text);
    
    messages.value.push({
      role: 'assistant',
      content: response
    });
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: 'Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi.'
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
    // Focus back on input if not on mobile
    if (window.innerWidth > 768 && inputRef.value) {
      inputRef.value.focus();
    }
  }
};

// Very basic markdown to HTML formatter for the response
const formatResponse = (text) => {
  if (!text) return '';
  
  // Convert bold
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert italic
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return formatted;
};

onMounted(() => {
  // Wait for user to be populated or check it
  setTimeout(() => {
    if (!user.value) {
      router.push('/login');
    }
  }, 1000);

  if (window.innerWidth > 768 && inputRef.value) {
    inputRef.value.focus();
  }
});
</script>

<style scoped>
/* Custom scrollbar for messages area */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
}
</style>
