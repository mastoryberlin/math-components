<template>
  <div :id="container" class="map" :style="{ width, height }" />
</template>

<script>
export default {
  name: "OpenStreetMap",
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
      type: [Number, String],
      default: "100%",
    },
    displayHeight: {
      type: [Number, String],
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
  },
  emits: ["input", "change", "change:pan", "change:zoom"],
  computed: {
    width: function () {
      const { displayWidth } = this;
      if (typeof displayWidth === "string") return displayWidth;
      return `${displayWidth}px`;
    },

    height: function () {
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

  mounted() {
    this.init();

    const { ol } = window;
    const { Map, layer, View, source, interaction } = ol; // proj

    this.internalValue = new Map({
      target: this.container,
      layers: [new layer.Tile({ source: new source.OSM() })],
      view: new View({
        center: this.initialCenter, // proj.fromLonLat([37.41, 8.82])
        zoom: this.initialZoom,
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

  methods: {
    init() {
      const URL =
        "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.14.1/build/ol.js";
      const scripts = [...document.getElementsByTagName("script")];

      if (scripts.some(({ src }) => src === URL)) return;

      const OpenStreetMapScript = document.createElement("script");
      OpenStreetMapScript.setAttribute("src", URL);
      document.head.appendChild(OpenStreetMapScript);
    },
  },
};
</script>

<style>
.map {
  width: 100%;
  height: auto;
}
</style>
