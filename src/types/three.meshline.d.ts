declare module 'three.meshline' {
  import * as THREE from 'three'

  export class MeshLine extends THREE.BufferGeometry {
    setPoints(points: number[]): void
  }

  export class MeshLineMaterial extends THREE.Material {
    constructor(options: {
      color?: number
      lineWidth?: number
      transparent?: boolean
      opacity?: number
      resolution?: THREE.Vector2
    })
  }
}