<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import JarPhysics from '../components/JarPhysics.vue';
import CameraModal from '../components/CameraModal.vue';
import { 
  Camera, 
  RefreshCw, 
  History, 
  Settings,
  Bell,
  Droplets,
  Flame,
  LayoutDashboard
} from 'lucide-vue-next';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const jarItems = ref([]);
const isLocked = ref(false);
const jarRef = ref(null);
const showCamera = ref(false);
const isAnalyzing = ref(false);

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.reload();
};

const handleShake = () => {
  if (jarRef.value) jarRef.value.shake();
};

const onCapture = async (imageData) => {
  showCamera.value = false;
  isAnalyzing.value = true;
  try {
    const blob = await (await fetch(imageData)).blob();
    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');
    const response = await axiosInstance.post('/food/upload', formData);
    jarItems.value.unshift(response.data);
    if (jarRef.value) jarRef.value.addItem(response.data);
  } catch (err) {
    alert("Analysis failed. Please try again!");
  } finally {
    isAnalyzing.value = false;
  }
};

const fetchTodayData = async () => {
  try {
    const response = await axiosInstance.get('/food/today');
    jarItems.value = response.data.items || [];
    isLocked.value = response.data.status === 'closed';
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
};

onMounted(fetchTodayData);

const totalCalories = computed(() => {
  return jarItems.value.reduce((sum, item) => sum + (item.calories || 0), 0);
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 px-6 font-outfit text-slate-800 relative overflow-x-hidden">
    
    <!-- Top Navigation -->
    <header class="w-full max-w-7xl flex justify-between items-center mb-12">
      <div class="text-xl font-black text-emerald-800 tracking-tight">Food Jar AI</div>
      
      <nav class="hidden md:flex items-center gap-12 text-sm font-semibold text-slate-500">
        <a href="#" class="text-emerald-900 border-b-2 border-emerald-900 pb-1">Jar</a>
        <a href="#" class="hover:text-emerald-700 transition-colors">History</a>
        <a href="#" class="hover:text-emerald-700 transition-colors">Settings</a>
      </nav>

      <div class="flex items-center gap-6">
        <button @click="handleLogout" class="text-xs font-bold text-slate-400 hover:text-brand-pink transition-colors uppercase tracking-widest">Logout</button>
        <button class="text-slate-400 hover:text-slate-600"><Bell class="w-5 h-5" /></button>
        <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
          <img src="https://ui-avatars.com/api/?name=User&background=065f46&color=fff" alt="Profile" />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full flex flex-col items-center max-w-4xl relative">
      <!-- Title Section -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold mb-2">Today's Jar</h1>
        <p class="text-slate-500 font-medium">{{ totalCalories }} / 2,000 kcal filled</p>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container mb-12 shadow-inner">
        <div class="progress-bar-fill" :style="{ width: `${(totalCalories / 2000) * 100}%` }"></div>
      </div>

      <!-- Center Container with Jar & Side Buttons -->
      <div class="relative w-full flex items-center justify-center">
        <!-- The Jar -->
        <div class="w-[420px] h-[650px] glass-jar p-1 relative">
           <JarPhysics ref="jarRef" :items="jarItems" :isLocked="isLocked" />
        </div>

        <!-- Floating Action Buttons (Right) -->
        <div class="absolute right-[5%] lg:right-[15%] flex flex-col gap-6">
          <button @click="showCamera = true" class="btn-circle bg-emerald-800 text-white hover:bg-emerald-900">
            <Camera class="w-7 h-7" />
            <span class="text-[10px] font-bold">Capture<br>Meal</span>
          </button>
          
          <button @click="handleShake" class="btn-circle bg-white text-emerald-800 hover:bg-slate-50">
            <RefreshCw class="w-7 h-7" />
            <span class="text-[10px] font-bold">Shake<br>Jar</span>
          </button>
        </div>
      </div>

      <!-- Bottom Pill Cards -->
      <div class="flex flex-wrap justify-center gap-6 mt-16 w-full">
        <div class="pill-card flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <Flame class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs text-slate-400 font-bold uppercase">Streak</p>
            <p class="text-xl font-bold">5 Days</p>
          </div>
        </div>

        <div class="pill-card flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Droplets class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs text-slate-400 font-bold uppercase">Water</p>
            <p class="text-xl font-bold">3/8 Glasses</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Analyzing Loader -->
    <div v-if="isAnalyzing" class="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
        <p class="font-bold text-emerald-900 tracking-widest uppercase text-xs">Analyzing Meal...</p>
      </div>
    </div>

    <!-- Modals -->
    <CameraModal v-if="showCamera" @capture="onCapture" @close="showCamera = false" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }

/* Mesh Gradient for background */
.bg-mesh {
  background-attachment: fixed;
}
</style>
