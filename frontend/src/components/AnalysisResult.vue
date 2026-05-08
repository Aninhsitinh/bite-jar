<script setup>
import { X, CircleDot, Flame, CheckCircle2 } from 'lucide-vue-next';

defineProps({
  item: Object,
  show: Boolean
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <div v-if="show && item" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
    <div class="w-full max-w-sm bg-white rounded-[3.5rem] shadow-2xl border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
      
      <!-- Top Action Bar -->
      <div class="p-6 flex justify-center">
        <button @click="emit('close')" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="px-10 pb-10 text-center">
        <!-- Image Circle -->
        <div class="relative w-40 h-40 mx-auto mb-8">
           <img :src="item.image_data" class="w-full h-full rounded-full object-cover border-8 border-white shadow-xl ring-1 ring-slate-100" />
           <div :class="item.category === 'healthy' ? 'bg-emerald-500' : 'bg-orange-500'" class="absolute -bottom-2 right-4 w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
              <CircleDot class="w-5 h-5" />
           </div>
        </div>

        <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-2">{{ item.food_name }}</h2>
        
        <div class="flex justify-center gap-4 mb-6">
           <div class="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Flame class="w-3.5 h-3.5" /> {{ item.calories }} kcal
           </div>
           <div :class="item.category === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <CircleDot class="w-3.5 h-3.5" /> {{ item.category }}
           </div>
        </div>

        <div class="bg-slate-50 p-6 rounded-[2.5rem] mb-10 border border-slate-100">
           <p class="text-sm font-medium text-slate-500 leading-relaxed italic">"{{ item.ai_feedback }}"</p>
        </div>

        <button 
          @click="emit('confirm')"
          class="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
        >
          <CheckCircle2 class="w-5 h-5" /> Drop into Jar
        </button>
      </div>
    </div>
  </div>
</template>
