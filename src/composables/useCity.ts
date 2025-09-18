/**
 * 城市 3D 对象创建工具
 * 用于在地球上创建城市标记点、文字标签和连接线
 */
import * as THREE from 'three'
import type { CityObject, CityData } from '../types'

/** 城市创建选项接口 */
interface UseCityOptions {
  radius?: number  // 地球半径，默认 100
  onHover?: (city: CityObject, event?: MouseEvent) => void  // 悬停回调
  onLeave?: (city: CityObject, event?: MouseEvent) => void  // 离开回调
}

/**
 * 创建城市 3D 对象
 * @param cityData 城市数据（名称、经纬度、颜色、标签偏移等）
 * @param options 创建选项（半径、交互回调等）
 * @returns 包含 mesh、位置获取方法和数据的城市对象
 */
export function useCity(
  cityData: CityData,
  options: UseCityOptions = {}
): CityObject {
  // ==================== 参数解构和默认值 ====================
  const {
    radius = 100,  // 默认地球半径
    onHover,
    onLeave,
  } = options

  // 提取城市数据
  const lngLat: [number, number] = [cityData.lng, cityData.lat]
  const name = cityData.name
  const color = cityData.color
  const labelOffset = cityData.labelOffset || { x: 0, y: 0, z: 0 }

  // ==================== 坐标转换 ====================
  /** 将经纬度转换为 3D 世界坐标 */
  const position = convertLngLatToVector3(lngLat[0], lngLat[1], radius)
  /** 标签位置（比城市点稍高） */
  const labelPosition = convertLngLatToVector3(lngLat[0], lngLat[1], radius + 5)

  // ==================== 3D 对象创建 ====================
  /** 创建城市点（带光晕效果） */
  const cityPoint = createCityPoint(color)
  /** 创建文字标签精灵 */
  const sprite = createLabelSprite(name, color)
  /** 创建连接城市点和标签的虚线 */
  const connectionLine = createDashedLine(color)
  
  // ==================== 对象组合 ====================
  /** 主城市对象容器 */
  const mesh = new THREE.Object3D()
  mesh.add(cityPoint)        // 城市点
  mesh.add(sprite)           // 文字标签
  mesh.add(connectionLine)   // 连接线
  
  // 设置城市对象位置
  mesh.position.copy(position)
  
  // ==================== 标签位置计算 ====================
  /** 计算最终标签位置：基础位置 + 用户指定偏移 */
  const finalLabelPosition = labelPosition.clone().add(
    new THREE.Vector3(labelOffset.x, labelOffset.y, labelOffset.z)
  )
  // 设置标签相对于城市点的位置
  sprite.position.copy(finalLabelPosition.clone().sub(position))
  
  // ==================== 连接线更新 ====================
  /** 更新连接线位置（从城市点到标签） */
  updateConnectionLine(connectionLine, new THREE.Vector3(0, 0, 0), sprite.position)

  // ==================== 用户数据设置 ====================
  /** 设置用户数据，用于鼠标交互识别 */
  mesh.userData = {
    type: 'city',           // 对象类型标识
    name,                   // 城市名称
    lng: lngLat[0],         // 经度
    lat: lngLat[1],         // 纬度
    onHover,                // 悬停回调
    onLeave,                // 离开回调
  }

  // ==================== 坐标转换函数 ====================
  /**
   * 将经纬度坐标转换为 3D 世界坐标
   * @param lng 经度
   * @param lat 纬度
   * @param radius 球面半径
   * @returns 3D 坐标向量
   */
  function convertLngLatToVector3(lng: number, lat: number, radius: number): THREE.Vector3 {
    // 转换为球面坐标
    const phi = (90 - lat) * (Math.PI / 180)      // 极角（从北极开始）
    const theta = (lng + 180) * (Math.PI / 180)   // 方位角（从本初子午线开始）

    // 转换为笛卡尔坐标
    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    return new THREE.Vector3(x, y, z)
  }

  // ==================== 返回城市对象 ====================
  return {
    mesh,                                    // Three.js 对象
    getPosition: () => position.clone(),     // 位置获取方法
    name,                                    // 城市名称
    data: {                                  // 城市数据
      name, 
      lng: lngLat[0], 
      lat: lngLat[1], 
      color: new THREE.Color(color).getHex(),
      labelOffset
    }
  }
}

// ==================== 辅助函数 ====================

/**
 * 创建城市点（带光晕效果）
 * @param color 城市点颜色
 * @returns 包含城市点和光晕的组对象
 */
function createCityPoint(color: THREE.Color | string | number) {
  const group = new THREE.Group()
  
  // 城市点主体 - 小球体
  const pointGeometry = new THREE.SphereGeometry(1, 16, 16)
  const pointMaterial = new THREE.MeshBasicMaterial({ 
    color, 
    transparent: true, 
    opacity: 0.9 
  })
  const point = new THREE.Mesh(pointGeometry, pointMaterial)
  
  // 光晕效果 - 稍大的半透明球体
  const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({ 
    color, 
    transparent: true, 
    opacity: 0.3, 
    side: THREE.BackSide  // 只渲染背面，创造光晕效果
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  
  // 组合城市点和光晕
  group.add(glow)   // 光晕在底层
  group.add(point)  // 城市点在顶层
  
  return group
}

/**
 * 创建文字标签精灵
 * @param name 城市名称
 * @param color 文字颜色
 * @returns 文字精灵对象
 */
function createLabelSprite(name: string, color: THREE.Color | string | number) {
  // 创建画布用于渲染文字
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 256
  canvas.height = 64
  
  // 清空画布
  context.clearRect(0, 0, canvas.width, canvas.height)
  
  // 设置文字样式
  context.strokeStyle = '#000000'  // 黑色描边
  context.lineWidth = 4            // 描边宽度
  context.font = 'bold 32px Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  
  // 绘制文字（先描边后填充）
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  context.strokeText(name, centerX, centerY)
  context.fillStyle = `#${new THREE.Color(color).getHexString()}`
  context.fillText(name, centerX, centerY)
  
  // 创建纹理和精灵
  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true, 
    alphaTest: 0.1  // 透明度测试阈值
  })
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(12, 3, 1)  // 设置精灵大小
  
  return sprite
}

/**
 * 创建虚线连接线
 * @param color 线条颜色
 * @returns 虚线对象
 */
function createDashedLine(color: THREE.Color | string | number) {
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.LineDashedMaterial({
    color: color,
    transparent: true,
    opacity: 0.6,      // 半透明
    dashSize: 0.5,     // 虚线长度
    gapSize: 0.3,      // 间隙长度
    linewidth: 1       // 线条宽度
  })
  
  const line = new THREE.Line(geometry, material)
  return line
}

/**
 * 更新连接线位置
 * @param line 连接线对象
 * @param startPos 起点位置
 * @param endPos 终点位置
 */
function updateConnectionLine(line: THREE.Line, startPos: THREE.Vector3, endPos: THREE.Vector3) {
  // 创建位置数组
  const positions = new Float32Array([
    startPos.x, startPos.y, startPos.z,
    endPos.x, endPos.y, endPos.z
  ])
  
  // 更新几何体位置属性
  line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  line.geometry.attributes.position.needsUpdate = true
  
  // 重新计算虚线距离
  line.computeLineDistances()
}