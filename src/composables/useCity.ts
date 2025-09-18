// useCity.ts
import * as THREE from 'three'
import type { CityObject, CityData } from '../types'

interface UseCityOptions {
  radius?: number
  color?: THREE.Color | string | number
  labelOffset?: { x: number; y: number; z: number }
  onHover?: (city: CityObject, event: MouseEvent) => void
  onLeave?: (city: CityObject, event: MouseEvent) => void
}

// 函数重载：接受 CityData 参数
export function useCity(cityData: CityData, options?: Omit<UseCityOptions, 'color' | 'labelOffset'>): CityObject
// 函数重载：接受传统参数
export function useCity(lngLat: [number, number], name: string, options?: UseCityOptions): CityObject
// 实现
export function useCity(
  lngLatOrCityData: [number, number] | CityData,
  nameOrOptions?: string | Omit<UseCityOptions, 'color' | 'labelOffset'>,
  options?: UseCityOptions
): CityObject {

  // 判断调用方式并提取参数
  let lngLat: [number, number]
  let name: string
  let color: THREE.Color | string | number
  let labelOffset: { x: number; y: number; z: number }
  let radius: number
  let onHover: ((city: CityObject, event: MouseEvent) => void) | undefined
  let onLeave: ((city: CityObject, event: MouseEvent) => void) | undefined

  if (Array.isArray(lngLatOrCityData)) {
    // 传统调用方式：useCity([lng, lat], name, options)
    lngLat = lngLatOrCityData
    name = nameOrOptions as string
    const opts = options || {}
    radius = opts.radius || 100
    color = opts.color || 0xffffff
    labelOffset = opts.labelOffset || { x: 0, y: 0, z: 0 }
    onHover = opts.onHover
    onLeave = opts.onLeave
  } else {
    // 新调用方式：useCity(cityData, options)
    const cityData = lngLatOrCityData
    const opts = (nameOrOptions as Omit<UseCityOptions, 'color' | 'labelOffset'>) || {}
    lngLat = [cityData.lng, cityData.lat]
    name = cityData.name
    radius = opts.radius || 100
    color = cityData.color
    labelOffset = cityData.labelOffset || { x: 0, y: 0, z: 0 }
    onHover = opts.onHover
    onLeave = opts.onLeave
  }

  const position = convertLngLatToVector3(lngLat[0], lngLat[1], radius)
  console.log(`Converted (lng: ${lngLat[0]}, lat: ${lngLat[1]}) to Vector3:`, position);
  const labelPosition = convertLngLatToVector3(lngLat[0], lngLat[1], radius + 5)

  // --- 创建城市点和文字标签 ---
  const cityPoint = createCityPoint(color)
  const sprite = createLabelSprite(name, color)
  
  // --- 创建虚线连接 ---
  const connectionLine = createDashedLine(color)
  
  // --- 组合 ---
  const mesh = new THREE.Object3D()
  mesh.add(cityPoint)
  mesh.add(sprite)
  mesh.add(connectionLine)
  
  mesh.position.copy(position)
  
  // 计算标签位置：基础位置 + 用户指定的偏移
  const finalLabelPosition = labelPosition.clone().add(new THREE.Vector3(labelOffset.x, labelOffset.y, labelOffset.z))
  sprite.position.copy(finalLabelPosition.clone().sub(position)) // 标签相对偏移
  
  // 更新连接线位置
  updateConnectionLine(connectionLine, new THREE.Vector3(0, 0, 0), sprite.position)

  // --- 添加用户数据用于鼠标交互 ---
  mesh.userData = {
    type: 'city',
    name,
    lng: lngLat[0],
    lat: lngLat[1],
    onHover,
    onLeave,
  }

  function convertLngLatToVector3(lng: number, lat: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)

    return new THREE.Vector3(x, y, z)
  }

  return {
    mesh,
    getPosition: () => position.clone(),
    name,
    data: { name, lng: lngLat[0], lat: lngLat[1], color: new THREE.Color(color).getHex() }
  }
}

/** 创建城市点（带光晕） */
function createCityPoint(color: THREE.Color | string | number) {
  const group = new THREE.Group()
  
  const pointGeometry = new THREE.SphereGeometry(1, 16, 16)
  const pointMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
  const point = new THREE.Mesh(pointGeometry, pointMaterial)
  
  const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.BackSide })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  
  group.add(glow)
  group.add(point)
  
  return group
}

/** 创建文字标签 */
function createLabelSprite(name: string, color: THREE.Color | string | number) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 256
  canvas.height = 64
  
  context.clearRect(0, 0, canvas.width, canvas.height)
  
  context.strokeStyle = '#000000'
  context.lineWidth = 4
  context.font = 'bold 32px Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  
  context.strokeText(name, canvas.width / 2, canvas.height / 2)
  context.fillStyle = `#${new THREE.Color(color).getHexString()}`
  context.fillText(name, canvas.width / 2, canvas.height / 2)
  
  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.1 })
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(12, 3, 1)
  
  return sprite
}

/** 创建虚线连接 */
function createDashedLine(color: THREE.Color | string | number) {
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.LineDashedMaterial({
    color: color,
    transparent: true,
    opacity: 0.6,
    dashSize: 0.5,
    gapSize: 0.3,
    linewidth: 1
  })
  
  const line = new THREE.Line(geometry, material)
  return line
}

/** 更新连接线位置 */
function updateConnectionLine(line: THREE.Line, startPos: THREE.Vector3, endPos: THREE.Vector3) {
  const positions = new Float32Array([
    startPos.x, startPos.y, startPos.z,
    endPos.x, endPos.y, endPos.z
  ])
  
  line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  line.geometry.attributes.position.needsUpdate = true
  
  // 更新虚线
  line.computeLineDistances()
}