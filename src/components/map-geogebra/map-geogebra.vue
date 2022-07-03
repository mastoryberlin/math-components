<template lang="html">
  <div
    class="map-geogebra__wrapper"
    :style="{width: osmWidth + 'px', height: osmHeight + 'px'}"
  >
    <div
      v-if="!transparent"
      class="map-geogebra__background"
      :style="{width: osmWidth + 'px', height: osmHeight + 'px'}"
    />
    <openstreetmap
      v-model="osm"
      ref="osm"
      container="map"
      class="map-geogebra__stacked map-geogebra__map"
      :class="showMap ? 'show' : 'hide'"
      :display-width="osmWidth"
      :display-height="osmHeight"
      :flat="!spherical"
      @input="initCoords"
    />
    <div class="map-geogebra__stacked">
      <MastoryGeogebra
        ref="ggb"
        :value="value"
        :transparent="true"
        :no-fullscreen="noFullscreen"
        :display-width="displayWidth"
        :display-height="displayHeight"
        :view-rect="viewRect"
        :allow-pan="panConstraint"
        :allow-zoom="zoomConstraint"
        :xml="xml"
        :src="src"
        :toolbar="toolbar"
        :enable-undo-redo="enableUndoRedo"
        :use3d="use3d"
        @input="$emit('input', $event)"
        @load="onGeogebraLoad"
        @pan="onPan"
        @zoom="onZoom"
        @add="$emit('add', $event)"
        @remove="$emit('remove', $event)"
        @update="$emit('update', $event)"
        @add-inequality="$emit('add-inequality', $event)"
        @remove-inequality="$emit('remove-inequality', $event)"
        @update-inequality="$emit('update-inequality', $event)"
        @select="$emit('select', $event)"
        @deselect="$emit('deselect', $event)"
        @click="$emit('click', $event)"
        @drop="$emit('drop', $event)"
        @tool="$emit('tool', $event)"
        @hover="$emit('hover', $event)"
        @undo="$emit('undo', $event)"
        @redo="$emit('redo', $event)"
        @destination="$emit('destination', $event)"
      >
        <!-- Use the src argument to load a Geogebra worksheet from a URL
        Also, anything inside the pre tag will be constructed on top of that -->
        <slot />
      </MastoryGeogebra>
    </div>
    <slot name="extend" />
  </div>
</template>

<script>
import { Openstreetmap, MastoryGeogebra } from '../'

const LATITUDES = [-90, 90]
const LONGITUDES = [-180, 180]

export default {
  name: 'MapGeogebra',
  components: {
    MastoryGeogebra,
    Openstreetmap,
  },
  props: {
    value: { type: Object, default: () => ({ inputs: {}, outputs: {} }) },
    displayWidth: { type: Number, default: 300 },
    displayHeight: { type: Number, default: 300 },

    viewRect: { type: Object, default: () => ({ x: [-50, 50], y: [-50, 50], contain: false }) },
    allowZoom: { type: Array, default: () => [0, 1] },
    allowPan: { type: Object, default: () => ({x: LONGITUDES, y: LATITUDES}) },
    src: { type: String, default: null },
    toolbar: { type: [Array, String, Boolean], default: 'move' },
    noFullscreen: { type: Boolean, default: true },
    xml: { type: String, default: null },
    offset: { type: Object, default: () => ({x: 0, y: 0}) },
    showMap: { type: Boolean, default: true },
    transparent: { type: Boolean, default: false },
    spherical: { type: Boolean, default: false },
    enableUndoRedo: { type: Boolean, default: true },
    use3d: { type: Boolean, default: false },
  },
  data() {
    return {
      osm: null,
    }
  },
  computed: {
    osmWidth() { return this.displayWidth },
    osmHeight() { return this.displayHeight - 55 },
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
  },
  watch: {
    displayWidth() { this.onResize() },
    displayHeight() { this.onResize() },
  },
  methods: {
    injectGeogebra(applet) {
      const div = this.$refs.ggb.$el.getElementsByClassName('ggb-container')[0]
      applet.inject(div.id)
    },
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
      if (!this.osm) {
        this.$refs.osm.initialConfig()
      }
      this.$emit('load', e)
    },
    onPan(viewRect) {
      if (!viewRect) { return }
      const { x, y } = viewRect
      this.letMapFollowViewRect(x, y)
      this.$emit('pan', viewRect)
    },
    onZoom(level) {
      if (!this.value.viewRect) { return }
      const { value: { viewRect: { x, y }} } = this
      this.letMapFollowViewRect(x, y)
      this.$emit('zoom', level)
    },
    letMapFollowViewRect(xRange, yRange) {
      const { osm } = this
      if (osm) {
        const view = osm.getView()
        if (view) {
          const d = this.offset
          const extent = [xRange[0] + d.x, yRange[0] + d.y, xRange[1] + d.x, yRange[1] + d.y]
          view.fit(extent)
        } else {
          console.warn('view is ', view)
        }
      } else {
        console.warn('osm is ', osm)
      }
    },
    onResize() {
      console.log('onResize called')
      setTimeout(() => {
        if (this.osm) {
          this.osm.setSize([this.osmWidth, this.osmHeight])
          if (this.value) {
            const { value: { viewRect: { x, y }} } = this
            this.letMapFollowViewRect(x, y)
          }
        }
      }, 1500)
    }
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
.ol-attribution {
  display: none !important;
}
</style>
