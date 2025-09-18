// useCity.ts
import * as THREE from 'three'
import type { CityObject } from '../types'

interface UseCityOptions {
  radius?: number
  color?: THREE.Color | string | number
  onHover?: (city: CityObject, event: MouseEvent) => void
  onLeave?: (city: CityObject, event: MouseEvent) => void
}

export function useCity(
  lngLat: [number, number],
  name: string,
  options: UseCityOptions
): CityObject {
  const {
    radius = 100,
    color = 0xffffff, // 统一使用白色
    onHover,
    onLeave,
  } = options

  const position = convertLngLatToVector3(lngLat[0], lngLat[1], radius)
  console.log(`Converted (lng: ${lngLat[0]}, lat: ${lngLat[1]}) to Vector3:`, position);
  const labelPosition = convertLngLatToVector3(lngLat[0], lngLat[1], radius + 5)

  // --- 创建城市点和文字标签 ---
  const cityPoint = createCityPoint(color)
  const sprite = createLabelSprite(name, color)
  
  // --- 组合 ---
  const mesh = new THREE.Object3D()
  mesh.add(cityPoint)
  mesh.add(sprite)
  
  mesh.position.copy(position)
  sprite.position.copy(labelPosition.clone().sub(position)) // 标签相对偏移

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