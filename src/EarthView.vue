<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'
import { useScene } from './composables/useScene'
import { useEarth } from './composables/useEarth'
import { useCity } from './composables/useCity'
import { useLink } from './composables/useLink'
import { useMouseInteraction } from './composables/useMouseInteraction'
import CityTooltip from './components/CityTooltip.vue'
import type { CityObject, CityData } from './types'

const containerRef = ref<HTMLDivElement>()

// 悬停状态
const hoverState = reactive({
  visible: false,
  position: { x: 0, y: 0 },
  cityData: null as CityData | null
})

// 鼠标交互实例
let mouseInteraction: any = null

onMounted(() => {
  if (!containerRef.value) return
  const { scene, camera, renderer, controls, earthGroup } = useScene(containerRef.value, 100)
  const { earthMesh, earthParticles, earthGlow } = useEarth(100)
  
  earthGroup.add(earthMesh)
  earthGroup.add(earthParticles)
  earthGroup.add(earthGlow)
  
  // --- 数据定义 ---
  const cityData: CityData[] = [
    { name: '深圳', lng: 114.0579, lat: 22.5431, color: 0xffffff },
    { name: '北京', lng: 116.4, lat: 39.9, color: 0xffffff },
    { name: '上海', lng: 121.4737, lat: 31.2304, color: 0xffffff },
    { name: '西安', lng: 108.9402, lat: 34.3416, color: 0xffffff },
    { name: '南京', lng: 118.7969, lat: 32.0603, color: 0xffffff },
    { name: '杭州', lng: 120.1551, lat: 30.2741, color: 0xffffff },
    { name: '东莞', lng: 113.7463, lat: 23.0223, color: 0xffffff },
    { name: '成都', lng: 104.0668, lat: 30.5728, color: 0xffffff },
  ]
  
  // --- 场景对象创建 ---
  const cityObjects: CityObject[] = cityData.map(city => {
    const cityObj = useCity([city.lng, city.lat], city.name, { 
      color: city.color,
      onHover: (cityObj) => {
        console.log(`悬停在城市: ${cityObj.name}`)
      },
      onLeave: (cityObj) => {
        console.log(`离开城市: ${cityObj.name}`)
      }
    })
    earthGroup.add(cityObj.mesh)
    console.log(`添加城市 ${city.name} 到场景，userData:`, cityObj.mesh.userData)
    return { ...cityObj, data: city }
  })
  
  // --- 调用画线函数 ---
  const beijing = cityObjects.find(c => c.data.name === '北京');
  const shenzhen = cityObjects.find(c => c.data.name === '深圳');

  if (beijing && shenzhen) {
    const link = useLink(beijing, shenzhen, {
      appearDuration: 3000,
      stayDuration: 1000,
      disappearDuration: 3000,
    });
    earthGroup.add(link.mesh); // 放回 earthGroup
  }
  
  scene.add(earthGroup)
  
  // --- 设置初始相机位置 ---
  if (shenzhen) {
      const shenzhenPos = shenzhen.getPosition()
      camera.position.set(shenzhenPos.x * 2.5, shenzhenPos.y * 2.5, shenzhenPos.z * 2.5)
      controls.target.set(0, 0, 0) // 旋转中心是地球
  }
  
  // --- 初始化鼠标交互 ---
  mouseInteraction = useMouseInteraction({ camera, renderer, scene, hoverState })
  
  // --- 渲染循环 ---
  let animationFrameId: number;
  const animate = () => {
    controls.update()
    TWEEN.update()
    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animate);
  }
  animate();

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    if (mouseInteraction) {
      mouseInteraction.destroy();
    }
    // 可以在这里添加更多的清理逻辑
  });
})
</script>

<template>
  <div class="earth-wrapper">
    <div ref="containerRef" class="earth-container" />
    <CityTooltip 
      :visible="hoverState.visible"
      :position="hoverState.position"
      :city-data="hoverState.cityData"
    />
  </div>
</template>

<style scoped>
.earth-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}

.earth-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>