import Vue from 'vue';
import Vuex from 'vuex';
import * as formatcsv from '@fast-csv/parse';

function processCsv(csvString) {
  return new Promise((resolve, reject) => {
    const data = [];
    formatcsv
      .parseString(csvString, {headers: true})
      .on('error', (error) => reject(error))
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data));
    });
}

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    text: '',
    latitude: '',
    longitude: '',
    parsed: [],
    radius: 7,
    blur: 4,
  },
  getters: {
    getLocations(state) {
      const latCol = state.latitude;
      const lonCol = state.longitude;
      if (latCol === '' || lonCol === '') {
        return [];
      } else {
        return state.parsed.map((d) => [d[latCol], d[lonCol]]);
      }
    },
    getColumns(state) {
      return state.parsed.length > 0 ? Object.keys(state.parsed[0]) : [];
    },
  },
  mutations: {
    changeCol(state, {column, value}) {
      state[column] = value;
    },
    changeText(state, newText) {
      state.text = newText;
    },
    changeColumns(state, columns) {
      state.columns = columns;
    },
    changeParsed(state, data) {
      state.parsed = data;
    },
    changeRadius(state, value) {
      state.radius = Number(value);
    },
    changeBlur(state, value) {
      state.blur = Number(value);
    },
  },
  actions: {
    async updateContent(context, csvString) {
      context.commit('changeText', csvString);
      const parsedData = await processCsv(csvString);
      context.commit('changeParsed', parsedData);
    },
  },
});
