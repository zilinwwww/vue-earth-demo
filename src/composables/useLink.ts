/**
 * 飞线动画工具
 * 用于在两个城市之间创建具有完整生命周期的飞线动画
 */
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
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
  tweenGroup: TWEEN.Group
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
  
  /** 创建线条几何体 */
  const geometry = new THREE.BufferGeometry()
  const initialPositions = new Float32Array(3)  // 初始只有1个点
  geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3))

  /** 创建线条材质 */
  const material = new THREE.LineBasicMaterial({
    color: LINK_COLOR,
    linewidth: 1,
    transparent: true,
    opacity: 1,
  })

  /** 创建线条对象 */
  const line = new THREE.Line(geometry, material)
  linkGroup.add(line)

  // ==================== 动画系统 ====================
  /** 出现动画进度（0-100） */
  const drawProgress = { value: 0 }
  
  /** 出现动画：从起点到终点逐段绘制 */
  const appear = new TWEEN.Tween(drawProgress, tweenGroup)
    .to({ value: 100 }, appearDuration)
    .easing(TWEEN.Easing.Quadratic.Out)  // 缓出动画
    .onUpdate(() => {
      const currentPoints = Math.floor(drawProgress.value)
      const newPositions = new Float32Array(currentPoints * 3)
      
      // 更新几何体顶点位置
      for (let i = 0; i < currentPoints; i++) {
        const point = allPoints[i]
        newPositions[i * 3] = point.x
        newPositions[i * 3 + 1] = point.y
        newPositions[i * 3 + 2] = point.z
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3))
      geometry.attributes.position.needsUpdate = true
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
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3))
        geometry.attributes.position.needsUpdate = true
        return
      }
      
      // 保留从当前索引到终点的部分
      const remainingPoints = allPoints.slice(startIndex)
      const newPositions = new Float32Array(remainingPoints.length * 3)
      
      for (let i = 0; i < remainingPoints.length; i++) {
        const point = remainingPoints[i]
        newPositions[i * 3] = point.x
        newPositions[i * 3 + 1] = point.y
        newPositions[i * 3 + 2] = point.z
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3))
      geometry.attributes.position.needsUpdate = true
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
    geometry.dispose()    // 释放几何体
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