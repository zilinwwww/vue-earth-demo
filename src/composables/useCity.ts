// useCity.ts
import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

interface UseCityOptions {
  font: THREE.Font
  radius?: number
  size?: number
  height?: number
  color?: THREE.Color | string | number
}

export function useCity(
  lngLat: [number, number],
  name: string,
  options: UseCityOptions
) {
  const {
    font,
    radius = 100,
    size = 3,
    height = 0.5,
    color = 0xffffff,
  } = options

  const position = convertLngLatToVector3(lngLat[0], lngLat[1], radius)

  const geometry = new TextGeometry(name, {
    font,
    size,
    height,
    curveSegments: 12,
    bevelEnabled: false,
  })

  geometry.computeBoundingBox()
  geometry.center()

  const material = new THREE.MeshBasicMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)

  mesh.position.copy(position)
  mesh.lookAt(new THREE.Vector3(0, 0, 0))

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
  }
}