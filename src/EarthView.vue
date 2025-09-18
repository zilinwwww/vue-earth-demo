<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'
import { useScene } from './composables/useScene'
import { useEarth } from './composables/useEarth'
import { useCity } from './composables/useCity'
import { useLink } from './composables/useLink'
import type { CityObject, CityData } from './types'

const containerRef = ref<HTMLDivElement>()

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
    const cityObj = useCity([city.lng, city.lat], city.name, { color: city.color })
    earthGroup.add(cityObj.mesh)
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
    // 可以在这里添加更多的清理逻辑
  });
})
</script>

<template>
  <div ref="containerRef" class="earth-container" />
</template>

<style scoped>
.earth-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>