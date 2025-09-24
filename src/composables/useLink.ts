/**
 * 飞线动画工具
 * 用于在两个城市之间创建具有完整生命周期的飞线动画
 */
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { MeshLine, MeshLineMaterial } from 'three.meshline'
import type { CityObject } from '../types'

/** 飞线动画配置选项 */
interface AnimationOptions {
  appearDuration?: number;    // 出现动画时长（毫秒）
  stayDuration?: number;      // 停留时长（毫秒）
  disappearDuration?: number; // 消失动画时长（毫秒）
}

/**
 * 在两个城市之间创建飞线动画
 * 动画流程：出现 → 停留 → 消失
 * @param sourceCity 起点城市对象
 * @param targetCity 终点城市对象
 * @param options 动画配置选项
 * @param tweenGroup TWEEN 组实例，用于管理补间动画
 * @returns 包含 Three.js 网格和销毁方法的对象
 */
export function useLink(
  sourceCity: CityObject,
  targetCity: CityObject,
  options: AnimationOptions = {},
  tweenGroup: TWEEN.Group,
  resolution: { width: number; height: number }
) {
  // ==================== 参数解构和默认值 ====================
  const {
    appearDuration = 2000,    // 默认出现时长：2秒
    stayDuration = 3000,      // 默认停留时长：3秒
    disappearDuration = 2000, // 默认消失时长：2秒
  } = options

  // ==================== 常量定义 ====================
  const LINK_COLOR = 0x00aaff  // 飞线颜色（蓝色）
  const CURVE_POINTS = 100     // 曲线分段数
  const LINE_WIDTH = 0.3         // 线条宽度（像素）

  // ==================== 场景对象创建 ====================
  /** 飞线组容器 */
  const linkGroup = new THREE.Group()

  // ==================== 贝塞尔曲线计算 ====================
  /** 获取起点和终点位置 */
  const sourcePos = sourceCity.getPosition()
  const targetPos = targetCity.getPosition()

  /** 计算控制点，创建弧形飞线 */
  const angle = sourcePos.angleTo(targetPos)  // 两城市间的角度
  const midPoint = sourcePos.clone().add(targetPos).multiplyScalar(0.5)  // 中点
  const height = midPoint.length() + angle * 70  // 根据角度和距离计算弧高
  const controlPoint = midPoint.normalize().multiplyScalar(height)  // 控制点

  /** 创建二次贝塞尔曲线 */
  const curve = new THREE.QuadraticBezierCurve3(sourcePos, controlPoint, targetPos)

  // ==================== 线条几何体和材质 ====================
  /** 获取曲线上的所有点 */
  const allPoints = curve.getPoints(CURVE_POINTS)
  
  /** 创建 MeshLine 几何体 */
  const meshLine = new MeshLine()
  
  /** 创建 MeshLine 材质 */
  const material = new MeshLineMaterial({
    color: LINK_COLOR,
    lineWidth: LINE_WIDTH,
    transparent: true,
    opacity: 1,
    resolution: new THREE.Vector2(resolution.width, resolution.height),
  })

  /** 创建 MeshLine 对象 */
  const line = new THREE.Mesh(meshLine, material)
  linkGroup.add(line)
  
  // 初始化空线条
  meshLine.setPoints([])

  // ==================== 动画系统 ====================
  /** 出现动画进度（0-100） */
  const drawProgress = { value: 0 }
  
  /** 出现动画：从起点到终点逐段绘制 */
  const appear = new TWEEN.Tween(drawProgress, tweenGroup)
    .to({ value: 100 }, appearDuration)
    .easing(TWEEN.Easing.Linear.None)  // 缓出动画
    .onUpdate(() => {
      const currentPoints = Math.floor(drawProgress.value)
      
      if (currentPoints > 0) {
        // 创建当前应该显示的点的数组
        const points = []
        for (let i = 0; i < currentPoints; i++) {
          const point = allPoints[i]
          points.push(point.x, point.y, point.z)
        }
        
        // 更新 MeshLine 几何体
        meshLine.setPoints(points)
      }
    })

  /** 消失动画进度（0-100） */
  const disappearProgress = { value: 0 }
  
  /** 消失动画：从起点到终点逐段消失 */
  const disappear = new TWEEN.Tween(disappearProgress, tweenGroup)
    .to({ value: 100 }, disappearDuration)
    .easing(TWEEN.Easing.Quadratic.In)  // 缓入动画
    .onUpdate(() => {
      const startIndex = Math.floor(disappearProgress.value)

      // 如果消失进度达到100%，清空线条
      if (startIndex >= allPoints.length) {
        meshLine.setPoints([])
        return
      }
      
      // 保留从当前索引到终点的部分
      const remainingPoints = allPoints.slice(startIndex)
      const points = []
      
      for (let i = 0; i < remainingPoints.length; i++) {
        const point = remainingPoints[i]
        points.push(point.x, point.y, point.z)
      }
      
      meshLine.setPoints(points)
    })
    .onComplete(() => {
      // 动画完成后销毁对象
      destroy()
    })

  // ==================== 动画链式调用 ====================
  /** 设置动画链：出现 → 停留 → 消失 */
  appear.chain(disappear)      // 出现动画完成后执行消失动画
  disappear.delay(stayDuration) // 消失动画延迟执行（停留时间）
  appear.start()               // 开始执行出现动画

  // ==================== 清理函数 ====================
  /**
   * 销毁飞线对象，释放内存
   */
  const destroy = () => {
    material.dispose()    // 释放材质
    linkGroup.remove(line) // 从组中移除线条
    
    // 从父级场景中移除整个飞线组
    if (linkGroup.parent) {
      linkGroup.parent.remove(linkGroup)
    }
  }

  // ==================== 返回对象 ====================
  return {
    mesh: linkGroup,  // Three.js 网格对象
    destroy,          // 销毁方法
  }
}