/**
 * 连线弹窗管理工具
 * 管理连线出现时城市上方的信息弹窗显示
 */
import { reactive, ref } from 'vue'
import * as THREE from 'three'
import type { CityData } from '../types'

/** 弹窗状态接口 */
export interface PopupState {
  id: string                    // 弹窗唯一标识
  visible: boolean              // 是否显示
  position: { x: number; y: number }  // 弹窗位置
  sourceCity: CityData          // 起点城市信息
  targetCity: CityData          // 终点城市信息
  sourcePosition: { x: number; y: number; z: number }  // 起点3D位置
  startTime: number             // 开始显示时间
}

/** 连线弹窗配置选项 */
interface LinkPopupOptions {
  duration?: number;            // 弹窗显示时长（毫秒）
  offsetY?: number;             // 弹窗相对城市点的Y轴偏移
}

/**
 * 连线弹窗管理工具
 * @param options 配置选项
 * @returns 弹窗管理对象
 */
export function useLinkPopup(options: LinkPopupOptions = {}) {
  // ==================== 参数解构和默认值 ====================
  const {
    duration = 5000,            // 默认显示5秒
    offsetY = -80,              // 默认向上偏移80像素
  } = options

  // ==================== 响应式状态 ====================
  /** 所有弹窗状态 */
  const popups = reactive<PopupState[]>([])
  
  /** 弹窗计数器，用于生成唯一ID */
  const popupCounter = ref(0)

  // ==================== 工具函数 ====================
  /**
   * 生成弹窗唯一ID
   */
  const generatePopupId = (): string => {
    return `popup_${++popupCounter.value}_${Date.now()}`
  }

  /**
   * 将3D世界坐标转换为屏幕坐标
   * @param worldPosition 3D世界坐标
   * @param camera 相机对象
   * @param renderer 渲染器对象
   * @returns 屏幕坐标和可见性
   */
  const worldToScreen = (
    worldPosition: { x: number; y: number; z: number },
    camera: any,
    renderer: any
  ): { x: number; y: number; visible: boolean } => {
    const vector = new THREE.Vector3(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    )
    
    vector.project(camera)
    
    const width = renderer.domElement.clientWidth
    const height = renderer.domElement.clientHeight
    
    // 深度检测：如果点在相机后面，则不可见
    const visible = vector.z < 1
    
    return {
      x: (vector.x * width / 2) + width / 2,
      y: -(vector.y * height / 2) + height / 2,
      visible
    }
  }

  /**
   * 清理过期的弹窗
   */
  const cleanupExpiredPopups = () => {
    const now = Date.now()
    for (let i = popups.length - 1; i >= 0; i--) {
      if (now - popups[i].startTime > duration) {
        popups[i].visible = false
        popups.splice(i, 1)
      }
    }
  }

  // ==================== 主要功能函数 ====================
  /**
   * 显示连线弹窗
   * @param sourceCity 起点城市
   * @param targetCity 终点城市
   * @param sourcePosition 起点3D位置
   * @param camera 相机对象
   * @param renderer 渲染器对象
   */
  const showLinkPopup = (
    sourceCity: CityData,
    targetCity: CityData,
    sourcePosition: { x: number; y: number; z: number },
    camera: any,
    renderer: any
  ) => {
    // 清理过期弹窗
    cleanupExpiredPopups()

    // 计算起点城市的屏幕坐标
    const sourceScreenPos = worldToScreen(sourcePosition, camera, renderer)
    
    // 弹窗位置设置为起点城市位置上方
    const popupX = sourceScreenPos.x
    const popupY = sourceScreenPos.y + offsetY

    // 创建新弹窗
    const popupId = generatePopupId()
    const newPopup: PopupState = {
      id: popupId,
      visible: sourceScreenPos.visible, // 使用深度检测结果
      position: { x: popupX, y: popupY },
      sourceCity,
      targetCity,
      sourcePosition: { ...sourcePosition }, // 保存起点3D位置
      startTime: Date.now()
    }

    popups.push(newPopup)
  }


  /**
   * 隐藏所有弹窗
   */
  const hideAllPopups = () => {
    popups.forEach(popup => {
      popup.visible = false
    })
    popups.length = 0
  }

  /**
   * 更新所有弹窗位置（跟随相机变化）
   * @param camera 相机对象
   * @param renderer 渲染器对象
   */
  const updateAllPopupPositions = (
    camera: any,
    renderer: any
  ) => {
    // 更新所有弹窗位置和可见性
    popups.forEach(popup => {
      // 使用弹窗保存的起点3D位置
      const sourceScreenPos = worldToScreen(popup.sourcePosition, camera, renderer)
      
      popup.position.x = sourceScreenPos.x
      popup.position.y = sourceScreenPos.y + offsetY
      popup.visible = sourceScreenPos.visible // 更新可见性
    })
  }


  // ==================== 返回对象 ====================
  return {
    popups,                    // 弹窗状态数组
    showLinkPopup,            // 显示连线弹窗
    hideAllPopups,            // 隐藏所有弹窗
    updateAllPopupPositions,  // 更新所有弹窗位置
    cleanupExpiredPopups,     // 清理过期弹窗
    camera: null as any,      // 相机引用
    renderer: null as any     // 渲染器引用
  }
}
