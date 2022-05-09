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
        v-model="ggb"
        :transparent="true"
        :display-width="osmWidth"
        :display-height="osmHeight"
        :view-rect="viewRect"
        :allow-pan="panConstraint"
        :allow-zoom="zoomConstraint"
        :xml="xml"
        :src="src"
        :toolbar="toolbar"
        @load="onLoad"
        @pan="onPan"
        @zoom="onZoom"
        @add="$emit('add')"
        @remove="$emit('remove')"
        @update="$emit('update')"
        @select="$emit('select')"
        @deselect="$emit('deselect')"
        @click="$emit('click')"
        @drop="$emit('drop')"
      >
        <!-- Use the src argument to load a Geogebra worksheet from a URL
        Also, anything inside the pre tag will be constructed on top of that -->
        <slot />
      </geogebra>
    </div>
  </div>
</template>

<script>
import { Geogebra, Openstreetmap } from 'math-components'

const LATITUDES = [-90, 90]
const LONGITUDES = [-180, 180]

export default {
  components: {
    Geogebra,
    Openstreetmap,
  },
  props: {
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
  },
  data: () => ({
    ggb: { api: null },
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
        const extent = [x[0], y[0], x[1], y[1]]
        view.fit(extent)
      }
    },
    onLoad() {
      this.$nextTick(() => {
        const s = document.getElementById('map').getClientRects()[0]
        this.osmWidth = s.width
        this.osmHeight = s.height
      })
    },
    onPan(viewRect) {
      const { x, y } = viewRect
      // const c = r => (r[1] + r[0]) / 2
      // const center = [c(x), c(y)]
      const { osm } = this
      if (osm) {
        const view = osm.getView()
        if (view) {
          const extent = [x[0], y[0], x[1], y[1]]
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
          const { ggb: { viewRect: { x, y }} } = this
          const extent = [x[0], y[0], x[1], y[1]]
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
</style>
