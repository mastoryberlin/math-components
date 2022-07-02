<template>
  <div :id="container" class="map" :style="{ width, height }" />
</template>

<script>
export default {
  name: "Openstreetmap",
  props: {
    value: {
      type: Object,
      default: null,
    },
    container: {
      type: String,
      default: "map",
    },
    displayWidth: {
      type: Number,
      default: 300,
    },
    displayHeight: {
      type: Number,
      default: 300,
    },
    allowPan: {
      type: Boolean,
      default: true,
    },
    allowZoom: {
      type: Boolean,
      default: true,
    },
    initialZoom: {
      type: Number,
      default: 4,
    },
    initialCenter: {
      type: Array,
      default: () => [0, 0],
    },
    flat: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["input", "change", "change:pan", "change:zoom"],

  computed: {
    width() {
      const { displayWidth } = this;
      if (typeof displayWidth === "string") return displayWidth;
      return `${displayWidth}px`;
    },

    height() {
      const { displayHeight } = this;
      if (typeof displayHeight === "string") return displayHeight;
      return `${displayHeight}px`;
    },

    internalValue: {
      get: function () {
        return this.value;
      },
      set(value) {
        return this.$emit("input", value);
      },
    },

    isAllowPan: function () {
      return this.allowPan;
    },

    isAllowZoom: function () {
      return this.allowZoom;
    },
  },

  created() {
    if (process.client) {
      this.setup(this.initialConfig)
    }
  },

  methods: {
    setup(loadInitialConfig) {
      const URL_SCRIPTS =
        "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.14.1/build/ol.js";

      const URL_STYLE =
        "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.14.1/css/ol.css";

      const scripts = [...document.getElementsByTagName("script")];
      if (scripts.some(({ src }) => src !== URL_SCRIPTS)) {
        const OpenStreetMapScript = document.createElement("script");
        OpenStreetMapScript.onload = () => loadInitialConfig();
        OpenStreetMapScript.setAttribute("src", URL_SCRIPTS);
        document.head.appendChild(OpenStreetMapScript);
      }

      const styles = [...document.getElementsByTagName("link")];
      if (styles.some(({ href }) => href !== URL_STYLE)) {
        const OpenStreetMapStyles = document.createElement("link");
        OpenStreetMapStyles.setAttribute("href", URL_STYLE);
        OpenStreetMapStyles.setAttribute("rel", "stylesheet");
        document.head.appendChild(OpenStreetMapStyles);
      }
    },

    initialConfig() {
      const self = this;

      const openlayer = window.ol;
      const { Map, layer, View, source, interaction } = openlayer; // proj

      self.internalValue = new Map({
        target: this.container,
        layers: [new layer.Tile({ source: new source.OSM() })],
        view: new View({
          center: this.initialCenter, // proj.fromLonLat([37.41, 8.82])
          zoom: this.initialZoom,
          projection: this.flat ? 'EPSG:4326' : 'EPSG:3857',
        }),
        interactions: [
          new interaction.DragPan({
            condition: (event) => {
              this.$emit("change", event);
              this.$emit("change:pan", event);
              return this.isAllowPan;
            },
          }),

          new interaction.MouseWheelZoom({
            condition: (event) => {
              this.$emit("change", event);
              this.$emit("change:zoom", event);
              return this.isAllowZoom;
            },
          }),
        ],
      });
    },
  },
};
</script>
