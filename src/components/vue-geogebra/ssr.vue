<script>
let appletsCount = 0

export default {
  props: {
    // These properties are used internally to compute the size of the GGB applet
    displayWidth: {
      type: Number,
      default: 300,
    },
    displayHeight: {
      type: Number,
      default: 300,
    },

    // The object bound through v-model; used to store a reference to the API
    // object and to maintain input & output variables
    value: {
      type: Object,
      default: () => ({ inputs: {}, outputs: {} }),
    },

    viewRect: {
      type: Object,
      default: null,
    },
    xml: {
      type: String,
      default: null,
    },
    allowZoom: {
      type: Array,
      default: () => [0, 1],
    },
    allowPan: {
      type: Object,
      default: () => ({
        x: [-10, 10],
        y: [-10, 10],
      }),
    },
    src: {
      type: String,
      default: null,
    },
    toolbar: {
      type: [Array, String, Boolean],
      default: null,
    },
    transparent: {
      type: Boolean,
      default: false,
    },
    noFullscreen: {
      type: Boolean,
      default: false,
    },

    capturingThreshold: {
      type: Number,
      default: 3,
    },
    scale: {
      type: Number,
      default: 1,
    },
    buttonRounding: {
      type: Number,
      default: 1.5,
    },
    ggbBase64: {
      type: String,
      default: null,
    },
    appName: {
      type: String,
      default: 'classic',
    },
    language: {
      type: String,
      default: 'en',
    },
    showResetIcon: {
      type: Boolean,
      default: false,
    },
    enableLabelDrags: {
      type: Boolean,
      default: false,
    },
    errorDialogsActive: {
      type: Boolean,
      default: false,
    },
    useBrowserForJS: {
      type: Boolean,
      default: false,
    },
    allowStyleBar: {
      type: Boolean,
      default: false,
    },
    preventFocus: {
      type: Boolean,
      default: false,
    },
    disableAutoScale: {
      type: Boolean,
      default: false,
    },
    allowUpscale: {
      type: Boolean,
      default: false,
    },
    clickToLoad: {
      type: Boolean,
      default: false,
    },
    buttonShadows: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'input',
    'zoom',
    'pan',
    'tool',
    'select',
    'deselect',
    'click',
    'drop',
    'add',
    'remove',
    'update',
    'undo',
    'redo',
    'hover',
  ],
  data: () => ({
    instanceNumber: 0,
    applet: null,
  }),
  computed: {
    id() {
      return 'ggb' + this.instanceNumber
    },
  },
  created() {
    appletsCount += 1
    this.instanceNumber = appletsCount
  },
  render(createElement) {
    const { id } = this
    return createElement('div', {
      attrs: { id },
      class: ['ggb-container'],
    })
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
.ggbtoolbarpanel {
  width: 292px;
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
