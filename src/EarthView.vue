<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'
import { useScene } from './composables/useScene'
import { useEarth } from './composables/useEarth'
import { useCity } from './composables/useCity'
import { useLink } from './composables/useLink'
import { useMouseInteraction } from './composables/useMouseInteraction'
import { useLinkPopup } from './composables/useLinkPopup'
import CityTooltip from './components/CityTooltip.vue'
import LinkPopup from './components/LinkPopup.vue'
import type { CityObject, CityData } from './types'

// ==================== TWEEN 组管理 ====================
/** 创建 TWEEN 组用于管理所有补间动画 */
const tweenGroup = new TWEEN.Group()

// ==================== 响应式数据 ====================
/** 地球容器的 DOM 引用 */
const containerRef = ref<HTMLDivElement>()

/** 城市悬停状态管理 - 必须在组件作用域内定义以在模板中访问 */
const hoverState = reactive({
  visible: false,                    // 是否显示悬停提示
  position: { x: 0, y: 0 },         // 悬停提示位置
  cityData: null as CityData | null  // 当前悬停的城市数据
})

/** 鼠标交互实例 - 用于清理事件监听器 */
let mouseInteraction: { destroy: () => void } | null = null

/** 连线弹窗管理器 */
const linkPopupManager = useLinkPopup({
  duration: 5000,    // 弹窗显示5秒
  offsetY: -100      // 向上偏移100像素
})

// ==================== 组件生命周期 ====================
onMounted(() => {
  // 确保容器元素存在
  if (!containerRef.value) return

  // ==================== 场景初始化 ====================
  /** 创建 Three.js 场景、相机、渲染器和控制器 */
  const { scene, camera, renderer, controls, earthGroup } = useScene(containerRef.value, 100)
  
  /** 创建地球网格、粒子系统和光晕效果 */
  const { earthMesh, earthParticles, earthGlow } = useEarth(100)
  
  // 将地球相关对象添加到地球组中
  earthGroup.add(earthMesh)      // 地球主体
  earthGroup.add(earthParticles) // 粒子效果
  earthGroup.add(earthGlow)      // 光晕效果
  
  // ==================== 城市数据定义 ====================
  /** 全球主要城市数据配置 - 深圳作为中心城市 */
  const cityData: CityData[] = [
    { name: '深圳', lng: 114.0579, lat: 22.5431, color: 0xffffff, labelOffset: { x: 0, y: -4, z: 0 } },
    { name: '北京', lng: 116.4, lat: 39.9, color: 0xffffff, labelOffset: { x: 0, y: 3, z: 0 } },
    { name: '上海', lng: 121.4737, lat: 31.2304, color: 0xffffff, labelOffset: { x: 0, y: 4, z: 0 } },
    { name: '西安', lng: 108.9402, lat: 34.3416, color: 0xffffff, labelOffset: { x: 0, y: 5, z: 0 } },
    { name: '南京', lng: 118.7969, lat: 32.0603, color: 0xffffff, labelOffset: { x: 0, y: 4, z: 0 } },
    { name: '杭州', lng: 120.1551, lat: 30.2741, color: 0xffffff, labelOffset: { x: 0.5, y: -5, z: 0 } },
    { name: '东莞', lng: 113.7463, lat: 23.0223, color: 0xffffff, labelOffset: { x: 4, y: 3, z: 0 } },
    { name: '成都', lng: 104.0668, lat: 30.5728, color: 0xffffff, labelOffset: { x: 0, y: 5, z: 0 } },
  ]
  
  // ==================== 城市对象创建 ====================
  /** 为每个城市创建 3D 对象（点、标签、连接线） */
  const cityObjects: CityObject[] = cityData.map(city => {
    const cityObj = useCity(city, {
      onHover: (cityObj) => {
        // 城市悬停时的回调 - 可用于调试或额外处理
        console.log(`悬停在城市: ${cityObj.name}`)
      },
      onLeave: (cityObj) => {
        // 离开城市时的回调
        console.log(`离开城市: ${cityObj.name}`)
      }
    })
    
    // 将城市对象添加到地球组中
    earthGroup.add(cityObj.mesh)
    
    // 返回包含原始数据的城市对象
    return { ...cityObj, data: city }
  })
  
  // ==================== 飞线动画 ====================
  /** 创建北京到深圳的飞线动画 */
  const beijing = cityObjects.find(c => c.data.name === '北京')
  const shenzhen = cityObjects.find(c => c.data.name === '深圳')

  if (beijing && shenzhen) {
    // 为弹窗管理器添加相机和渲染器引用
    linkPopupManager.camera = camera
    linkPopupManager.renderer = renderer
    
    const link = useLink(beijing, shenzhen, {
      appearDuration: 3000,    // 出现动画时长：3秒
      stayDuration: 1000,      // 停留时长：1秒
      disappearDuration: 3000, // 消失动画时长：3秒
    }, tweenGroup, {  // 传入 TWEEN 组和分辨率
      width: containerRef.value.clientWidth,
      height: containerRef.value.clientHeight
    }, linkPopupManager)  // 传入弹窗管理器
    earthGroup.add(link.mesh)
  }
  
  // 将地球组添加到场景中
  scene.add(earthGroup)
  
  // ==================== 相机初始位置 ====================
  /** 设置相机初始位置，聚焦深圳 */
  if (shenzhen) {
    const shenzhenPos = shenzhen.getPosition()
    // 相机位置设置为深圳位置的 2.5 倍距离
    camera.position.set(shenzhenPos.x * 2.5, shenzhenPos.y * 2.5, shenzhenPos.z * 2.5)
    // 设置旋转中心为地球中心
    controls.target.set(0, 0, 0)
  }
  
  // ==================== 鼠标交互初始化 ====================
  /** 初始化鼠标交互系统，处理城市悬停和点击 */
  mouseInteraction = useMouseInteraction({ camera, renderer, scene, hoverState })
  
  
  // ==================== 渲染循环 ====================
  /** 主渲染循环 - 持续更新场景和动画 */
  let animationFrameId: number
  const animate = (time: number) => {
    controls.update()  // 更新轨道控制器
    // TWEEN.js 25.0.0+ 新 API：使用 TWEEN.Group 更新补间动画
    tweenGroup.update(time)
    
    // 更新弹窗位置（跟随相机变化）
    if (linkPopupManager.popups.length > 0) {
      linkPopupManager.updateAllPopupPositions(camera, renderer)
      linkPopupManager.cleanupExpiredPopups() // 清理过期弹窗
    }
    
    renderer.render(scene, camera)  // 渲染场景
    animationFrameId = requestAnimationFrame(animate)  // 请求下一帧
  }
  animate(0)  // 传入初始时间

  // ==================== 清理函数 ====================
  /** 组件卸载时的清理工作 */
  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)  // 取消动画循环
    if (mouseInteraction) {
      mouseInteraction.destroy()  // 清理鼠标交互
    }
  })
})
</script>

<template>
  <!-- 地球容器包装器 - 提供相对定位以支持绝对定位的悬停提示 -->
  <div class="earth-wrapper">
    <!-- Three.js 渲染器挂载点 -->
    <div ref="containerRef" class="earth-container" />
    
    <!-- 城市悬停提示组件 - 显示城市详细信息 -->
    <CityTooltip 
      :visible="hoverState.visible"
      :position="hoverState.position"
      :city-data="hoverState.cityData"
    />
    
    <!-- 连线弹窗组件 - 显示连线信息 -->
    <LinkPopup :popups="linkPopupManager.popups" />

  </div>
</template>

<style scoped>
/* 地球包装器 - 全屏显示，相对定位以支持悬停提示 */
.earth-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* 地球容器 - Three.js 渲染器挂载点 */
.earth-container {
  width: 100%;
  height: 100%;
  overflow: hidden; /* 隐藏超出部分，确保地球完整显示 */
  position: relative;
  z-index: 100; /* 地球在弹窗之下，但高于其他元素 */
}
</style>