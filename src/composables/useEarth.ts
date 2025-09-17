// useEarth.ts
import * as THREE from 'three'
import earthBg from '@/assets/images/worldmap.png'

export function useEarth(radius: number) {
  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 100, 100),
    new THREE.MeshLambertMaterial({ color: 0x2266cc })
  )

  const earthParticles = new THREE.Object3D()
  const earthGlow = new THREE.Group()

  const img = new Image()
  img.src = earthBg

  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0)

    const imgData = ctx.getImageData(0, 0, img.width, img.height)
    const spherical = new THREE.Spherical(radius)

    const material = new THREE.PointsMaterial({
      size: 1,
      color: new THREE.Color(0x00ddff),
      // map: new THREE.TextureLoader().load(dotImg),
      map: null,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    })

    const positions: number[] = []

    for (let i = 0; i < 250; i++) {
      for (let j = 0; j < 250; j++) {
        const u = j / 250
        const v = i / 250
        const x = Math.floor(u * img.width)
        const y = Math.floor(v * img.height)
        const index = (y * img.width + x) * 4

        const r = imgData.data[index]
        const g = imgData.data[index + 1]
        const b = imgData.data[index + 2]
        const brightness = (r + g + b) / 3

        if (brightness > 50) {
          spherical.theta = u * Math.PI * 2 - Math.PI / 2
          spherical.phi = v * Math.PI
          const vec = new THREE.Vector3().setFromSpherical(spherical)
          positions.push(vec.x, vec.y, vec.z)
        }
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const points = new THREE.Points(geometry, material)
    earthParticles.add(points)
  }

  const glowGeo = new THREE.CircleGeometry(radius + 1.5, radius)
  const glowMat1 = new THREE.MeshBasicMaterial({
    color: 0xd7fcf6,
    side: THREE.DoubleSide
  })
  const glowMat2 = new THREE.MeshBasicMaterial({
    color: 0xd1bdff,
    side: THREE.DoubleSide
  })

  glowMat1.transparent = glowMat2.transparent = true
  glowMat1.opacity = glowMat2.opacity = 0.5
  glowMat1.depthWrite = glowMat2.depthWrite = false
  glowMat1.blending = glowMat2.blending = THREE.AdditiveBlending

  const glow1 = new THREE.Mesh(glowGeo, glowMat1)
  const glow2 = new THREE.Mesh(glowGeo, glowMat2)

  glow1.layers.set(1)
  glow2.layers.set(1)

  earthGlow.add(glow1)
  earthGlow.add(glow2)

  return {
    earthMesh,
    earthParticles,
    earthGlow
  }
}