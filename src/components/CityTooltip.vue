<template>
  <div 
    v-if="visible" 
    class="city-tooltip"
    :style="tooltipStyle"
  >
    <div class="city-name">{{ cityData?.name }}</div>
    <div class="city-coords">
      <div>经度: {{ cityData?.lng?.toFixed(4) }}°</div>
      <div>纬度: {{ cityData?.lat?.toFixed(4) }}°</div>
    </div>
    <div class="city-hint">点击查看详情</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CityData } from '../types'

interface Props {
  visible: boolean
  position: { x: number; y: number }
  cityData: CityData | null
}

const props = defineProps<Props>()

const tooltipStyle = computed(() => ({
  left: `${props.position.x + 10}px`,
  top: `${props.position.y - 10}px`,
  display: props.visible ? 'block' : 'none'
}))
</script>

<style scoped>
.city-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  pointer-events: none;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  max-width: 200px;
  line-height: 1.4;
}

.city-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #00DDFF;
}

.city-coords {
  margin-bottom: 5px;
}

.city-hint {
  font-size: 12px;
  color: #ccc;
}
</style>
