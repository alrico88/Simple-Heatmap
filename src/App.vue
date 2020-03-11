<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-8 vh-100">
          <map-component />
        </div>
        <div class="col">
          <content-input />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContentInputVue from './components/ContentInput.vue';
import MapComponentVue from './components/MapComponent.vue';

export default {
  name: 'App',
  components: {
    ContentInput: ContentInputVue,
    MapComponent: MapComponentVue,
  },
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 14px;
}
</style>
