/**
 * 鼠标交互处理工具
 * 处理城市悬停、点击等鼠标交互事件
 */
import * as THREE from 'three'
import type { CityObject, CityData } from '../types'

/** 鼠标交互配置选项 */
interface MouseInteractionOptions {
  camera: THREE.Camera                    // 相机对象
  renderer: THREE.WebGLRenderer          // 渲染器对象
  scene: THREE.Scene                     // 场景对象
  hoverState: {                          // 悬停状态管理
    visible: boolean
    position: { x: number; y: number }
    cityData: CityData | null
  }
}

/**
 * 创建鼠标交互系统
 * @param options 交互配置选项
 * @returns 包含销毁方法的对象
 */
export function useMouseInteraction(options: MouseInteractionOptions) {
  const { camera, renderer, scene, hoverState } = options
  
  // ==================== 射线检测系统 ====================
  /** 射线投射器 - 用于检测鼠标指向的 3D 对象 */
  const raycaster = new THREE.Raycaster()
  /** 鼠标标准化坐标（-1 到 1） */
  const mouse = new THREE.Vector2()
  /** 当前悬停的城市对象 */
  let hoveredCity: CityObject | null = null
  
  // ==================== 鼠标移动处理 ====================
  /**
   * 处理鼠标移动事件
   * 检测鼠标指向的城市并更新悬停状态
   */
  function onMouseMove(event: MouseEvent) {
    // 将屏幕坐标转换为标准化设备坐标（-1 到 1）
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    // 从相机位置向鼠标方向发射射线
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    // ==================== 城市对象检测 ====================
    /** 检测到的城市对象 */
    let foundCity: CityObject | null = null
    
    for (const intersect of intersects) {
      // 向上遍历父级对象，查找带有城市标识的对象
      let currentObject: THREE.Object3D | null = intersect.object
      while (currentObject) {
        if (currentObject.userData?.type === 'city') {
          // 构建城市对象
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
    
    // ==================== 悬停状态更新 ====================
    if (foundCity && foundCity !== hoveredCity) {
      // 悬停到新城市
      hoveredCity = foundCity
      hoverState.visible = true
      hoverState.position = { x: event.clientX, y: event.clientY }
      hoverState.cityData = foundCity.data
      
      // 调用城市悬停回调
      if (foundCity.mesh.userData.onHover) {
        foundCity.mesh.userData.onHover(foundCity)
      }
    } else if (!foundCity && hoveredCity) {
      // 离开当前城市
      if (hoveredCity.mesh.userData.onLeave) {
        hoveredCity.mesh.userData.onLeave(hoveredCity)
      }
      hoveredCity = null
      hoverState.visible = false
      hoverState.cityData = null
    } else if (foundCity && hoveredCity && foundCity === hoveredCity) {
      // 在同一城市内移动，更新悬停位置
      hoverState.position = { x: event.clientX, y: event.clientY }
    }
  }
  
  // ==================== 鼠标离开处理 ====================
  /**
   * 处理鼠标离开渲染区域事件
   * 清除所有悬停状态
   */
  function onMouseLeave() {
    if (hoveredCity) {
      // 调用城市离开回调
      if (hoveredCity.mesh.userData.onLeave) {
        hoveredCity.mesh.userData.onLeave(hoveredCity)
      }
      // 清除悬停状态
      hoveredCity = null
      hoverState.visible = false
      hoverState.cityData = null
    }
  }
  
  // ==================== 鼠标点击处理 ====================
  /**
   * 处理鼠标点击事件
   * 可以扩展为城市选择、详情查看等功能
   */
  function onMouseClick() {
    if (hoveredCity) {
      console.log(`点击了城市: ${hoveredCity.name}`)
      // 这里可以添加点击城市的处理逻辑
      // 例如：显示城市详情、导航到城市等
    }
  }
  
  // ==================== 事件监听器注册 ====================
  // 注册鼠标事件监听器
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  renderer.domElement.addEventListener('mouseleave', onMouseLeave)
  renderer.domElement.addEventListener('click', onMouseClick)
  
  // ==================== 清理函数 ====================
  /**
   * 销毁鼠标交互系统
   * 移除所有事件监听器
   */
  function destroy() {
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.domElement.removeEventListener('mouseleave', onMouseLeave)
    renderer.domElement.removeEventListener('click', onMouseClick)
  }
  
  // ==================== 返回对象 ====================
  return {
    destroy  // 销毁方法
  }
}
