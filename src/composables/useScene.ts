// useScene.ts
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function useScene(container: HTMLDivElement, radius: number) {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, radius * 3)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = radius * 1.2
  controls.maxDistance = radius * 5

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(100, 100, 100)

  scene.add(ambientLight)
  scene.add(directionalLight)

  const earthGroup = new THREE.Group()
  scene.add(earthGroup)

  // 响应式尺寸调整
  const resize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  window.addEventListener('resize', resize)

  return {
    scene,
    camera,
    renderer,
    controls,
    earthGroup
  }
}