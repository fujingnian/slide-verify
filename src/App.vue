<template>
  <div id="app">
    <SlideVerify :verified="verified"/>
  </div>
</template>

<script>
import SlideVerify from './components/SlideVerify.vue'

export default {
  name: 'App',
  components: {
    SlideVerify
  },
  data() {
    return {
      verified: false
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 400px;
  display: flex;
  justify-content: center;
}
</style>
