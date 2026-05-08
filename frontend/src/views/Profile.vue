<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { 
  ChevronLeft, 
  Clock, 
  User, 
  Bell, 
  Settings, 
  CircleDot,
  Bot,
  ChevronRight
} from 'lucide-vue-next';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const profile = ref(null);
const recentJars = ref([]);

const fetchProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    profile.value = response.data.user;
    recentJars.value = response.data.recent_jars;
  } catch (err) {
    console.error("Failed to fetch profile");
  }
};

const updatePreference = async (key, value) => {
  try {
    await axios.put(`${API_BASE}/user/profile`, { [key]: value }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProfile();
  } catch (err) {
    alert("Update failed");
  }
};

onMounted(fetchProfile);
</script>

<template>
  <div v-if="profile" class="min-h-screen bg-[#f8fafc] font-outfit pb-20">
    <!-- Header -->
    <header class="w-full max-w-4xl mx-auto px-6 py-8 flex justify-between items-center">
       <router-link to="/" class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-800 transition-all">
         <ChevronLeft class="w-6 h-6" />
       </router-link>
       <h1 class="text-lg font-black text-emerald-800 tracking-tight">Profile</h1>
       <button class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
         <Settings class="w-5 h-5" />
       </button>
    </header>

    <main class="max-w-xl mx-auto px-6 space-y-8">
      <!-- User Card -->
      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-white text-center relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
        <div class="relative inline-block mb-6">
          <img :src="profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=065f46&color=fff`" class="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
          <button class="absolute bottom-0 right-0 w-8 h-8 bg-emerald-800 rounded-full border-2 border-white flex items-center justify-center text-white">
            <Settings class="w-4 h-4" />
          </button>
        </div>
        <h2 class="text-2xl font-bold text-slate-800">{{ profile.username }}</h2>
        <p class="text-slate-400 font-medium text-sm mb-8">{{ profile.email }}</p>

        <div class="flex justify-center gap-4">
          <div class="px-6 py-4 bg-emerald-50 rounded-3xl text-center">
            <p class="text-2xl font-black text-emerald-800">{{ profile.streak }}</p>
            <p class="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Day Streak</p>
          </div>
          <div class="px-6 py-4 bg-orange-50 rounded-3xl text-center">
            <p class="text-2xl font-black text-orange-800">{{ profile.jars_filled }}</p>
            <p class="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest">Jars Filled</p>
          </div>
        </div>
      </div>

      <!-- App Preferences -->
      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-white space-y-8">
        <div class="flex items-center gap-3 mb-4">
          <CircleDot class="w-5 h-5 text-emerald-800" />
          <h3 class="text-sm font-black text-emerald-800 uppercase tracking-widest">App Preferences</h3>
        </div>

        <!-- Cut-off Time -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">Set Cut-off Time</p>
              <p class="text-xs text-slate-400 font-medium">When to finalize your daily jar</p>
            </div>
          </div>
          <select 
            @change="updatePreference('cutoff_time', $event.target.value)"
            class="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none"
          >
            <option value="20:00:00" :selected="profile.cutoff_time === '20:00:00'">08:00 PM</option>
            <option value="22:00:00" :selected="profile.cutoff_time === '22:00:00'">10:00 PM</option>
            <option value="18:00:00" :selected="profile.cutoff_time === '18:00:00'">06:00 PM</option>
          </select>
        </div>

        <!-- AI Personality -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Bot class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">AI Personality</p>
              <p class="text-xs text-slate-400 font-medium">How your jar talks to you</p>
            </div>
          </div>
          <div class="flex bg-slate-50 p-1 rounded-xl">
             <button 
               @click="updatePreference('ai_personality', 'strict')"
               :class="profile.ai_personality === 'strict' ? 'bg-white shadow-sm' : ''"
               class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
             >Strict</button>
             <button 
               @click="updatePreference('ai_personality', 'friendly')"
               :class="profile.ai_personality === 'friendly' ? 'bg-white shadow-sm' : ''"
               class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
             >Friendly</button>
          </div>
        </div>

        <!-- Notifications -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Bell class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">Notification Settings</p>
              <p class="text-xs text-slate-400 font-medium">Daily reminders & updates</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="profile.notifications" @change="updatePreference('notifications', $event.target.checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
          </label>
        </div>
      </div>

      <!-- Last 7 Days Jars -->
      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-white">
        <div class="flex justify-between items-center mb-10">
          <div class="flex items-center gap-3">
             <Settings class="w-5 h-5 text-emerald-800" />
             <h3 class="text-sm font-black text-emerald-800 uppercase tracking-widest">Last 7 Days</h3>
          </div>
          <button class="text-xs font-black text-emerald-800 flex items-center gap-1 uppercase tracking-widest">View All <ChevronRight class="w-4 h-4" /></button>
        </div>
        
        <div class="flex justify-between items-end h-32 gap-2">
           <div v-for="jar in recentJars" :key="jar.id" class="flex flex-col items-center gap-4 flex-1">
              <div class="w-full relative bg-slate-50 rounded-t-xl rounded-b-md overflow-hidden border border-slate-100 h-20">
                 <div class="absolute bottom-0 left-0 w-full bg-emerald-500/20" :style="{ height: `${(jar.total_calories / 2000) * 100}%` }"></div>
              </div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ new Date(jar.date).toLocaleDateString('en-US', { weekday: 'short' }) }}</p>
           </div>
        </div>
      </div>
    </main>
  </div>
</template>
