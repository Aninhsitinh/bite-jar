<script setup>
import { CircleDot } from 'lucide-vue-next';

const loginWithGoogle = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  window.location.href = `${API_BASE}/auth/google`;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-mesh font-outfit">
    <div class="w-full max-w-md p-10 bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white text-center">
      <div class="flex justify-center mb-8">
        <div class="w-16 h-16 bg-emerald-800 rounded-3xl flex items-center justify-center shadow-lg">
          <CircleDot class="text-white w-10 h-10" />
        </div>
      </div>
      
      <h1 class="text-3xl font-black text-slate-800 tracking-tight mb-2">Welcome to BiteJar</h1>
      <p class="text-slate-500 font-medium mb-10 text-sm uppercase tracking-widest">Your AI Nutrition Guardian</p>

      <button 
        @click="loginWithGoogle"
        class="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
      >
        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" class="w-6 h-6" alt="Google" />
        <span class="font-bold text-slate-700">Sign in with Google</span>
      </button>

      <p class="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Protected by Gemini AI Intelligence
      </p>
    </div>
  </div>
</template>
