/**
 * Three.js 场景初始化工具
 * 创建场景、相机、渲染器、控制器和光照系统
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/**
 * 创建 Three.js 场景系统
 * @param container 渲染容器 DOM 元素
 * @param radius 地球半径，用于计算相机距离和控制器范围
 * @returns 包含场景、相机、渲染器、控制器和地球组的对象
 */
export function useScene(container: HTMLDivElement, radius: number) {
  // ==================== 场景创建 ====================
  /** 主场景对象 */
  const scene = new THREE.Scene()

  // ==================== 相机设置 ====================
  /** 透视相机 - 模拟人眼视角 */
  const camera = new THREE.PerspectiveCamera(
    45,                                    // 视野角度（度）
    container.clientWidth / container.clientHeight,  // 宽高比
    0.1,                                   // 近裁剪面
    1000                                   // 远裁剪面
  )
  // 设置相机初始位置（距离地球 3 倍半径）
  camera.position.set(0, 0, radius * 3)

  // ==================== 渲染器设置 ====================
  /** WebGL 渲染器 */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,  // 开启抗锯齿
    alpha: true       // 开启透明度支持
  })
  
  // 设置渲染器尺寸和像素比
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)  // 适配高分辨率屏幕
  
  // 将渲染器挂载到容器
  container.appendChild(renderer.domElement)

  // ==================== 轨道控制器设置 ====================
  /** 轨道控制器 - 允许鼠标控制相机 */
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true           // 启用阻尼，使控制更平滑
  controls.enablePan = false             // 禁用平移，只允许旋转和缩放
  controls.minDistance = radius * 1.2     // 最小距离（不能太近）
  controls.maxDistance = radius * 5       // 最大距离（不能太远）

  // ==================== 光照系统 ====================
  /** 环境光 - 提供整体照明，避免完全黑暗的区域 */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  
  /** 方向光 - 模拟太阳光，提供主要照明和阴影 */
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(100, 100, 100)  // 设置光源位置

  // 将光照添加到场景
  scene.add(ambientLight)
  scene.add(directionalLight)

  // ==================== 地球组创建 ====================
  /** 地球组 - 包含地球及其相关对象（城市、飞线等） */
  const earthGroup = new THREE.Group()
  scene.add(earthGroup)

  // ==================== 响应式尺寸调整 ====================
  /**
   * 窗口尺寸变化时的响应式调整
   * 更新相机宽高比和渲染器尺寸
   */
  const resize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()  // 更新相机投影矩阵
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  // 监听窗口尺寸变化事件
  window.addEventListener('resize', resize)

  // ==================== 返回场景对象 ====================
  return {
    scene,      // 主场景
    camera,     // 相机
    renderer,   // 渲染器
    controls,   // 轨道控制器
    earthGroup  // 地球组
  }
}