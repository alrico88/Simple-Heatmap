<template>
  <div
    :id="id"
    class="w-100 h-100"
  />
</template>

<script>
import uniqueId from 'lodash/uniqueId';
import {LeafletMap} from '../modules/LeafletMap';
import {mapGetters, mapState} from 'vuex';
import {calcMean} from 'math-helper-functions';

export default {
  name: 'MapComponent',
  data() {
    return {
      id: uniqueId('map_component'),
    };
  },
  computed: {
    ...mapState(['radius', 'blur']),
    ...mapGetters(['getLocations']),
  },
  watch: {
    getLocations(locations) {
      const meanLat = calcMean(locations.map((d) => d[0]));
      const meanLon = calcMean(locations.map((d) => d[1]));
      this.drawHeatmap();
      this.moveMap({
        latitude: meanLat,
        longitude: meanLon,
      });
    },
    radius() {
      this.drawHeatmap();
    },
    blur() {
      this.drawHeatmap();
    },
  },
  mounted() {
    this.map = new LeafletMap(this.id, {
      startingCoords: [40.468855, -3.5759005],
      zoom: 10,
    });
  },
  methods: {
    drawHeatmap() {
      const heatLayer = this.map.createHeatLayer(this.getLocations, {
        radius: this.radius,
        blur: this.blur,
        minOpacity: 0.2,
      });
      this.map.addLayer(heatLayer, 'heatLayer');
    },
    moveMap({latitude, longitude}) {
      this.map.flyTo([latitude, longitude]);
    },
  },
};
</script>

<style scoped></style>
