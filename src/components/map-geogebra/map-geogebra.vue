<template lang="html">
  <div class="map-geogebra__wrapper">
    <openstreetmap
      v-model="osm"
      container="map"
      class="map-geogebra__stacked"
      :display-width="displayWidth"
      :display-height="displayHeight"
      @input="initCoords"
    />
    <div class="map-geogebra__stacked">
      <geogebra
        :value="value"
        :transparent="true"
        :display-width="osmWidth"
        :display-height="osmHeight"
        :view-rect="viewRect"
        :allow-pan="panConstraint"
        :allow-zoom="zoomConstraint"
        :xml="xml"
        :src="src"
        :toolbar="toolbar"
        @input="$emit('input', $event)"
        @load="onLoad"
        @pan="onPan"
        @zoom="onZoom"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
        @update="$emit('update', $event)"
        @select="$emit('select', $event)"
        @deselect="$emit('deselect', $event)"
        @click="$emit('click', $event)"
        @drop="$emit('drop', $event)"
        @tool="$emit('tool', $event)"
        @hover="$emit('hover', $event)"
      >
        <!-- Use the src argument to load a Geogebra worksheet from a URL
        Also, anything inside the pre tag will be constructed on top of that -->
        <slot />
      </geogebra>
    </div>
  </div>
</template>

<script>
import { Geogebra, Openstreetmap } from '../'

const LATITUDES = [-90, 90]
const LONGITUDES = [-180, 180]

export default {
  name: 'MapGeogebra',
  components: {
    Geogebra,
    Openstreetmap,
  },
  props: {
    value: {
      type: Object,
      default: () => ({ inputs: {}, outputs: {} }),
    },
    displayWidth: {
      type: [Number, String],
      default: '100%',
    },
    displayHeight: {
      type: [Number, String],
      default: 300,
    },

    viewRect: {
      type: Object,
      default: () => ({ x: [-50, 50], y: [-50, 50], contain: false }),
    },
    allowZoom: {
      type: Array,
      default: () => [0, 1],
    },
    allowPan: {
      type: Object,
      default: () => ({x: LONGITUDES, y: LATITUDES}),
    },
    src: {
      type: String,
      default: null,
    },
    toolbar: {
      type: [Array, String, Boolean],
      default: 'move',
    },
    xml: {
      type: String,
      default: null,
    },
    offset: {
      type: Object,
      default: () => ({x: 0, y: 0}),
    },
  },
  data: () => ({
    osm: null,
    osmWidth: null,
    osmHeight: null,
  }),
  computed: {
    panConstraint() {
      // Further constraint user-provided ranges for allowPan to only allow meaningful geocoordinates
      const p = this.allowPan
      if (p.x[0] < LONGITUDES[0]) { p.x[0] = LONGITUDES[0] }
      if (p.x[1] > LONGITUDES[1]) { p.x[1] = LONGITUDES[1] }
      if (p.y[0] < LATITUDES[0]) { p.y[0] = LATITUDES[0] }
      if (p.y[1] > LATITUDES[1]) { p.y[1] = LATITUDES[1] }
      return p
    },
    zoomConstraint() { return this.allowZoom },
    osmSize() {
      const { osm } = this
      return osm ? document.getElementById('map').getClientRects()[0] : null
    },
  },
  mounted() {
    window.addEventListener('resize', () => {
      const s = document.getElementById('map').getClientRects()[0]
      this.osmWidth = s.width
      this.osmHeight = s.height
    })
  },
  methods: {
    initCoords(osm) {
      window.ol.proj.useGeographic()
      const view = osm.getView()
      if (view) {
        const { viewRect: { x, y } } = this
        const d = this.offset
        const extent = [x[0] + d.x, y[0] + d.y, x[1] + d.x, y[1] + d.y]
        view.fit(extent)
      }
    },
    onLoad(e) {
      this.$nextTick(() => {
        const s = document.getElementById('map').getClientRects()[0]
        this.osmWidth = s.width
        this.osmHeight = s.height
      })
      this.$emit('load', e)
    },
    onPan(viewRect) {
      const { x, y } = viewRect
      // const c = r => (r[1] + r[0]) / 2
      // const center = [c(x), c(y)]
      const { osm } = this
      if (osm) {
        const view = osm.getView()
        if (view) {
          const d = this.offset
          const extent = [x[0] + d.x, y[0] + d.y, x[1] + d.x, y[1] + d.y]
          view.fit(extent)
          // view.setCenter(center)
        } else {
          console.warn('view is ', view)
        }
      } else {
        console.warn('osm is ', osm)
      }
      this.$emit('pan', viewRect)
    },
    onZoom(level) {
      const { osm } = this
      if (osm) {
        const view = osm.getView()
        if (view) {
          const { value: { viewRect: { x, y }} } = this
          const d = this.offset
          const extent = [x[0] + d.x, y[0] + d.y, x[1] + d.x, y[1] + d.y]
          view.fit(extent)
        } else {
          console.warn('view is ', view)
        }
      } else {
        console.warn('osm is ', osm)
      }
      this.$emit('zoom', level)
    },
  },
}
</script>

<style>
.map-geogebra__wrapper {
  position: relative;
}
.map-geogebra__stacked {
  position: absolute;
  left: 0;
  top: 0;
}
.ol-viewport {
  border-radius: 20px;
  filter: saturate(2.5);
}
.GeoGebraFrame {
  border-radius: 20px;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_button {
  border-radius: 30px !important;
}
</style>
