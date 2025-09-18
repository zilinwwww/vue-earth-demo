# TWEEN.js 25.0.0 兼容性修复

## 🚨 问题描述

升级到 TWEEN.js 25.0.0 后，飞线动画消失，这是因为 `TWEEN.update()` 和 `TWEEN.getAll()` 方法都被弃用了。

## 🔍 问题原因

在 TWEEN.js 25.0.0 中：
- `TWEEN.update()` 方法已被弃用
- `TWEEN.getAll()` 方法也被弃用
- 推荐使用 `TWEEN.Group` 来管理补间动画
- 新 API 提供了更灵活和精确的动画控制

## ✅ 解决方案

### 1. 创建 TWEEN.Group

在组件中创建 TWEEN 组：

```typescript
import * as TWEEN from '@tweenjs/tween.js'

// 创建 TWEEN 组用于管理所有补间动画
const tweenGroup = new TWEEN.Group()
```

### 2. 更新渲染循环

使用 TWEEN.Group 更新补间动画：

```typescript
const animate = (time: number) => {
  controls.update()
  // TWEEN.js 25.0.0+ 新 API：使用 TWEEN.Group 更新补间动画
  tweenGroup.update(time)
  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}
animate(0)
```

### 3. 创建补间动画时指定组

在创建补间动画时传入 TWEEN.Group：

```typescript
const tween = new TWEEN.Tween(object, tweenGroup)
  .to({ x: 100 }, 1000)
  .start()
```

## 📁 修改的文件

### 1. `src/EarthView.vue`
- 创建了 `tweenGroup = new TWEEN.Group()`
- 将 `TWEEN.update(time)` 替换为 `tweenGroup.update(time)`
- 将 `tweenGroup` 传递给 `useLink` 函数

### 2. `src/composables/useLink.ts`
- 添加了 `tweenGroup` 参数
- 在创建 TWEEN 时指定组：`new TWEEN.Tween(object, tweenGroup)`
- 移除了全局 TWEEN 依赖

## 🎯 关键变化

### 之前（TWEEN.js < 25.0.0）
```typescript
TWEEN.update(time)  // 全局更新所有动画
```

### 现在（TWEEN.js 25.0.0+）
```typescript
const tweenGroup = new TWEEN.Group()  // 创建组
tweenGroup.update(time)  // 更新组内动画
new TWEEN.Tween(object, tweenGroup)  // 创建动画时指定组
```

## 🔧 验证方法

1. 启动开发服务器：`pnpm dev`
2. 访问 `http://localhost:3001`
3. 检查北京到深圳的飞线动画是否正常显示
4. 确认动画的完整生命周期：出现 → 停留 → 消失

## 📚 参考文档

- [TWEEN.js 25.0.0 Release Notes](https://github.com/tweenjs/tween.js/releases)
- [TWEEN.js Documentation](https://github.com/tweenjs/tween.js)

## ⚠️ 注意事项

- 这个设置是全局的，会影响所有 TWEEN 动画
- 如果项目中有其他 TWEEN 动画，确保它们也兼容这个设置
- 建议在项目初始化时统一设置，避免在多个地方重复设置
