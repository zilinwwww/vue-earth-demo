/**
 * 地球 3D 对象创建工具
 * 创建地球网格、粒子系统和光晕效果
 */
import * as THREE from 'three'
import earthBg from '@/assets/images/worldmap.png'

/**
 * 创建地球相关 3D 对象
 * @param radius 地球半径
 * @returns 包含地球网格、粒子系统和光晕的对象
 */
export function useEarth(radius: number) {
  // ==================== 地球主体 ====================
  /** 地球网格 - 蓝色球体 */
  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 100, 100),  // 高精度球体几何体
    new THREE.MeshLambertMaterial({ color: 0x2266cc })  // 蓝色材质
  )

  // ==================== 粒子系统容器 ====================
  /** 地球粒子系统容器 */
  const earthParticles = new THREE.Object3D()
  /** 地球光晕效果容器 */
  const earthGlow = new THREE.Group()

  // ==================== 粒子系统创建 ====================
  /** 加载世界地图图片用于粒子生成 */
  const img = new Image()
  img.src = earthBg

  img.onload = () => {
    // 创建画布用于图像处理
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 将图片绘制到画布上
    ctx.drawImage(img, 0, 0)

    // 获取图像像素数据
    const imgData = ctx.getImageData(0, 0, img.width, img.height)
    const spherical = new THREE.Spherical(radius)  // 球面坐标系统

    // 粒子材质配置
    const material = new THREE.PointsMaterial({
      size: 1,                              // 粒子大小
      color: new THREE.Color(0x00ddff),     // 青色粒子
      map: null,                            // 不使用纹理
      transparent: true,                    // 启用透明度
      opacity: 0.3,                         // 粒子透明度
      blending: THREE.AdditiveBlending,     // 加法混合模式
    })

    // 粒子位置数组
    const positions: number[] = []

    // 遍历图像像素，根据亮度生成粒子
    const SAMPLE_SIZE = 250  // 采样密度
    for (let i = 0; i < SAMPLE_SIZE; i++) {
      for (let j = 0; j < SAMPLE_SIZE; j++) {
        // 计算 UV 坐标
        const u = j / SAMPLE_SIZE
        const v = i / SAMPLE_SIZE
        
        // 计算像素坐标
        const x = Math.floor(u * img.width)
        const y = Math.floor(v * img.height)
        const index = (y * img.width + x) * 4

        // 获取 RGB 值
        const r = imgData.data[index]
        const g = imgData.data[index + 1]
        const b = imgData.data[index + 2]
        const brightness = (r + g + b) / 3  // 计算亮度

        // 根据亮度阈值决定是否生成粒子
        if (brightness > 50) {
          // 将 UV 坐标转换为球面坐标
          spherical.theta = u * Math.PI * 2 - Math.PI / 2  // 经度
          spherical.phi = v * Math.PI                      // 纬度
          
          // 转换为 3D 坐标
          const vec = new THREE.Vector3().setFromSpherical(spherical)
          positions.push(vec.x, vec.y, vec.z)
        }
      }
    }

    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    // 创建粒子系统
    const points = new THREE.Points(geometry, material)
    earthParticles.add(points)
  }

  // ==================== 光晕效果创建 ====================
  /** 光晕几何体 - 稍大于地球的圆形 */
  const glowGeo = new THREE.CircleGeometry(radius + 1.5, radius)
  
  /** 第一层光晕材质 - 青色 */
  const glowMat1 = new THREE.MeshBasicMaterial({
    color: 0xd7fcf6,
    side: THREE.DoubleSide  // 双面渲染
  })
  
  /** 第二层光晕材质 - 紫色 */
  const glowMat2 = new THREE.MeshBasicMaterial({
    color: 0xd1bdff,
    side: THREE.DoubleSide
  })

  // 设置光晕材质属性
  glowMat1.transparent = glowMat2.transparent = true    // 启用透明度
  glowMat1.opacity = glowMat2.opacity = 0.5            // 设置透明度
  glowMat1.depthWrite = glowMat2.depthWrite = false     // 禁用深度写入
  glowMat1.blending = glowMat2.blending = THREE.AdditiveBlending  // 加法混合

  // 创建光晕网格
  const glow1 = new THREE.Mesh(glowGeo, glowMat1)
  const glow2 = new THREE.Mesh(glowGeo, glowMat2)

  // 设置光晕层级（用于特殊渲染效果）
  glow1.layers.set(1)
  glow2.layers.set(1)

  // 将光晕添加到组中
  earthGlow.add(glow1)
  earthGlow.add(glow2)

  // ==================== 返回地球对象 ====================
  return {
    earthMesh,      // 地球主体网格
    earthParticles, // 粒子系统
    earthGlow       // 光晕效果
  }
}