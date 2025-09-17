<script setup lang="ts">
// EarthView.vue
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import helvetiker from 'three/examples/fonts/optimer_regular.typeface.json'
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useScene } from './composables/useScene'
import { useEarth } from './composables/useEarth'
import { useCity } from './composables/useCity'
import { useLink } from './composables/useLink'

const containerRef = ref<HTMLDivElement>()

onMounted(() => {
  if (!containerRef.value) return
  const { scene, camera, renderer, controls, earthGroup } = useScene(containerRef.value, 100)
  const { earthMesh, earthParticles, earthGlow } = useEarth(100)
  
  earthGroup.add(earthMesh)
  earthGroup.add(earthParticles)
  earthGroup.add(earthGlow)
  
  const loader = new FontLoader()
  const font = loader.parse(helvetiker)
  // const font = THREE.Font /* 加载字体逻辑 */
  
  const city1 = useCity([116.4, 39.9], '北京', font)
  const city2 = useCity([139.7, 35.6], 'Tokyo', font)
  
  earthGroup.add(city1.mesh)
  earthGroup.add(city2.mesh)
  
  const link = useLink(city1, city2)
  earthGroup.add(link.mesh)
  console.log('Link mesh added to earthGroup:', link.mesh)
  console.log('EarthGroup children count:', earthGroup.children.length)
  
  scene.add(earthGroup)
  
  renderer.setAnimationLoop(() => {
    controls.update()
    TWEEN.update() // 更新TWEEN动画
    // earthGroup.rotation.y += 0.0003
    renderer.render(scene, camera)
  })
})
</script>

<template>
  <div ref="containerRef" class="earth-container" />
</template>

<style scoped>
.earth-container {
  width: 100%;
  height: 90%;
  overflow: hidden;
}
</style>