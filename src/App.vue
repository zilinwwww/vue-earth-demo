<template>
  <div id="app">
    <h1>Vue Earth Demo</h1>
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

h1 {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
}
</style>
