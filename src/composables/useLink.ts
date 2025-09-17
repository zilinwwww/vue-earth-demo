// useLink.ts
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import type { CityObject } from '../types'

interface AnimationOptions {
  appearDuration?: number;  // 出现动画时长
  stayDuration?: number;    // 停留时长
  disappearDuration?: number; // 消失动画时长
}

/**
 * 在两个城市之间创建一条具有完整生命周期（出现、停留、消失）的飞线。
 * 线条会从起点城市逐渐绘制到终点城市，停留一段时间，然后从终点到起点逐渐消失。
 * @param sourceCity - 起点城市
 * @param targetCity - 终点城市
 * @param options - 动画配置
 * @returns 包含 three.js 网格和销毁方法的对象
 */
export function useLink(
  sourceCity: CityObject,
  targetCity: CityObject,
  options: AnimationOptions = {}
) {
  const {
    appearDuration = 2000,
    stayDuration = 3000,
    disappearDuration = 2000,
  } = options;

  const LINK_COLOR = 0x00aaff;
  const linkGroup = new THREE.Group();

  // --- 贝塞尔曲线 ---
  const sourcePos = sourceCity.getPosition();
  const targetPos = targetCity.getPosition();

  // 结合了稳定性和动态高度的新算法
  const angle = sourcePos.angleTo(targetPos);
  const midPoint = sourcePos.clone().add(targetPos).multiplyScalar(0.5);
  const height = midPoint.length() + angle * 70; // 距离越远，弧度越高
  const controlPoint = midPoint.normalize().multiplyScalar(height);
  const curve = new THREE.QuadraticBezierCurve3(sourcePos, controlPoint, targetPos);

  // --- 线条材质和几何体 ---
  const allPoints = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(3); // 初始只有1个点
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: LINK_COLOR,
    linewidth: 1,
    transparent: true,
    opacity: 1,
  });

  const line = new THREE.Line(geometry, material);
  linkGroup.add(line);

  // --- 动画：逐段绘制（从起点到终点） ---
  const drawProgress = { value: 0 };
  
  const appear = new TWEEN.Tween(drawProgress)
    .to({ value: 100 }, appearDuration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      const currentPoints = Math.floor(drawProgress.value);
      const newPositions = new Float32Array(currentPoints * 3);
      
      for (let i = 0; i < currentPoints; i++) {
        const point = allPoints[i];
        newPositions[i * 3] = point.x;
        newPositions[i * 3 + 1] = point.y;
        newPositions[i * 3 + 2] = point.z;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
      geometry.attributes.position.needsUpdate = true;
    });

  // --- 动画：逐段消失（从起点到终点） ---
  const disappearProgress = { value: 0 }; // 使用独立的进度变量
  const disappear = new TWEEN.Tween(disappearProgress)
    .to({ value: 100 }, disappearDuration)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(() => {
      const startIndex = Math.floor(disappearProgress.value);

      if (startIndex >= allPoints.length) {
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
        geometry.attributes.position.needsUpdate = true;
        return;
      }
      
      const remainingPoints = allPoints.slice(startIndex);
      const newPositions = new Float32Array(remainingPoints.length * 3);
      
      for (let i = 0; i < remainingPoints.length; i++) {
        const point = remainingPoints[i];
        newPositions[i * 3] = point.x;
        newPositions[i * 3 + 1] = point.y;
        newPositions[i * 3 + 2] = point.z;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
      geometry.attributes.position.needsUpdate = true;
    })
    .onComplete(() => {
      destroy();
    });

  // 链式动画：出现 -> 停留 -> 消失
  appear.chain(disappear);
  disappear.delay(stayDuration);
  appear.start();

  const destroy = () => {
    geometry.dispose();
    material.dispose();
    linkGroup.remove(line);
    if (linkGroup.parent) {
      linkGroup.parent.remove(linkGroup);
    }
  };

  return {
    mesh: linkGroup,
    destroy,
  };
}