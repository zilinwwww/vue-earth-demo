/**
 * 类型定义文件
 * 定义项目中使用的所有 TypeScript 接口和类型
 */
import type * as THREE from 'three';

/**
 * 城市数据结构
 * 用于定义城市的基本信息和显示配置
 */
export interface CityData {
  /** 城市名称 */
  name: string;
  
  /** 经度（-180 到 180） */
  lng: number;
  
  /** 纬度（-90 到 90） */
  lat: number;
  
  /** 城市颜色（十六进制数值，如 0xffffff） */
  color: number;
  
  /** 标签偏移量（可选）
   * 用于调整城市标签相对于城市点的位置
   * x: 左右偏移，y: 上下偏移，z: 前后偏移
   */
  labelOffset?: { 
    x: number; 
    y: number; 
    z: number; 
  };
}

/**
 * Three.js 场景中的城市对象结构
 * 包含 Three.js 对象和相关的操作方法
 */
export interface CityObject {
  /** Three.js 对象组，包含城市点、标签和连接线 */
  mesh: THREE.Object3D;
  
  /** 获取城市 3D 位置的方法 */
  getPosition: () => THREE.Vector3;
  
  /** 城市名称 */
  name: string;
  
  /** 城市原始数据 */
  data: CityData;
}
