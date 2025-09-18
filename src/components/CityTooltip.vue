<template>
  <!-- 城市悬停提示框 - 显示城市详细信息 -->
  <div 
    v-if="visible" 
    class="city-tooltip"
    :style="tooltipStyle"
  >
    <!-- 城市名称 - 突出显示 -->
    <div class="city-name">{{ cityData?.name }}</div>
    
    <!-- 城市坐标信息 -->
    <div class="city-coords">
      <div>经度: {{ cityData?.lng?.toFixed(4) }}°</div>
      <div>纬度: {{ cityData?.lat?.toFixed(4) }}°</div>
    </div>
    
    <!-- 操作提示 -->
    <div class="city-hint">点击查看详情</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CityData } from '../types'

/** 组件属性接口 */
interface Props {
  visible: boolean                    // 是否显示提示框
  position: { x: number; y: number } // 提示框位置
  cityData: CityData | null          // 城市数据
}

// 定义组件属性
const props = defineProps<Props>()

/** 计算提示框样式 - 动态定位 */
const tooltipStyle = computed(() => ({
  left: `${props.position.x + 10}px`,  // 鼠标右侧 10px
  top: `${props.position.y - 10}px`,   // 鼠标上方 10px
  display: props.visible ? 'block' : 'none'  // 根据可见性控制显示
}))
</script>

<style scoped>
/* 城市提示框主容器 */
.city-tooltip {
  position: absolute;                    /* 绝对定位 */
  background: rgba(0, 0, 0, 0.8);      /* 半透明黑色背景 */
  color: white;                         /* 白色文字 */
  padding: 10px 15px;                   /* 内边距 */
  border-radius: 8px;                   /* 圆角 */
  font-size: 14px;                      /* 字体大小 */
  font-family: Arial, sans-serif;       /* 字体族 */
  pointer-events: none;                 /* 禁用鼠标事件，避免阻挡 3D 交互 */
  z-index: 1000;                        /* 高层级，确保显示在最前面 */
  border: 1px solid rgba(255, 255, 255, 0.3);  /* 半透明白色边框 */
  backdrop-filter: blur(10px);          /* 毛玻璃效果 */
  max-width: 200px;                     /* 最大宽度限制 */
  line-height: 1.4;                     /* 行高 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);  /* 阴影效果 */
  transition: opacity 0.2s ease-in-out; /* 透明度过渡动画 */
}

/* 城市名称样式 */
.city-name {
  font-weight: bold;                    /* 粗体 */
  margin-bottom: 5px;                   /* 下边距 */
  color: #00DDFF;                       /* 青色高亮 */
  font-size: 1.1em;                     /* 稍大字体 */
}

/* 坐标信息样式 */
.city-coords {
  margin-bottom: 5px;                   /* 下边距 */
  font-size: 0.9em;                     /* 稍小字体 */
  color: #ccc;                          /* 浅灰色 */
}

/* 操作提示样式 */
.city-hint {
  font-size: 12px;                      /* 小字体 */
  color: #888;                          /* 深灰色 */
  text-align: center;                   /* 居中对齐 */
  margin-top: 8px;                      /* 上边距 */
  padding-top: 5px;                     /* 上内边距 */
  border-top: 1px solid rgba(255, 255, 255, 0.1);  /* 顶部分割线 */
}
</style>
