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
import {getBBox} from '../modules/bbox';

export default {
  name: 'MapComponent',
  data() {
    return {
      id: uniqueId('map_component'),
    };
  },
  computed: {
    ...mapState(['radius', 'blur', 'tileUrl']),
    ...mapGetters(['getLocations']),
  },
  watch: {
    getLocations(locations) {
      this.drawHeatmap();
      if (locations.length > 0) {
        const [minLon, minLat, maxLon, maxLat] = getBBox(
          locations,
          (d) => d[0],
          (d) => d[1]
        );
        this.map.fitBounds({
          minLon,
          minLat,
          maxLon,
          maxLat,
        });
      }
    },
    radius() {
      this.drawHeatmap();
    },
    blur() {
      this.drawHeatmap();
    },
    tileUrl(newTile) {
      this.changeTile(newTile);
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
      const locations = this.getLocations;
      if (locations.length > 0) {
        const heatLayer = this.map.createHeatLayer(locations, {
          radius: this.radius,
          blur: this.blur,
          minOpacity: 0.2,
        });
        this.map.addLayer(heatLayer, 'heatLayer');
      } else {
        this.map.removeLayerById('heatLayer');
      }
    },
    moveMap({latitude, longitude}) {
      this.map.flyTo([latitude, longitude]);
    },
    changeTile(newTile) {
      this.map.changeBaseTile(newTile);
    },
  },
};
</script>

<style scoped></style>
