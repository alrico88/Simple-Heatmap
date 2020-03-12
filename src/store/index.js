import Vue from 'vue';
import Vuex from 'vuex';
import {createLinearScale} from 'scale-helper-functions';
import {calcDomain} from 'math-helper-functions';

function processCsv(csvString, delimiter) {
  const withoutStrings = csvString.trim().replace(/"/g, '');
  const data = [];
  const [headerLine, ...rows] = withoutStrings.split('\n');
  const header = headerLine.split(delimiter);
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
    multiplier: '',
    delimiter: ',',
    tileUrl:
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  },
  getters: {
    getLocations(state) {
      const latCol = state.latitude;
      const lonCol = state.longitude;
      if (latCol === '' || lonCol === '') {
        return [];
      } else {
        const mult = state.multiplier;
        if (mult !== '') {
          const domain = calcDomain(state.parsed, mult);
          const scale = createLinearScale(domain, [0, 1]);
          return state.parsed.map((d) => [Number(d[latCol]), Number(d[lonCol]), scale(d[mult])]);
        } else {
          return state.parsed.map((d) => [Number(d[latCol]), Number(d[lonCol])]);
        }
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
    changeDelimiter(state, value) {
      state.delimiter = value;
    },
    changeBaseTile(state, payload) {
      state.tileUrl = payload;
    },
  },
  actions: {
    updateContent(context, csvString) {
      context.commit('changeText', csvString);
      context.dispatch('parseData');
    },
    parseData(context) {
      const parsedData = processCsv(context.state.text, context.state.delimiter);
      context.commit('changeParsed', parsedData);
    },
  },
});
