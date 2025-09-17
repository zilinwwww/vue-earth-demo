// useLink.ts
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

interface City {
  getPosition: () => THREE.Vector3
}

export function useLink(city1: City, city2: City) {
  const LINK_COLOR = 0x00DDFF
  const linkGroup = new THREE.Group()

  const drawLine = () => {
    const v0 = city1.getPosition()
    const v3 = city2.getPosition()
    let curve: THREE.Curve<THREE.Vector3>

    const angle = v0.angleTo(v3)

    if (angle > 1) {
      const { v1, v2 } = getBezierPoint(v0, v3)
      curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3)
    } else {
      const vtop = new THREE.Ray(
        new THREE.Vector3(),
        getVCenter(v0.clone(), v3.clone())
      ).at(1.3, new THREE.Vector3())
      curve = new THREE.QuadraticBezierCurve3(v0, vtop, v3)
    }

    const curvePoints = curve.getPoints(100)

    // 使用简单的LineBasicMaterial
    const material = new THREE.LineBasicMaterial({
      color: LINK_COLOR,
      opacity: 0.7,
      transparent: true,
    })

    // 创建简单的线条几何体
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
    
    const line = new THREE.Line(geometry, material)
    linkGroup.add(line)

    // 添加动画效果
    const lineLength = { value: 0 }
    const drawTween = new TWEEN.Tween(lineLength).to({ value: 100 }, 3000)
    drawTween.onUpdate(() => {
      const visiblePoints = curvePoints.slice(0, Math.floor(lineLength.value + 1))
      geometry.setFromPoints(visiblePoints)
    })

    const eraseTween = new TWEEN.Tween(lineLength).to({ value: 0 }, 3000)
    eraseTween.onUpdate(() => {
      const visiblePoints = curvePoints.slice(
        Math.floor(curvePoints.length - lineLength.value),
        curvePoints.length
      )
      geometry.setFromPoints(visiblePoints)
    })

    drawTween.start()
    setTimeout(() => eraseTween.start(), 6000)
  }

  const drawRing = () => {
    const ringGeo = new THREE.RingGeometry(1, 1.3, 15)
    const ringMat = new THREE.MeshBasicMaterial({
      color: LINK_COLOR,
      side: THREE.DoubleSide,
      opacity: 0,
      transparent: true,
    })

    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(city2.getPosition())
    ring.lookAt(new THREE.Vector3(0, 0, 0))

    const ringScale = { value: 1 }

    const tweenOut = new TWEEN.Tween(ringScale).to({ value: 1.1 }, 200)
    tweenOut.onUpdate(() => {
      ringMat.opacity = 0.5
      ring.scale.set(ringScale.value, ringScale.value, ringScale.value)
    })

    const tweenBack = new TWEEN.Tween(ringScale).to({ value: 1 }, 1000)
    tweenBack.onUpdate(() => {
      ringMat.opacity = ringScale.value - 1
    })

    tweenOut
      .easing(TWEEN.Easing.Circular.Out)
      .delay(3000)
      .chain(tweenBack.easing(TWEEN.Easing.Circular.In))
      .start()

    linkGroup.add(ring)
  }

  const getMesh = () => linkGroup
  const destroy = () => linkGroup.clear()

  function getBezierPoint(v0: THREE.Vector3, v3: THREE.Vector3) {
    const angle = (v0.angleTo(v3) * 180) / Math.PI
    const aLen = angle

    const ray = new THREE.Ray(
      new THREE.Vector3(),
      getVCenter(v0.clone(), v3.clone())
    )
    const vtop = ray.at(100, new THREE.Vector3())

    const v1 = getLenVector(v0.clone(), vtop, aLen)
    const v2 = getLenVector(v3.clone(), vtop, aLen)

    return { v1, v2 }
  }

  function getVCenter(v1: THREE.Vector3, v2: THREE.Vector3) {
    return v1.add(v2).divideScalar(2)
  }

  function getLenVector(v1: THREE.Vector3, v2: THREE.Vector3, len: number) {
    const dist = v1.distanceTo(v2)
    return v1.lerp(v2, len / dist)
  }

  drawLine()
  drawRing()

  return {
    mesh: linkGroup,
    getMesh,
    destroy,
  }
}