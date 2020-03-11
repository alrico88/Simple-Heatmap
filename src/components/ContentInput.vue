<template lang="pug">
  .row
    .col.pt-3
      h2 Simple Heatmap
        span.smalltext.ml-2 By Alberto Rico
          a.ml-2(href="https://github.com/alrico88/Simple-Heatmap", target="_blank")
            i.fa.fa-github-square
    .w-100
    .col
      form.form
        .form-group
          label Paste the content
          textarea.form-control(rows="20", v-model="textarea")
        .form-group
          label Latitude column
          select.form-control(v-model="latitudeCol")
            option(value="") -- No selection --
            option(v-for="col of getColumns", :value="col") {{ col }}
        .form-group
          label Longitude column
          select.form-control(v-model="longitudeCol")
            option(value="") -- No selection --
            option(v-for="col of getColumns", :value="col") {{ col }}
        .form-group
          label Radius {{ radiusInput }}
          input.form-control-range(type="range", min="0", max="20", step="1", v-model="radiusInput")
        .form-group
          label Blur {{ blurInput }}
          input.form-control-range(type="range", min="0", max="20", step="1", v-model="blurInput")
</template>

<script>
import {mapState, mapGetters} from 'vuex';

export default {
  computed: {
    ...mapState(['latitude', 'longitude', 'text', 'radius', 'blur']),
    ...mapGetters(['getColumns']),
    latitudeCol: {
      get() {
        return this.latitude;
      },
      set(value) {
        this.$store.commit('changeCol', {
          column: 'latitude',
          value,
        });
      },
    },
    longitudeCol: {
      get() {
        return this.longitude;
      },
      set(value) {
        this.$store.commit('changeCol', {
          column: 'longitude',
          value,
        });
      },
    },
    radiusInput: {
      get() {
        return this.radius;
      },
      set(value) {
        this.$store.commit('changeRadius', value);
      },
    },
    blurInput: {
      get() {
        return this.blur;
      },
      set(value) {
        this.$store.commit('changeBlur', value);
      },
    },
    textarea: {
      get() {
        return this.text;
      },
      set(value) {
        this.$store.dispatch('updateContent', value);
      },
    },
  },
};
</script>

<style scoped>
.maxHeight {
  max-height: 100vh;
  overflow-y: auto;
}
.smalltext {
  font-size: 14pt;
}
</style>
