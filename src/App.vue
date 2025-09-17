<template>
  <div id="app">
    <div class="header">
      <h1>🌍 深圳全球连线</h1>
      <p>深圳作为中心，连接全球主要城市</p>
    </div>
    <EarthView />
  </div>
</template>

<script setup lang="ts">
import EarthView from './EarthView.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  background: #000;
  color: white;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  position: relative;
}

h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  background: linear-gradient(45deg, #00DDFF, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  margin: 0;
  color: #ccc;
  font-size: 1.2em;
}
</style>
