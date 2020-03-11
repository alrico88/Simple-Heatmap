import Vue from 'vue';
import Vuex from 'vuex';

function processCsv(csvString) {
  const withoutStrings = csvString.trim().replace(/"/g, '');
  const data = [];
  const [headerLine, ...rows] = withoutStrings.split('\n');
  const header = headerLine.split(',');
  for (let i = 0, len = rows.length; i < len; i++) {
    const obj = {};
    rows[i].split(',').forEach((column, index) => {
      obj[header[index]] = column;
    });
    data.push(obj);
  }
  return data;
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
        return state.parsed.map((d) => [Number(d[latCol]), Number(d[lonCol])]);
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
    updateContent(context, csvString) {
      context.commit('changeText', csvString);
      const parsedData = processCsv(csvString);
      context.commit('changeParsed', parsedData);
    },
  },
});
