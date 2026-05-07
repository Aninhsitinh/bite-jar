<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Camera, X, RefreshCw, Upload, Image as ImageIcon, Zap, Focus } from 'lucide-vue-next';

const emit = defineEmits(['capture', 'close']);

const video = ref(null);
const canvas = ref(null);
const stream = ref(null);
const isCameraReady = ref(false);
const error = ref(null);

const startCamera = async () => {
  try {
    error.value = null;
    stream.value = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }, 
      audio: false 
    });
    if (video.value) {
      video.value.srcObject = stream.value;
      isCameraReady.value = true;
    }
  } catch (err) {
    console.error("Camera access denied:", err);
    error.value = "CAMERA ACCESS DENIED. PLEASE ENABLE PERMISSIONS OR UPLOAD MANUALLY.";
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
  }
};

const capture = () => {
  if (!video.value || !canvas.value) return;
  
  const context = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  context.drawImage(video.value, 0, 0);
  
  const imageData = canvas.value.toDataURL('image/jpeg', 0.8);
  emit('capture', imageData);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    emit('capture', e.target.result);
  };
  reader.readAsDataURL(file);
};

onMounted(() => {
  startCamera();
});

onUnmounted(() => {
  stopCamera();
});
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-2xl">
    <div class="luminous-card w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[95vh] border-brand-lime/20">
      
      <!-- Top Scanner Bar (Visual) -->
      <div class="absolute top-0 left-0 w-full h-1 bg-brand-lime shadow-[0_0_15px_#affc41] z-50 animate-pulse"></div>

      <!-- Header -->
      <div class="p-6 flex justify-between items-center bg-dark-800/50">
        <div class="flex items-center gap-3">
          <Zap class="w-5 h-5 text-brand-lime" />
          <h2 class="text-sm font-black tracking-[0.2em] uppercase">Meal Scanner v3.0</h2>
        </div>
        <button @click="$emit('close')" class="w-10 h-10 bg-dark-700 hover:bg-brand-pink/20 rounded-xl flex items-center justify-center transition-all group">
          <X class="w-5 h-5 text-slate-500 group-hover:text-brand-pink" />
        </button>
      </div>

      <!-- Viewport -->
      <div class="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <!-- Corner Brackets -->
        <div class="absolute inset-10 border-2 border-brand-lime/20 rounded-4xl pointer-events-none z-20">
          <div class="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-brand-lime rounded-tl-xl"></div>
          <div class="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-brand-lime rounded-tr-xl"></div>
          <div class="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-brand-lime rounded-bl-xl"></div>
          <div class="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-brand-lime rounded-br-xl"></div>
        </div>

        <video 
          v-show="isCameraReady && !error"
          ref="video" 
          autoplay 
          playsinline 
          class="w-full h-full object-cover scale-x-[-1]"
        ></video>
        
        <!-- Loading / Error UI -->
        <div v-if="!isCameraReady && !error" class="flex flex-col items-center gap-4 text-brand-lime">
          <Focus class="w-12 h-12 animate-pulse" />
          <p class="text-xs font-black uppercase tracking-widest">Initializing Optics...</p>
        </div>

        <div v-if="error" class="p-10 text-center space-y-6">
          <div class="w-20 h-20 bg-dark-700 rounded-3xl flex items-center justify-center mx-auto ring-4 ring-brand-pink/20">
             <ImageIcon class="w-10 h-10 text-brand-pink" />
          </div>
          <p class="text-sm font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">{{ error }}</p>
          <label class="btn-luminous inline-flex items-center gap-2 cursor-pointer">
            <Upload class="w-5 h-5" />
            MANUAL UPLOAD
            <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
          </label>
        </div>

        <canvas ref="canvas" class="hidden"></canvas>
      </div>

      <!-- Actions -->
      <div class="p-10 flex items-center justify-between bg-dark-800/80 backdrop-blur-xl">
        <label class="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center cursor-pointer hover:bg-dark-600 transition-all">
          <ImageIcon class="w-6 h-6 text-slate-400" />
          <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
        </label>

        <button 
          @click="capture"
          :disabled="!isCameraReady"
          class="relative group active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <div class="absolute inset-0 bg-brand-lime blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <div class="relative w-20 h-20 bg-brand-lime rounded-full border-8 border-dark-900 flex items-center justify-center">
            <div class="w-2 h-2 bg-dark-900 rounded-full animate-ping"></div>
          </div>
        </button>

        <button @click="startCamera" class="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-all">
          <RefreshCw class="w-6 h-6 text-slate-400" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rounded-4xl { border-radius: 2rem; }
</style>
