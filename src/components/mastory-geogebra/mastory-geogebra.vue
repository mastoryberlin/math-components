<template lang="html">
  <vue-geogebra
    :value="value"
    :transparent="transparent"
    :no-fullscreen="noFullscreen"
    :display-width="displayWidth"
    :display-height="displayHeight"
    :view-rect="viewRect"
    :allow-pan="allowPan"
    :allow-zoom="allowZoom"
    :xml="xml"
    :src="src"
    :toolbar="toolbar"
    :custom-tools="customTools"
    :enable-undo-redo="enableUndoRedo"
    :use3d="use3d"
    @input="$emit('input', $event)"
    @pan="$emit('pan', $event)"
    @add="$emit('add', $event)"
    @remove="$emit('remove', $event)"
    @drop="$emit('drop', $event)"
    @update="onUpdate"
    @load="onLoad"
    @select="onSelect"
    @deselect="onDeselect"
    @click="onClick"
    @zoom="onZoom"
    @tool="onTool"
    @hover="onHover"
    @undo="onUndo"
    @redo="onRedo"
  >
    <img
      name="markOppositeAreaOverlayL2G"
      src="https://storage.googleapis.com/content_storage/shared/swap-area-l2g.svg"
      :visible="false"
      :size="1"
    >
    <img
      name="markOppositeAreaOverlayG2L"
      src="https://storage.googleapis.com/content_storage/shared/swap-area-g2l.svg"
      :visible="false"
      :size="1"
    >
    <slot />
  </vue-geogebra>
</template>

<script>
import { VueGeogebra, Point } from '../vue-geogebra'
import { LinearInequalityGraph } from './types'

import { customTools } from './custom-tools'
import { colorCycle } from './design'

const DELETE_INEQUALITY_DISTANCE_THRESHOLD = 1

// -------------------------------------------------------------------------

function sideToSign({inequality}, {x, y}, strict = false) {
  const compare = (a, b) => a < b ? (strict ? '<' : '<=') : a > b ? (strict ? '>' : '>=') : '='
  switch (inequality.isAxisParallel) {
  case 'x': return compare(y, inequality.yIntercept)
  case 'y': return compare(x, inequality.xIntercept)
  default: return compare(y, inequality.slope * x + inequality.yIntercept)
  }
}

// -------------------------------------------------------------------------

const indexedName = i => ({
  handle1: `InequalityHandle1_{${i}}`,
  handle2: `InequalityHandle2_{${i}}`,
  inequalityGraph: `inequalityGraph_{${i}}`,
})

// -------------------------------------------------------------------------

export default {
  components: {VueGeogebra},
  props: {
    // These properties are used internally to compute the size of the GGB applet
    displayWidth: { type: Number, default: 300 },
    displayHeight: { type: Number, default: 300 },

    // The object bound through v-model
    value: { type: Object, default: () => ({ inputs: {}, outputs: {} }) },

    viewRect: { type: Object, default: null },
    xml: { type: String, default: null },
    allowZoom: { type: Array, default: () => [0, 1] },
    allowPan: { type: Object, default: () => ({x: [-10, 10],y: [-10, 10] }) },
    src: { type: String, default: null },
    toolbar: { type: [Array, String, Boolean], default: null },
    transparent: { type: Boolean, default: false },
    noFullscreen: { type: Boolean, default: false },
    enableUndoRedo: { type: Boolean, default: true },
    use3d: { type: Boolean, default: false },
  },
  data: () => ({
    customTools,
    colorCycle,
    addInequalityInProgress: null,
    addInequalitiesCount: 0,
    selectedInequality: null,
    overlayText: null,
    shipPoint: [0, 0],
    destination: null,
    animator: null,
    ineqCnt: 0,
  }),
  computed: {
    addInequalityPhase() {
      const a = this.addInequalityInProgress
      if (a) {
        switch (a.type) {
          case 'Point': return 1
          case 'LinearInequalityGraph': return 2
        }
      }
      return 0
    },
  },
  watch: {
    toolbar() { this.resizeToolbar() },
  },
  mounted() {
    const { value } = this
    if (!value.inequalities) {
      value.inequalities = []
      this.$emit('input', value)
    }
  },
  methods: {

    // =========================================================================
    // Event Handlers
    // =========================================================================

    onZoom(e) { this.$emit('zoom', e) },
    onUndo(e) {
      this.selectedInequality = null
      this.$emit('undo', e)
    },
    onRedo(e) {
      const {value} = this
      var objArr = value.api.getAllObjectNames()
      for (var i = 0; i < objArr.length; i++) {
        var objName = objArr[i]
        if (this.findObjIdx(objName) !== '') {
          var idx = this.findObjIdx(objName)
          const ineqName = indexedName(idx).inequalityGraph
          this.onUpdate(`ineq__${ineqName}`)
          const ineq = this.findInequalityByName(`ineq__${ineqName}`)
          console.log('onRedo', objName, this.selectedInequality, value, ineq)
          value.add(ineq.line)
          this.$emit('input', value)
        }
      }
      this.selectedInequality = null
      this.$emit('redo', e)
    },

    // -------------------------------------------------------------------------

    onTool(e) {
      if (this.addInequalityInProgress && e !== 'add_inequality') { this.abortAddInequality() }
      else if (this.selectedInequality && e === 'delete_inequality') {
        this.deleteInequality(this.selectedInequality)
        const {value} = this
        value.tool = 'move'
        this.$emit('input', value)
        this.selectedInequality = null
      }

      this.$emit('tool', e)
    },

    // -------------------------------------------------------------------------

    onClick(coords) {
      if (this.isAddInequalityToolSelected()) { this.addInequality(coords) }
      else if (this.isDeleteInequalityToolSelected()) { this.deleteInequalityIfClose(coords) }
      else if (this.isDestinationToolSelected()) {
        // Degrees to radian then Math.PI/2 because of the orientation of the image
        this.goToDestination(coords)
      }

      this.$emit('click', coords)
    },

    // -------------------------------------------------------------------------

    onUpdate(objName) {
      const inequality = this.findInequalityByName(objName)
      if (inequality && inequality.handles.some(h => h.name === objName)) {
        const {value} = this
        inequality.showHandles = true
        const [handle1, handle2] = inequality.handles
        for (const lg of ['L2G', 'G2L']) {
          const img = value[`markOppositeAreaOverlay${lg}`]
          img.x = (handle1.x + handle2.x) / 2
          img.y = (handle1.y + handle2.y) / 2
          img.visible = true
        }
        this.$emit('update-inequality', inequality)
        this.$emit('input', value)
      }
      this.$emit('update', objName)
    },

    // -------------------------------------------------------------------------

    onHover(coords) {
      const {addInequalityPhase, addInequalityInProgress} = this
      if (this.isAddInequalityToolSelected() && addInequalityPhase === 2) {
        const sign = sideToSign(addInequalityInProgress, coords)
        addInequalityInProgress.sign = sign
      }
      this.$emit('hover', coords)
    },

    // -------------------------------------------------------------------------

    onSelect(name) {
      if (this.value[name]) {
        console.log('selected', name, this.value[name], this.value)
        const indx = this.findObjIdx(name)
        const ineqName = indexedName(indx).inequalityGraph
        const inequality = this.findInequalityByName(`ineq__${ineqName}`)
        const objName = this.value[name].name
        const objType = this.value[name].type
        if (inequality) {
          switch (objType) {
            case 'LinearInequality': case 'Point':
            {
              this.selectedInequality = inequality
              inequality.showHandles = true
              const {handles} = inequality
              const {value} = this
              const updatePosition = () => {
                const { value } = this
                for (const lg of ['L2G', 'G2L']) {
                  const img = value[`markOppositeAreaOverlay${lg}`]
                  img.x = (handles[0].x + handles[1].x) / 2
                  img.y = (handles[0].y + handles[1].y) / 2
                  img.angle = Math.atan2(inequality.slope, 1) * 180 / Math.PI
                  const fits = {'≤': 'L2G', '<': 'L2G', '≥': 'G2L', '>': 'G2L'}[inequality.sign[0]] === lg
                  img.visible = fits
                }
                this.$emit('input', value)
              }
              updatePosition()
              this.$emit('input', value)
            }
          }
        } else if (['markOppositeAreaOverlayL2G', 'markOppositeAreaOverlayG2L'].includes(objName)) {
          this.selectedInequality.inequality.oppositeSign()
          this.$emit('update-inequality', this.selectedInequality)
          return
        }
      }
      this.$emit('select', name)
    },

    // -------------------------------------------------------------------------

    onDeselect(name) {
      if (this.value[name]) {
        const indx = this.findObjIdx(name)
        const ineqName = indexedName(indx).inequalityGraph
        const inequality = this.findInequalityByName(`ineq__${ineqName}`)
        const objName = this.value[name].name
        const objType = this.value[name].type
        const {value} = this
        if (inequality) {
          if (objType === 'LinearInequality') {
            this.selectedInequality = inequality
            inequality.showHandles = false
            for (const lg of ['L2G', 'G2L']) { value[`markOppositeAreaOverlay${lg}`].visible = false  }
          } else if (objType === 'Point') {
            inequality.showHandles = false
            for (const lg of ['L2G', 'G2L']) { value[`markOppositeAreaOverlay${lg}`].visible = false  }
          }
          this.$emit('input', value)
        } else if (['markOppositeAreaOverlayL2G', 'markOppositeAreaOverlayG2L'].includes(objName)) {
          value[objName].visible = false
          this.$emit('input', value)
        }
      }
      this.$emit('deselect', name)
    },

    // -------------------------------------------------------------------------

    onLoad(e) {
      this.resizeToolbar()
      if (this.value && this.value.api) {
        const ggb = this.value
        if (ggb.inequalities) {
          for (const i of ggb.inequalities) {
            i.detach()
            i.attach(ggb.api)
          }
        }
      }
      this.$emit('load', e)
    },

    // =========================================================================
    // Helper Methods
    // =========================================================================

    isAddInequalityToolSelected() { return this.value.tool === 'add_inequality' },
    isDeleteInequalityToolSelected() { return this.value.tool === 'delete_inequality' },
    isDestinationToolSelected() {return this.value.tool === 'destination'},

    // -------------------------------------------------------------------------

    abortAddInequality() {
      console.log('Abort process of adding an inequality')
      this.value.remove(this.addInequalityInProgress)
      this.addInequalityInProgress = null
    },

    // -------------------------------------------------------------------------

    findInequalityByName(name) {
      if (this.value[name] && ['LinearInequalityGraph', 'LinearInequality', 'Point'].includes(this.value[name].type)) {
        return this.value.inequalities.find(i => [i,  i.inequality, ...i.handles].map(x => x.name).includes(name))
      } else {
        return null
      }
    },

    findObjIdx(name) {
      return name.substring(name.indexOf('{') + 1, name.lastIndexOf('}'))
    },

    // -------------------------------------------------------------------------

    addInequality(coords) {
      if (this.ineqCnt < 5) {
        const {x, y} = coords
        const {value, addInequalityPhase, colorCycle } = this

        const i = this.addInequalitiesCount
        const color = colorCycle[i % colorCycle.length]

        switch (addInequalityPhase) {
        case 0:
          {
            const handle1 = value.add(new Point(indexedName(i).handle1, x, y))
            handle1.color = color
            this.addInequalityInProgress = handle1 // -> after this, addInequalityPhase will be 1
          }
          break
        case 1:
          {
            const handle1 = this.addInequalityInProgress
            const handle2 = value.add(new Point(indexedName(i).handle2, x, y))
            const inequality = value.add(new LinearInequalityGraph(indexedName(i).inequalityGraph, handle1, handle2))
            const line = value.add(inequality.line)
            console.log('line', line)

            inequality.color = color // handle2's color will be set automatically
            this.addInequalityInProgress = inequality // -> after this, addInequalityPhase will be 2
          }
          break
        case 2:
          {
            const inequality = this.addInequalityInProgress
            inequality.sign = sideToSign(inequality, coords)
            const {value} = this
            value.inequalities.push(inequality)
            this.addInequalitiesCount++
            this.addInequalityInProgress = null // -> after this, addInequalityPhase will be 0
            value.tool = 'move'
            inequality.inequality.selectable = false
            inequality.showHandles = false
            this.ineqCnt++
            this.selectedInequality = null

            this.$emit('add-inequality', inequality)
            this.$emit('input', value)
            this.value.api.setUndoPoint()
          }
          break
        }
      }

    },

    // -------------------------------------------------------------------------

    deleteInequalityIfClose(coords) {
      const { value } = this
      if (!value.inequalities) { return }

      const {x, y} = coords
      const {abs, sqrt, pow} = Math

      for (const inequalityGraph of value.inequalities) {
        let dist, m, b
        const inequality = inequalityGraph.inequality

        switch (inequality.isAxisParallel) {
        case 'x':
          b = inequality.yIntercept
          dist = abs(y - b)
          break
        case 'y':
          dist = abs(x - inequality.xIntercept)
          break
        default:
          {
            m = inequality.slope
            b = inequality.yIntercept
            const m2 = pow(m, 2)
            dist = sqrt(
              (
                m2 * pow(x, 2) + pow(y, 2) + pow(b, 2) + 2 * (m*b*x - b*y - m*x*y)
              ) / (
                1 + m2
              )
            )
          }
        }

        //TODO: make distance depend on zoom level
        if (dist < DELETE_INEQUALITY_DISTANCE_THRESHOLD) {
          this.deleteInequality(inequalityGraph)
          this.ineqCnt--
          break
        }
      }
    },

    // -------------------------------------------------------------------------

    deleteInequality(inequality) {
      const {value} = this
      value.remove(inequality)
      const k = value.inequalities.indexOf(inequality)
      // let newName
      if (k < value.inequalities.length - 1) {
        const [color] = this.colorCycle.splice(k, 1)
        this.colorCycle.push(color)
      }
      value.inequalities.splice(k, 1)
      for (const lg of ['L2G', 'G2L']) { value[`markOppositeAreaOverlay${lg}`].visible = false }
      this.$emit('remove-inequality', inequality)
      this.$emit('input', value)
      this.value.api.setUndoPoint()
    },

    // -------------------------------------------------------------------------
    goToDestination(coords) {
      this.$emit('destination', {x: coords.x, y: coords.y})
    },
    // -------------------------------------------------------------------------

    resizeToolbar() {
      const toolbarPanel = this.$el.getElementsByClassName('ggbtoolbarpanel')[0]
      if (toolbarPanel) {
        const toolsCount = this.toolbar.split(/\s+|,/).length + (this.enableUndoRedo ? 2 : 0)
        const margin = this.enableUndoRedo ? 22 : 10
        toolbarPanel.style.width = `${toolsCount * 45 + margin}px`
      } else {
        console.warn('Cannot access toolbarpanel - this will likely result in a toolbar size mismatch')
      }
    },
  },
}
</script>

<style>
.GeoGebraFrame {
  border-radius: 20px;
}
.GeoGebraFrame .toolbarPanel {
  position: absolute;
  background-color: #E6E6E6DE;
  z-index: 2;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_button {
  border: none;
  background-color: inherit;
  border-radius: 30px;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_button[isSelected="true"] {
  background-color: #4D35C721;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_submenu .submenuContent .gwt-Label {
  padding: 7px 10px 0 7px !important;
  font-family: "Matter" sans-serif;
}
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_submenu .submenuContent img {
  display: none;
}
.ggbtoolbarpanel {
  margin: 20px;
  border-radius: 50px;
}
.gwt-SplitLayoutPanel {
  position: absolute;
}
.EuclidianPanel {
  position: relative;
}
</style>
