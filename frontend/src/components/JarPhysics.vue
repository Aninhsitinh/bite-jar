<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue';
import Matter from 'matter-js';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  isLocked: {
    type: Boolean,
    default: false
  }
});

const scene = ref(null);
const engine = Matter.Engine.create();
const render = ref(null);
const runner = Matter.Runner.create();

// Handle resizing
const handleResize = () => {
  if (!scene.value || !render.value) return;
  const width = scene.value.clientWidth;
  const height = scene.value.clientHeight;
  
  render.value.canvas.width = width;
  render.value.canvas.height = height;
  render.value.options.width = width;
  render.value.options.height = height;

  Matter.World.clear(engine.world, false);
  createJar(engine.world, width, height);
};

const createJar = (world, width, height) => {
  const thickness = 60;
  const wallColor = 'transparent';
  
  const bottom = Matter.Bodies.rectangle(width / 2, height - thickness / 2, width, thickness, { 
    isStatic: true, 
    render: { fillStyle: wallColor } 
  });
  
  const leftWall = Matter.Bodies.rectangle(thickness / 2, height / 2, thickness, height, { 
    isStatic: true, 
    render: { fillStyle: wallColor } 
  });
  
  const rightWall = Matter.Bodies.rectangle(width - thickness / 2, height / 2, thickness, height, { 
    isStatic: true, 
    render: { fillStyle: wallColor } 
  });

  Matter.World.add(world, [bottom, leftWall, rightWall]);
};

const addItem = (item) => {
  if (!scene.value) return;

  const width = scene.value.clientWidth;
  const isMobile = width < 768;
  const radius = isMobile ? (22 + Math.random() * 10) : (35 + Math.random() * 15);
  const x = Math.random() * (width - 100) + 50;
  
  const body = Matter.Bodies.circle(x, -50, radius, {
    restitution: 0.4,
    friction: 0.3,
    render: {
      sprite: {
        texture: item.image_data,
        xScale: (radius * 2) / 100,
        yScale: (radius * 2) / 100
      }
    }
  });

  Matter.World.add(engine.world, body);
};

const shake = () => {
  const bodies = Matter.Composite.allBodies(engine.world);
  bodies.forEach(body => {
    if (!body.isStatic) {
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * (body.mass * 0.08),
        y: -Math.random() * (body.mass * 0.15)
      });
    }
  });
};

onMounted(() => {
  const width = scene.value.clientWidth;
  const height = scene.value.clientHeight;

  render.value = Matter.Render.create({
    element: scene.value,
    engine: engine,
    options: {
      width,
      height,
      wireframes: false,
      background: 'transparent',
      pixelRatio: window.devicePixelRatio
    }
  });

  createJar(engine.world, width, height);
  
  Matter.Render.run(render.value);
  Matter.Runner.run(runner, engine);

  window.addEventListener('resize', handleResize);
  props.items.forEach(addItem);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  Matter.Render.stop(render.value);
  Matter.Runner.stop(runner);
  Matter.Engine.clear(engine);
});

defineExpose({ shake, addItem });
</script>

<template>
  <div class="relative w-full h-full jar-container-perspective">
    <!-- Visual Jar Container -->
    <div class="absolute inset-0 bg-white/20 backdrop-blur-md rounded-[4rem] border-8 border-white/80 shadow-2xl overflow-hidden">
      <!-- Soft Light Effects -->
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
      
      <!-- Subtle Reflection -->
      <div class="absolute top-0 left-1/4 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
    </div>
    
    <!-- Matter.js Canvas -->
    <div ref="scene" class="w-full h-full relative z-10"></div>

    <!-- Locked State Overlay -->
    <div v-if="isLocked" class="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-[4rem]">
       <div class="bg-white/90 p-6 rounded-3xl shadow-xl text-center border border-white">
          <p class="text-emerald-900 font-black tracking-widest uppercase text-xs">Jar Locked</p>
          <p class="text-[10px] text-slate-500 font-bold mt-1">See you tomorrow!</p>
       </div>
    </div>
  </div>
</template>

<style scoped>
.jar-container-perspective {
  perspective: 1000px;
}
.jar-glass {
  transform: translateZ(0);
}
</style>
