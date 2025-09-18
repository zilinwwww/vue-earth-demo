// useMouseInteraction.ts
import * as THREE from 'three'
import type { CityObject, CityData } from '../types'

interface MouseInteractionOptions {
  camera: THREE.Camera
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  hoverState: {
    visible: boolean
    position: { x: number; y: number }
    cityData: CityData | null
  }
}

export function useMouseInteraction(options: MouseInteractionOptions) {
  const { camera, renderer, scene, hoverState } = options
  
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  let hoveredCity: CityObject | null = null
  
  function onMouseMove(event: MouseEvent) {
    // 更新鼠标位置
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    // 射线检测
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    // 查找城市对象
    let foundCity: CityObject | null = null
    for (const intersect of intersects) {
      // 向上查找父级对象，直到找到有 city userData 的对象
      let currentObject: THREE.Object3D | null = intersect.object
      while (currentObject) {
        if (currentObject.userData?.type === 'city') {
          foundCity = {
            mesh: currentObject,
            getPosition: () => currentObject!.position.clone(),
            name: currentObject.userData.name,
            data: {
              name: currentObject.userData.name,
              lng: currentObject.userData.lng,
              lat: currentObject.userData.lat,
              color: 0xffffff
            }
          }
          break
        }
        currentObject = currentObject.parent
      }
      
      if (foundCity) break
    }
    
    // 处理悬停状态变化
    if (foundCity && foundCity !== hoveredCity) {
      // 新的悬停城市
      hoveredCity = foundCity
      hoverState.visible = true
      hoverState.position = { x: event.clientX, y: event.clientY }
      hoverState.cityData = foundCity.data
      
      // 调用城市的悬停回调
      if (foundCity.mesh.userData.onHover) {
        foundCity.mesh.userData.onHover(foundCity)
      }
    } else if (!foundCity && hoveredCity) {
      // 离开城市
      if (hoveredCity.mesh.userData.onLeave) {
        hoveredCity.mesh.userData.onLeave(hoveredCity)
      }
      hoveredCity = null
      hoverState.visible = false
      hoverState.cityData = null
    } else if (foundCity && hoveredCity && foundCity === hoveredCity) {
      // 更新悬停位置
      hoverState.position = { x: event.clientX, y: event.clientY }
    }
  }
  
  function onMouseLeave() {
    if (hoveredCity) {
      if (hoveredCity.mesh.userData.onLeave) {
        hoveredCity.mesh.userData.onLeave(hoveredCity)
      }
      hoveredCity = null
      hoverState.visible = false
      hoverState.cityData = null
    }
  }
  
  function onMouseClick() {
    if (hoveredCity) {
      console.log(`点击了城市: ${hoveredCity.name}`)
      // 这里可以添加点击城市的处理逻辑
    }
  }
  
  // 添加事件监听器
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  renderer.domElement.addEventListener('mouseleave', onMouseLeave)
  renderer.domElement.addEventListener('click', onMouseClick)
  
  // 清理函数
  function destroy() {
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.domElement.removeEventListener('mouseleave', onMouseLeave)
    renderer.domElement.removeEventListener('click', onMouseClick)
  }
  
  return {
    destroy
  }
}
