import compact from 'lodash/compact';
import findIndex from 'lodash/findIndex';
import bbox from '@turf/bbox';

/**
 * Leaflet Map Class
 *
 * @export
 * @class LeafletMap
 */
export class LeafletMap {

  /**
   *Creates an instance of LeafletMap.
   * @param {string} element
   * @param {object} config
   * @param {number[]} config.startingCoords
   * @param {number} config.zoom
   * @param {string} config.style
   * @param {number} [config.minZoom]
   * @memberof LeafletMap
   */
  constructor(element, config) {
    this.layers = [];
    this.controls = [];
    this.config = config;
    this.baseTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: false,
        minZoom: this.config.minZoom ? this.config.minZoom : 6,
      },
    );
    this.createMap = () => {
      const map = L.map(element, {
        attributionControl: false,
      }).setView(this.config.startingCoords, this.config.zoom);
      // Set base tilelayer
      this.baseTile.addTo(map);
      return map;
    };
    this.map = this.createMap();
  }

  changeBaseTile(newTile) {
    this.baseTile.removeFrom(this.map);
    this.baseTile = L.tileLayer(newTile, {
      attribution: false,
      minZoom: this.config.minZoom ? this.config.minZoom : 6,
    });
    this.baseTile.addTo(this.map);
  }

  /**
   * Creates a Leaflet marker
   *
   * @param {object} point
   * @param {object} [markerOptions={}]
   * @param {{text: string, type: 'popup'|'tooltip'}} [popupContent = {}] - popup options
   * @param {{click: function, mouseover: function, mouseout: function}} [handlers={}]
   * @returns {object}
   * @memberof LeafletMap
   */
  createMarker(point, markerOptions = {}, popupContent = {}, handlers = {}) {
    const marker = L.marker([point.latitude, point.longitude], markerOptions);
    marker.info = point;
    if (popupContent.type) {
      let bindMethod;
      switch (popupContent.type) {
        case 'popup':
          bindMethod = 'bindPopup';
          break;
        case 'tooltip':
          bindMethod = 'bindTooltip';
          break;
        default:
          throw new Error('Unspecified popup type');
      }

      marker[bindMethod](popupContent.text, {
        closeButton: true,
        position: popupContent.position ? popupContent.position : 'top',
      });

      if (handlers.click) {
        marker.on('click', handlers.click);
      }
      if (handlers.mouseover) {
        marker.on('mouseover', handlers.mouseover);
      }
      if (handlers.mouseout) {
        marker.on('mouseout', handlers.mouseout);
      }
    }
    return marker;
  }

  /**
   * Adds marker to map
   *
   * @param {number[]} coords - latitude-longitude
   * @param {object} [markerOptions = {}]
   * @param {string} [popupContent] - html to show
   * @memberof LeafletMap
   */
  addMarker(coords, markerOptions = {}, popupContent) {
    const marker = L.marker(coords, markerOptions);
    if (popupContent) {
      marker
        .bindPopup(popupContent, {
          closeButton: false,
        })
        .on('mouseover', function() {
          this.openPopup();
        })
        .on('mouseout', function() {
          this.closePopup();
        });
    }
    this.layers.push({
      type: 'marker',
      layer: marker,
    });
    marker.addTo(this.map);
  }

  /**
   * Removes markers from map
   *
   * @memberof LeafletMap
   */
  removeMarkers() {
    this.layers.forEach((item, index) => {
      if (item.type === 'marker') {
        this.removeLayer(item.layer);
        this.layers[index] = null;
      }
    });
    this.layers = compact(this.layers);
  }

  /**
   * Adds GeoJSON layer to map
   *
   * @param {object} GeoJSON
   * @param {{onEachFeature: function, style: object}} [config={}]
   * @returns {object} - The added layer
   * @memberof LeafletMap
   */
  addGeoJSONLayer(GeoJSON, config = {}) {
    const layer = L.geoJSON(GeoJSON, config);
    const pos = findIndex(this.layers, (d) => d.type === 'geojson');
    if (pos !== -1) {
      this.removeLayer(this.layers[pos].layer);
    }
    this.layers.splice(pos, 1);
    layer.addTo(this.map);
    this.layers.push({
      type: 'geojson',
      layer,
    });
    this.reflowMap();
    return layer;
  }

  removeGeoJSONLayer() {
    const pos = findIndex(this.layers, (d) => d.type === 'geojson');
    if (pos !== -1) {
      this.removeLayer(this.layers[pos].layer);
    }
  }

  /**
   * Creates GeoJSON layer
   *
   * @param {object} GeoJSON
   * @param {{eachFeature: function, style: object}} [config={}]
   * @returns {object}
   * @memberof LeafletMap
   */
  createGeoJSONLayer(GeoJSON, config = {}) {
    return L.geoJSON(GeoJSON, config);
  }

  /**
   * Creates a heatmap layer
   *
   * @param {[number, number][]} points
   * @param {object} [options={}]
   * @returns {object}
   * @memberof LeafletMap
   */
  createHeatLayer(points, options = {}) {
    return L.heatLayer(points, options);
  }

  /**
   * Adds layer to map
   *
   * @param {object} layer
   * @param {string} layerId
   * @memberof LeafletMap
   */
  addLayer(layer, layerId) {
    if (this.layers.find((d) => d.id === layerId)) {
      this.removeLayerById(layerId);
    }
    this.map.addLayer(layer);
    this.layers.push({
      id: layerId,
      content: layer,
    });
  }

  /**
   * Removes layer from map
   *
   * @param {object|string} layer
   * @memberof LeafletMap
   */
  removeLayer(layer) {
    if (typeof layer === 'object') {
      this.map.removeLayer(layer);
    } else if (typeof layer === 'string') {
      const pos = findIndex(this.layers, (d) => d.id === layer);
      if (pos !== -1) {
        this.map.removeLayer(this.layers[pos].content);
      }
      this.layers.splice(pos, 1);
    } else {
      throw new Error('Invalid layer type');
    }
  }

  /**
   * Removes layer by ID
   *
   * @param {string} id
   * @memberof LeafletMap
   */
  removeLayerById(id) {
    const pos = findIndex(this.layers, (d) => d.id === id);
    if (pos !== -1) {
      this.map.removeLayer(this.layers[pos].content);
      this.layers[pos] = null;
      this.layers = compact(this.layers);
    }
  }

  /**
   * Finds layer in layers holder
   * @param {string} layerId
   * @returns {object|null}
   */
  findLayer(layerId) {
    const pos = findIndex(this.layers, (d) => d.id === layerId);
    return pos !== -1 ? this.layers[pos].content : null;
  }

  /**
   * Reflows map
   *
   * @memberof LeafletMap
   */
  reflowMap() {
    this.map.invalidateSize();
  }

  /**
   * Fits map to bounds
   *
   * @param {Object} BBox
   * @param {Number} BBox.minLat
   * @param {Number} BBox.minLon
   * @param {Number} BBox.maxLat
   * @param {Number} BBox.maxLon
   * @memberof LeafletMap
   */
  fitBounds(BBox) {
    const corner1 = L.latLng(BBox.minLat, BBox.minLon),
      corner2 = L.latLng(BBox.maxLat, BBox.maxLon);
    const bounds = L.latLngBounds(corner1, corner2);

    this.map.fitBounds(bounds);
  }

  /**
   * Gets bbox from a GeoJSON
   *
   * @param {object} GeoJSON
   * @returns {object}
   * @memberof LeafletMap
   */
  getGeoJSONBounds(GeoJSON) {
    const bboxArray = bbox(GeoJSON);
    return {
      minLon: bboxArray[0],
      minLat: bboxArray[1],
      maxLon: bboxArray[2],
      maxLat: bboxArray[3],
    };
  }

  /**
   * Adds control to map
   *
   * @param {object} control
   * @param {string} id
   * @memberof LeafletMap
   */
  addControl(control, id) {
    this.map.addControl(control);
    this.controls.push({
      id,
      control,
    });
  }

  /**
   * Removes control from map by id
   *
   * @param {string} id
   * @memberof LeafletMap
   */
  removeControlById(id) {
    const pos = findIndex(this.controls, (d) => d.id === id);
    if (pos !== -1) {
      this.map.removeControl(this.controls[pos].control);
      this.controls[pos] = null;
      this.controls = compact(this.controls);
    }
  }

  /**
   * Removes control from map
   *
   * @param {object} control
   * @memberof LeafletMap
   */
  removeControl(control) {
    this.map.removeControl(control);
  }

  /**
   * Moves map to desired location
   *
   * @param {number[]} coords
   * @param {number} zoom
   * @memberof LeafletMap
   */
  flyTo(coords, zoom) {
    if (zoom) {
      this.map.flyTo(coords, zoom);
    } else {
      this.map.flyTo(coords);
    }
  }

  /**
   * Creates a clustered leaflet layer
   *
   * @returns {object}
   * @memberof LeafletMap
   */
  createClusterLayer() {
    return L.markerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      animate: false,
      disableClusteringAtZoom: 18,
    });
  }

  /**
   * Creates FeatureGroup layer
   *
   * @returns
   * @memberof LeafletMap
   */
  createFeatureLayer() {
    return new L.FeatureGroup();
  }

  /**
   * Creates a circle marker
   *
   * @param {number[]} coords
   * @param {object} markerOptions
   * @param {string} popupContent
   */
  createCircleMarker(coords, markerOptions, popupContent) {
    const marker = L.circleMarker(coords, markerOptions);
    if (popupContent) {
      marker
        .bindPopup(popupContent, {
          closeButton: false,
        })
        .on('mouseover', function() {
          this.openPopup();
        })
        .on('mouseout', function() {
          this.closePopup();
        });
    }
    return marker;
  }

  /**
   * Creates a circle
   *
   * @param {number[]} coords
   * @param {object} circleOptions
   * @param {string} tooltipContent
   */
  createCircle(coords, circleOptions, tooltipContent) {
    const marker = L.circle(coords, circleOptions);
    if (tooltipContent) {
      marker
        .bindTooltip(tooltipContent, {
          closeButton: false,
        })
        .on('mouseover', function() {
          this.openTooltip();
        })
        .on('mouseout', function() {
          this.closeTooltip();
        });
    }
    return marker;
  }

  createRectangle(bounds, options = {}, tooltipContent) {
    if (!options.color) {
      options.color = 'blue';
    }

    if (!options.opacity) {
      options.opacity = 0.8;
    }

    const marker = L.rectangle(bounds, {
      color: options.color,
      weight: 1,
      fillOpacity: options.opacity,
    });

    if (tooltipContent) {
      marker
        .bindTooltip(tooltipContent, {
          closeButton: false,
        })
        .on('mouseover', function() {
          this.openTooltip();
        })
        .on('mouseout', function() {
          this.closeTooltip();
        });
    }

    return marker;
  }
}
