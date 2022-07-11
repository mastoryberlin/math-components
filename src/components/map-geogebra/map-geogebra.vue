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
      @input="isOsmLoaded = true"
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
        @load="isGeogebraLoaded = true"
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
      isOsmLoaded: false,
      isGeogebraLoaded: false,
    }
  },
  computed: {
    osmWidth() { return this.displayWidth },
    osmHeight() { return this.displayHeight - 54 },
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
    isOsmLoaded(n) { if (n && this.isGeogebraLoaded) {this.init()} },
    isGeogebraLoaded(n) { if (n && this.isOsmLoaded) {this.init()} },
  },
  methods: {
    injectGeogebra(applet) {
      const div = this.$refs.ggb.$el.getElementsByClassName('ggb-container')[0]
      applet.inject(div.id)
    },
    init() {
      // if (!this.osm) {
      //   this.$refs.osm.initialConfig()
      // }
      window.ol.proj.useGeographic()
      this.onResize()
      this.$emit('load', this.value)
    },
    onPan(viewRect) {
      this.letMapFollowViewRect()
      this.$emit('pan', viewRect)
    },
    onZoom(level) {
      this.letMapFollowViewRect()
      this.$emit('zoom', level)
    },
    async letMapFollowViewRect() {
      if (!this.isOsmLoaded || !this.isGeogebraLoaded) { return }
      const { osm } = this
      if (!osm) {
        console.warn('letMapFollowViewRect failed! osm is ', osm)
      }
      const view = osm.getView()
      if (!view) {
        console.warn('letMapFollowViewRect failed! osm.getView() returned ', view)
      }
      const d = this.offset
      const TOLERANCE = 1
      const extentsDiffer = (a, b) => {
        if (!a) { return true }
        const {abs} = Math
        let d = 0
        for (let i = 0; i < 4; i++) {
          d += abs(a[i] - b[i])
        }
        console.log(`Comparing extents IS: ${a} and SHOULD: ${b} - different: `, d > 4*TOLERANCE)
        return d > 4*TOLERANCE
      }
      const duration = 10
      let shouldBe, current
      while (extentsDiffer(current, shouldBe)) {
        const v = this.value.viewRect
        if (!v) { return }
        shouldBe = [v.x[0] + d.x, v.y[0] + d.y, v.x[1] + d.x, v.y[1] + d.y]
        const size = osm.getSize()
        const adjust = () => new Promise(callback => view.fit(shouldBe, {callback, size, duration}))
        await adjust()
        current = view.calculateExtent(size)
      }
    },
    onResize() {
      if (this.isOsmLoaded && this.isGeogebraLoaded) {
        this.osm.setSize([this.osmWidth, this.osmHeight])
        if (!this.value || !this.value.viewRect) { return }
        const v = this.value.viewRect
        const x1 = v.x
        const y1 = v.y
        setTimeout(() => {
          const v = this.value.viewRect
          const x2 = v.x
          const y2 = v.y
          if (x1[0] === x2[0] && x1[1] === x2[1] && y1[0] === y2[0] && y1[1] === y2[1]) {
            // viewRect hasn't changed for a while ->NOW ensureMatchingCoordinates
            this.letMapFollowViewRect()
          }
        }, 200)
      }
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
  transition: opacity 0.75s ease-out;
}
.map-geogebra__map.hide {
  opacity: 0;
  transition: opacity 0.75s ease-in;
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
