// useGlow.ts
import * as THREE from 'three'

export function useGlow(radius: number) {
  const glowGroup = new THREE.Group()
  const geometry = new THREE.CircleGeometry(radius + 1.5, radius)

  const material1 = new THREE.MeshBasicMaterial({
    color: 0xd7fcf6,
    side: THREE.DoubleSide
  })
  const material2 = new THREE.MeshBasicMaterial({
    color: 0xd1bdff,
    side: THREE.DoubleSide
  })

  material1.transparent = material2.transparent = true
  material1.opacity = material2.opacity = 0.5
  material1.depthWrite = material2.depthWrite = false
  material1.blending = material2.blending = THREE.AdditiveBlending

  const glow1 = new THREE.Mesh(geometry, material1)
  const glow2 = new THREE.Mesh(geometry, material2)

  glow1.layers.set(1)
  glow2.layers.set(1)

  glowGroup.add(glow1)
  glowGroup.add(glow2)

  return {
    glowGroup
  }
}