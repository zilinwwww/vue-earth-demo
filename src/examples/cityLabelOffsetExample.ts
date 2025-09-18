// 城市标签偏移使用示例
import { useCity } from '../composables/useCity'
import type { CityData } from '../types'

// 在 CityData 中定义所有城市属性
const cityData: CityData[] = [
  {
    name: '深圳',
    lng: 114.0579,
    lat: 22.5431,
    color: 0xffffff,
    labelOffset: { x: 0, y: 0, z: 0 } // 无偏移
  },
  {
    name: '北京',
    lng: 116.4,
    lat: 39.9,
    color: 0xffffff,
    labelOffset: { x: 5, y: 0, z: 0 } // 向右偏移
  },
  {
    name: '上海',
    lng: 121.4737,
    lat: 31.2304,
    color: 0xffffff,
    labelOffset: { x: -5, y: 0, z: 0 } // 向左偏移
  },
  {
    name: '西安',
    lng: 108.9402,
    lat: 34.3416,
    color: 0xffffff,
    labelOffset: { x: 0, y: 5, z: 0 } // 向上偏移
  },
  {
    name: '南京',
    lng: 118.7969,
    lat: 32.0603,
    color: 0xffffff,
    labelOffset: { x: 8, y: 3, z: 0 } // 右上偏移
  },
  {
    name: '杭州',
    lng: 120.1551,
    lat: 30.2741,
    color: 0xffffff,
    labelOffset: { x: 0, y: -5, z: 0 } // 向下偏移
  },
  {
    name: '东莞',
    lng: 113.7463,
    lat: 23.0223,
    color: 0xffffff,
    labelOffset: { x: 0, y: 0, z: 3 } // Z轴偏移
  }
]

// 简化的调用方式
const cities = cityData.map(city => 
  useCity(city, {
    onHover: (cityObj) => console.log(`悬停在城市: ${cityObj.name}`),
    onLeave: (cityObj) => console.log(`离开城市: ${cityObj.name}`)
  })
)

export { cities }
