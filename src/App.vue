<template>
  <div id="app">
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
}
</style>
