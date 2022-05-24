<template lang="html">
  <div class="map-geogebra__wrapper" :style="{height: osmHeight + 'px'}">
    <div v-if="!transparent" class="map-geogebra__background" />
    <openstreetmap
      v-model="osm"
      container="map"
      class="map-geogebra__stacked map-geogebra__map"
      :class="showMap ? 'show' : 'hide'"
      :display-width="displayWidth"
      :display-height="displayHeight"
      @input="initCoords"
    />
    <div class="map-geogebra__stacked">
      <client-only>
        <geogebra
          :value="value"
          :transparent="true"
          :no-fullscreen="noFullscreen"
          :display-width="osmWidth"
          :display-height="osmHeight + 60"
          :view-rect="viewRect"
          :allow-pan="panConstraint"
          :allow-zoom="zoomConstraint"
          :xml="xml"
          :src="src"
          :toolbar="toolbar"
          @input="$emit('input', $event)"
          @load="onGeogebraLoad"
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
          @undo="$emit('undo', $event)"
          @redo="$emit('redo', $event)"
        >
          <!-- Use the src argument to load a Geogebra worksheet from a URL
          Also, anything inside the pre tag will be constructed on top of that -->
          <slot />
        </geogebra>
      </client-only>
    </div>
    <slot name="extend" />
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
    noFullscreen: {
      type: Boolean,
      default: true,
    },
    xml: {
      type: String,
      default: null,
    },
    offset: {
      type: Object,
      default: () => ({x: 0, y: 0}),
    },
    showMap: {
      type: Boolean,
      default: true,
    },
    transparent: {
      type: Boolean,
      default: false
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
      const m = document.getElementById('map')
      return (osm && m) ? m.getClientRects()[0] : null
    },
  },
  mounted() {
    const adjustSize = () => {
      const m = document.getElementById('map')
      if (m) {
        const s = m.getClientRects()[0]
        this.osmWidth = s.width
        this.osmHeight = s.height
      }
    }
    window.addEventListener('resize', adjustSize)
    setTimeout(adjustSize, 1000)
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
    onGeogebraLoad(e) {
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
  overflow: clip;
  border-radius: 20px;
  border: 1px solid lightgray;
}
.map-geogebra__background {
  position: absolute;
  border-radius: 20px;
  background: white;
  width: 100%;
  height: 100%;
}
.map-geogebra__stacked {
  position: absolute;
  left: 0;
  top: 0;
}
.map-geogebra__map.show {
  opacity: 1;
  transition: all 0.75s ease-out;
}
.map-geogebra__map.hide {
  opacity: 0;
  transition: all 0.75s ease-in;
}
.ol-viewport {
  border-radius: 20px;
}
.show .ol-viewport {
  filter: saturate(2.5) grayscale(0) blur(0);
  transition: all 0.75s ease-out;
}
.hide .ol-viewport {
  filter: saturate(1) grayscale(1) blur(2px);
  transition: all 0.75s ease-in;
}
.ol-zoom-in {
  display: none !important;
}
.ol-zoom-out {
  display: none !important;
}
.GeoGebraFrame {
  border-radius: 20px;
}
.GeoGebraFrame .toolbarPanel {
  position: absolute !important;
  background-color: #E6E6E6DE !important;
  z-index: 2 !important;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_button {
  border: none !important;
  background-color: inherit !important;
  border-radius: 30px !important;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_button[isSelected="true"] {
  background-color: #4D35C721 !important;
}
.ggbtoolbarpanel {
  width: 292px !important;
  margin: 20px !important;
  border-radius: 50px;
}
.gwt-SplitLayoutPanel {
  position: absolute;
}
.ol-attribution {
  display: none !important;
}
</style>
