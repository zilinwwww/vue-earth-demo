import type * as THREE from 'three';

/**
 * 原始城市数据结构
 */
export interface CityData {
  name: string;
  lng: number;
  lat: number;
  color: number;
  labelOffset?: { x: number; y: number; z: number };
}

/**
 * three.js 场景中的城市对象结构
 */
export interface CityObject {
  mesh: THREE.Object3D;
  getPosition: () => THREE.Vector3;
  name: string;
  data: CityData;
}
