<template>
  <!-- 连线弹窗组件 -->
  <div
    v-for="popup in popups"
    :key="popup.id"
    v-show="popup.visible"
    class="link-popup"
    :style="{
      left: popup.position.x + 'px',
      top: popup.position.y + 'px',
      transform: 'translate(10px, -50%)'
    }"
  >
    <!-- 弹窗内容 -->
    <div class="popup-content">
      <!-- 城市信息 -->
      <div class="cities-info">
        <!-- 起点城市 -->
        <div class="city-item source-city">
          <div class="city-dot"></div>
          <div class="city-name">{{ popup.sourceCity.name }}</div>
        </div>
        
        <!-- 连接箭头 -->
        <div class="connection-arrow">→</div>
        
        <!-- 终点城市 -->
        <div class="city-item target-city">
          <div class="city-dot"></div>
          <div class="city-name">{{ popup.targetCity.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PopupState } from '../composables/useLinkPopup'

/** 组件属性 */
interface Props {
  popups: PopupState[]
}

defineProps<Props>()
</script>

<style scoped>
/* 连线弹窗容器 */
.link-popup {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  animation: popupFadeIn 0.3s ease-out;
  will-change: transform, opacity;
}

/* 弹窗内容 */
.popup-content {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 180px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  position: relative;
  opacity: 0.8;
}

/* 城市信息容器 */
.cities-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 城市项 */
.city-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.city-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.source-city .city-dot {
  background: #00aaff;
  box-shadow: 0 0 6px rgba(0, 170, 255, 0.6);
}

.target-city .city-dot {
  background: #ff6b6b;
  box-shadow: 0 0 6px rgba(255, 107, 107, 0.6);
}

.city-name {
  color: #ffffff;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 连接箭头 */
.connection-arrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

/* 弹窗出现动画 */
@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: translate(10px, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(10px, -50%) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .popup-content {
    min-width: 160px;
    padding: 6px 10px;
  }
  
  .city-name {
    font-size: 10px;
  }
}
</style>
