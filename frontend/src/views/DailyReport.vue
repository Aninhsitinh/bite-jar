<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { 
  ChevronLeft, 
  Share2, 
  Lock, 
  CircleDot,
  CheckCircle2,
  Share
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const report = ref(null);
const loading = ref(true);

const fetchReport = async () => {
  try {
    const date = route.params.date || new Date().toISOString().split('T')[0];
    const response = await axios.get(`${API_BASE}/report/${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    report.value = response.data;
  } catch (err) {
    console.error("Failed to fetch report");
  } finally {
    loading.value = false;
  }
};

const shareReport = async () => {
  const shareData = {
    title: 'My BiteJar Daily Report',
    text: `Hôm nay mình ăn uống thế nào? ${report.value.summary.verdict}. Xem chi tiết hũ đồ ăn của mình nhé!`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  } catch (err) {
    console.log('Share failed', err);
  }
};

onMounted(fetchReport);
</script>

<template>
  <div v-if="!loading && report" class="min-h-screen bg-[#fdfdff] font-outfit pb-20">
    <!-- Header -->
    <header class="w-full max-w-4xl mx-auto px-6 py-8 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
       <button @click="router.back()" class="flex items-center gap-2 text-emerald-900 font-black tracking-tight uppercase text-xs">
         <ChevronLeft class="w-5 h-5" /> Daily Report
       </button>
       <button @click="shareReport" class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-800 transition-all">
         <Share2 class="w-5 h-5" />
       </button>
    </header>

    <main class="max-w-xl mx-auto px-6 space-y-12">
      <!-- Jar Status -->
      <div class="flex flex-col items-center text-center">
        <div class="relative w-48 h-64 mb-6">
           <!-- Glass Jar Visual -->
           <div :class="report.jar.status === 'closed' ? 'bg-emerald-50' : 'bg-orange-50'" class="absolute inset-0 rounded-[3rem] border-8 border-white shadow-xl flex items-center justify-center">
              <div class="flex flex-col items-center gap-2">
                 <div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center" :class="report.jar.status === 'closed' ? 'text-emerald-400' : 'text-orange-400'">
                    <component :is="report.jar.status === 'closed' ? CheckCircle2 : Lock" class="w-10 h-10" />
                 </div>
                 <p class="text-xs font-black uppercase tracking-widest" :class="report.jar.status === 'closed' ? 'text-emerald-800' : 'text-orange-800'">
                   {{ report.jar.status === 'closed' ? 'Jar Locked' : 'Jar Open' }}
                 </p>
              </div>
           </div>
           <!-- Cap (Only if locked) -->
           <div v-if="report.jar.status === 'closed'" class="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-200 rounded-full border-4 border-white shadow-sm"></div>
        </div>
        <p class="text-xs font-medium text-slate-500 max-w-[200px]">
          {{ report.jar.status === 'closed' ? 'Great job! Your food jar is sealed for the day.' : 'Your jar is still open. Keep adding your meals!' }}
        </p>
      </div>

      <!-- Verdict Card -->
      <div class="bg-white rounded-[3rem] p-10 shadow-lg border border-white space-y-8">
        <div class="flex items-center gap-3">
           <CircleDot class="w-5 h-5 text-emerald-800" />
           <h3 class="text-sm font-black text-emerald-800 uppercase tracking-widest">Your Daily Verdict</h3>
        </div>

        <div :class="report.summary.statusColor" class="p-8 rounded-[2.5rem] text-center">
           <h4 class="text-xl font-black mb-2">"{{ report.summary.verdict.split('!')[0] }}!"</h4>
           <p class="text-sm font-medium opacity-80">{{ report.summary.verdict.split('!')[1] }}</p>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span>Diet Balance</span>
            <span class="text-emerald-800">{{ report.summary.healthyPercent }}% Healthy</span>
          </div>
          <div class="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
             <div class="bg-emerald-800" :style="{ width: `${report.summary.healthyPercent}%` }"></div>
             <div class="bg-orange-400" :style="{ width: `${report.summary.oilyPercent}%` }"></div>
             <div class="bg-rose-500" :style="{ width: `${report.summary.sweetPercent}%` }"></div>
          </div>
          <div class="flex gap-6 justify-center">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-800"></div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">Healthy</span>
             </div>
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-orange-400"></div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">Oily</span>
             </div>
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">Sweet</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Food List -->
      <div class="space-y-6">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">What's in the Jar today</h3>
        <div class="space-y-4">
          <div v-for="item in report.jar.items" :key="item.id" class="bg-white p-6 rounded-[2rem] shadow-sm border border-white flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div :class="item.category === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                 <CircleDot class="w-6 h-6" />
              </div>
              <div>
                <p class="text-sm font-black text-slate-800">{{ item.food_name }}</p>
                <p :class="item.category === 'healthy' ? 'text-emerald-600' : 'text-orange-600'" class="text-[10px] font-bold uppercase tracking-widest">{{ item.category }}</p>
              </div>
            </div>
            <p class="text-xs font-bold text-slate-400">{{ new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
          </div>
        </div>
      </div>

      <!-- Share Button -->
      <button @click="shareReport" class="w-full py-6 bg-emerald-900 text-white rounded-[2.5rem] font-bold flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all">
        <Share class="w-5 h-5" /> Share Report
      </button>
    </main>
  </div>
</template>
