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
          .row.align-items-center
            .col-5
              label.mb-0 Paste the content as CSV or DSV
            .col-7.text-right
              ul.list-inline.mb-0
                li.list-inline-item Delimiter:
                li.list-inline-item
                  .btn-group
                    button.btn.btn-sm.btn-light(:class="{'active': delimiter === ','}", @click.prevent="changeDelimiter(',')") Comma
                    button.btn.btn-sm.btn-light(:class="{'active': delimiter === ';'}", @click.prevent="changeDelimiter(';')") Semicolon
          .row.mt-2
            .col
              textarea.form-control(rows="15", v-model="textarea")
        .form-group
          .row
            .col-sm-6.pr-1
              label Latitude column
              select.form-control(v-model="latitudeCol")
                option(value="") -- No selection --
                option(v-for="col of getColumns", :value="col") {{ col }}
            .col-sm-6.pl-1
              label Longitude column
              select.form-control(v-model="longitudeCol")
                option(value="") -- No selection --
                option(v-for="col of getColumns", :value="col") {{ col }}
        .form-group
          label Multiplier column
          select.form-control(v-model="multiplierCol")
            option(value="") -- No selection --
            option(v-for="col of getColumns", :value="col") {{ col }}
        .form-group
          label.mb-1 Map style
          select.form-control.mb-1(v-model="mapStyle")
            option(value="colourful") Colourful
            option(value="light") Light
            option(value="dark") Dark
        .form-group
          .custom-control.custom-switch
            input#showLabels.custom-control-input(type="checkbox", v-model="showLabels")
            label.custom-control-label(for="showLabels") Show map labels
        .form-group
          .row.align-items-center
            .col-6
              label Radius: {{ radiusInput }}
              input.form-control-range(type="range", min="0", max="20", step="1", v-model="radiusInput")
            .col-6
              label Blur: {{ blurInput }}
              input.form-control-range(type="range", min="0", max="20", step="1", v-model="blurInput")
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import debounce from 'lodash/debounce';

export default {
  data() {
    return {
      mapStyle: 'colourful',
      tileUrls: {
        light: {
          labels: 'light_all',
          noLabels: 'light_nolabels',
        },
        dark: {
          labels: 'dark_all',
          noLabels: 'dark_nolabels',
        },
        colourful: {
          labels: 'voyager',
          noLabels: 'voyager_nolabels',
        },
      },
      showLabels: true,
    };
  },
  computed: {
    ...mapState([
      'latitude',
      'longitude',
      'text',
      'radius',
      'blur',
      'multiplier',
      'delimiter',
    ]),
    ...mapGetters(['getColumns']),
    mapOptions() {
      const hasLabels = this.showLabels ? 'labels' : 'noLabels';
      const newTile = this.tileUrls[this.mapStyle][hasLabels];
      return `https://{s}.basemaps.cartocdn.com/rastertiles/${newTile}/{z}/{x}/{y}{r}.png`;
    },
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
    multiplierCol: {
      get() {
        return this.multiplier;
      },
      set(value) {
        this.$store.commit('changeCol', {
          column: 'multiplier',
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
  watch: {
    vizOptions: debounce(function(value) {
      this.$store.commit('updateVizOptions', value);
    }, 100),
    mapOptions(tileUrl) {
      this.$store.commit('changeBaseTile', tileUrl);
    },
  },
  methods: {
    changeDelimiter(newDelimiter) {
      this.$store.commit('changeDelimiter', newDelimiter);
      this.$store.dispatch('parseData');
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
