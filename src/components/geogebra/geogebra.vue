<script>
/* global GGBApplet */
import { tools } from './tools'

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
    api: null,
    previousViewProps: null,
    settingJSON: true,
    tools,
    selectedObjects: new Set(),
    prevSelectedObjects: new Set(),
  }),
  computed: {
    id() {
      return 'ggb' + this.instanceNumber
    },
  },
  watch: {
    displayWidth(n) {
      const { api, displayHeight } = this
      if (api) {
        api.setSize(n, displayHeight)
      }
    },
    displayHeight(n) {
      this.fixCSS()
    },
  },
  created() {
    this.setup(this.initialConfig)
  },

  beforeUnmount() {
    this.unregisterListeners()
  },

  methods: {
    setup(loadInitialConfig) {
      const URL = 'https://www.geogebra.org/apps/deployggb.js'
      const scripts = [...document.getElementsByTagName('script')]

      if (scripts.some(({ src }) => src === URL)) return

      const GeogebraScript = document.createElement('script')
      GeogebraScript.setAttribute('src', URL)
      GeogebraScript.onload = () => loadInitialConfig()
      document.head.appendChild(GeogebraScript)
    },

    initialConfig() {
      const self = this

      appletsCount += 1
      // console.log('Increasing appletsCount -> ' + appletsCount)
      self.instanceNumber = appletsCount

      // Retrieve all props (or their default values) from instance
      const {
        displayWidth,
        displayHeight,
        src,
        toolbar,
        xml,
        transparent,

        capturingThreshold,
        scale,
        buttonRounding,
        ggbBase64,
        appName,
        language,
        showResetIcon,
        enableLabelDrags,
        errorDialogsActive,
        useBrowserForJS,
        allowStyleBar,
        preventFocus,
        disableAutoScale,
        allowUpscale,
        buttonShadows,
      } = self

      const params = {
        scaleContainerClass: 'ggb-container',
        width: displayWidth,
        height: displayHeight,
        enableRightClick: false,
        perspective: 'G',
        showMenuBar: false,
        showAlgebraInput: false,
        showToolBarHelp: false,
        showZoomButtons: false,
        showFullscreenButton: true,
        clickToLoad: false,
        editorBackgroundColor: '#000000',
        transparentGraphics: transparent,
      }

      if (src) {
        params.filename = src
      }
      if (toolbar !== null) {
        params.showToolBar = !!toolbar
        if ([Array, String].includes(toolbar.constructor)) {
          const t =
            toolbar.constructor === Array
              ? toolbar
              : toolbar.split(/[,;]|[,;]?\s+|\s+[,;]?/g)
          params.customToolBar = t.map(name => {
            const tl = this.tools.find(l => l.name === name)
            return tl ? tl.id : null
          }).filter(l => l !== null).join('|')
        } else {
          params.customToolBar = ''
        }
      }

      // Include them in the params object used to create GGBApplet
      if (capturingThreshold) {
        params.capturingThreshold = capturingThreshold
      }
      if (scale) {
        params.scale = scale
      }
      if (buttonRounding) {
        params.buttonRounding = buttonRounding
      }
      if (ggbBase64) {
        params.ggbBase64 = ggbBase64
      }
      if (appName) {
        params.appName = appName
      }
      if (language) {
        params.language = language
      }
      if (showResetIcon) {
        params.showResetIcon = showResetIcon
      }
      if (enableLabelDrags) {
        params.enableLabelDrags = enableLabelDrags
      }
      if (errorDialogsActive) {
        params.errorDialogsActive = errorDialogsActive
      }
      if (useBrowserForJS) {
        params.useBrowserForJS = useBrowserForJS
      }
      if (allowStyleBar) {
        params.allowStyleBar = allowStyleBar
      }
      if (preventFocus) {
        params.preventFocus = preventFocus
      }
      if (disableAutoScale) {
        params.disableAutoScale = disableAutoScale
      }
      if (allowUpscale) {
        params.allowUpscale = allowUpscale
      }
      if (buttonShadows) {
        params.buttonShadows = buttonShadows
      }

      let commands = []
      let images = []
      if (!xml) {
        // If xml prop is set, use this to load previous state
        // – if not, execute any GGB commands passed to the default slot as text content
        const slot = self.$slots.default
        if (slot && slot.length > 0) {
          for (const el of slot) {
            switch (el.tag) {
            case 'pre':
              {
                const text = el.children[0].text
                if (text) {
                  commands.push(...text.split('\n'))
                }
              }
              break
            case 'img':
              {
                const {src, handles} = el.data.attrs
                if (!src) {
                  console.warn('Geogebra: Encountered embedded <img> element without a src attribute.')
                } else if (!handles
                  || handles.constructor !== Array
                  || handles.length !== 2
                  || handles.some(h => ![String, Object].includes(h.constructor))
                  || handles.some(h => h.constructor === Object && (
                    !h.name || h.name.constructor !== String || (h.x !== undefined && h.y === undefined) || (h.y  !== undefined && h.x  === undefined) || (h.x  !== undefined && h.y  !== undefined && [h.x, h.y].some(p => p.constructor !== Number))
                  ))
                ) {
                  console.warn('Geogebra: Encountered embedded <img> element with invalid handles attribute - make sure to pass an array of length 2, where each element is either a String providing the handle name or an object of the form {name, x, y} to additionally define the location.')
                } else {
                  images.push({
                    src,
                    handles,
                  })
                }
              }
              break
            }
          }
        }
      }

      params.appletOnLoad = (api) => {
        if (api) {
          if (xml) {
            api.setXML(xml)
          } else if (this.settingJSON) {
            if (images.length > 0) {
              const json = api.getFileJSON()
              const xmlPart = json.archive.find(item => item.fileName.endsWith('.xml') && item.fileContent.includes('<construction'))
              xmlPart.fileContent = xmlPart.fileContent.replace('</construction>', images.map((i, n) => {
                const [ p1, p2 ] = i.handles.map(h => h.constructor === Object ? {...h} : {name: h})
                return `
<element type="point" label="${p1.name}">
  <show object="false" label="false"/>
  <objColor r="77" g="77" b="255" alpha="0"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="1" playing="false"/>
  <coords x="${p1.x || 0}" y="${p1.y || 0}" z="1"/>
  <pointSize val="5"/>
  <pointStyle val="0"/>
</element>
<element type="point" label="${p2.name}">
  <show object="false" label="false"/>
  <objColor r="77" g="77" b="255" alpha="0"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="1" playing="false"/>
  <coords x="${p2.x || 1}" y="${p2.y || 0}" z="1"/>
  <pointSize val="5"/>
  <pointStyle val="0"/>
</element>
<element type="image" label="EmbeddedImage${n+1}">
  <file name="embedded-image${n+1}.png"/>
  <inBackground val="false"/>
  <startPoint number="0" exp="${p1.name}"/>
  <startPoint number="1" exp="${p2.name}"/>
  <show object="true" label="true"/>
  <objColor r="0" g="0" b="0" alpha="1"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="0" playing="false"/>
</element>`
}) + '</construction>')
              json.archive.push(...images.map((i, n) => ({
                fileName: `embedded-image${n+1}.png`,
                fileContent: i.src,
              })))
              // console.log('Embedding images', images, json, xmlPart)
              this.settingJSON = false
              api.setFileJSON(json)
              return
            }
          }

          self.api = api

          commands.forEach((cmd) => {
            if (cmd.trim() !== '') {
              api.evalCommand(cmd)
            }
          })

          if (self.viewRect) {
            self.setViewRect(self.viewRect)
          }

          // Make API object accessible from v-model bound variable
          const { value } = self
          const _self = self
          self.$emit('input', {
            ...value,
            get viewRect() {
              return _self.getViewRect()
            },
            set viewRect(v) {
              _self.setViewRect(v)
            },
            get xml() {
              return _self.api.getXML()
            },
            set xml(v) {
              _self.api.setXML(v)
            },
            api,
          })

          self.fixCSS()
          self.registerListeners()
          self.$emit('load')
        }
      }
      // Create GGB applet
      const applet = new GGBApplet(params, false) // used to be '5.0'

      applet.setPreviewImage(
        null,
        'https://mastory.io/get-in-touch-logo.svg',
        'https://www.geogebra.org/images/applet_play.png'
      )
      const codebase = 'https://apps-builds.s3-eu-central-1.amazonaws.com/geogebra/branches/dev/latest/web3d/'
      applet.setHTML5Codebase(codebase)
      self.applet = applet

      const { id } = self
      console.log('Injecting applet into DIV with id ' + id)
      self.$nextTick(() => applet.inject(id))
    },

    emitSelectDeselectEvents() {
      const difference = (setA, setB) => {
        let _difference = new Set(setA)
        for (let elem of setB) {
            _difference.delete(elem)
        }
        return _difference
      }
      const {selectedObjects, prevSelectedObjects} = this
      const newlySelected = difference(selectedObjects, prevSelectedObjects)
      const deselected = difference(prevSelectedObjects, selectedObjects)
      deselected.forEach(name => {
        this.$emit('deselect', name)
      })
      newlySelected.forEach(name => {
        this.$emit('select', name)
      })
    },

    registerListeners() {
      const { id, api } = this
      window[id + 'AddListener'] = (name) => {
        this.addListener(name)
      }
      window[id + 'RemoveListener'] = (name) => {
        this.removeListener(name)
      }
      window[id + 'UpdateListener'] = (name) => {
        this.updateListener(name)
      }
      window[id + 'ClientListener'] = (event) => {
        this.clientListener(event)
      }

      api.registerAddListener(id + 'AddListener')
      api.registerRemoveListener(id + 'RemoveListener')
      api.registerUpdateListener(id + 'UpdateListener')
      api.registerClientListener(id + 'ClientListener')

      const canvas = document.getElementById(id).getElementsByTagName('canvas')[0]
      canvas.addEventListener('mousemove', e => {
        const {invXscale, invYscale, xMin, yMin, height} = JSON.parse(api.getViewProperties())
        const x = xMin + e.layerX * invXscale
        const y = yMin + (height - e.layerY) * invYscale
        this.$emit('hover', {x, y})
      })
    },

    unregisterListeners() {
      const { id, api } = this
      window[id + 'AddListener'] = null
      window[id + 'RemoveListener'] = null
      window[id + 'UpdateListener'] = null
      window[id + 'ClientListener'] = null

      api.unregisterAddListener(id + 'AddListener')
      api.unregisterRemoveListener(id + 'RemoveListener')
      api.unregisterUpdateListener(id + 'UpdateListener')
      api.unregisterClientListener(id + 'ClientListener')
    },

    clientListener(event) {
      const { api } = this
      switch (event[0]) {
        case 'updateStyle':
          // let label = event[1]
          // console.log(label + ' has changed style')
          //
          // let xml = this.api.getXML(label)
          // console.log(xml)

          // this.evalXML(xapi2, xml);
          break

        case 'setMode':
          {
            const tl = this.tools.find(t => t.id === Number.parseInt(event[2]))
            this.$emit('tool', tl ? tl.name : undefined)
          }
          break
        case 'deselect':
          this.prevSelectedObjects = new Set([...this.selectedObjects])
          this.selectedObjects.clear()
          this.emitSelectDeselectEvents()
          break // xapi2.evalCommand("SelectObjects[]");
        case 'select':
          this.prevSelectedObjects = new Set([...this.selectedObjects])
          this.selectedObjects.add(event[1])
          this.emitSelectDeselectEvents()
          break // xapi2.evalCommand("SelectObjects[" + event[1] + "]");
        case 'mouseDown':
          {
            const { x, y } = event
            this.$emit('click', { x, y })
          }
          break
        case 'addPolygon':
          console.log('****** POLYGON START ******')
          break
        case 'addPolygonComplete':
          console.log('****** POLYGON ' + event[0] + ' FINISHED ******')
          break

        case 'viewChanged2D':
          {
            const props = JSON.parse(api.getViewProperties())

            let { xMin, yMin } = props
            const { width, height } = props

            const { allowZoom, allowPan } = this

            if (!this.previousViewProps) {
              let scale = props.invXscale
              if (scale < allowZoom[0]) {
                scale = allowZoom[0]
              } else if (scale > allowZoom[1]) {
                scale = allowZoom[1]
              }
              this.previousViewProps = {
                ...props,
                invXscale: scale,
                invYscale: scale,
              }
              api.setCoordSystem(
                xMin,
                xMin + width * scale,
                yMin,
                yMin + height * scale
              )
              return
            }

            // assuming xScale / yScale is fixed, it is
            // enough to check xScale only
            const scale = props.invXscale
            if (scale < allowZoom[0] || scale > allowZoom[1]) {
              const { width, height, invXscale } = this.previousViewProps
              let { xMin, yMin } = this.previousViewProps
              const w = width * invXscale,
                h = height * invXscale
              if (
                props.xMin >= allowPan.x[0] &&
                props.xMin + w <= allowPan.x[1]
              ) {
                xMin = props.xMin
              }
              if (
                props.yMin >= allowPan.y[0] &&
                props.yMin + h <= allowPan.y[1]
              ) {
                yMin = props.yMin
              }
              api.setCoordSystem(xMin, xMin + w, yMin, yMin + h)
              return
            } else if (scale !== this.previousViewProps.invXscale) {
              this.$emit('zoom', scale)
            }

            const w = width * scale
            const h = height * scale

            let adjust = false
            if (xMin < allowPan.x[0]) {
              xMin = allowPan.x[0]
              adjust = true
            } else if (xMin + w > allowPan.x[1]) {
              xMin = allowPan.x[1] - w
              adjust = true
            }

            if (yMin < allowPan.y[0]) {
              yMin = allowPan.y[0]
              adjust = true
            } else if (yMin + h > allowPan.y[1]) {
              yMin = allowPan.y[1] - h
              adjust = true
            }

            if (adjust) {
              api.setCoordSystem(xMin, xMin + w, yMin, yMin + h)
            }

            this.previousViewProps = props
            this.$emit('pan', { x: [xMin, xMin + w], y: [yMin, yMin + h] })
          }
          break

        case 'dragEnd':
          {
            const object = event[1]
            const type = api.getObjectType(object)
            const coords = ['point', 'vector'].includes(type)
              ? { x: api.getXcoord(object), y: api.getYcoord(object) }
              : {}
            this.$emit('update', object)
            this.$emit('drop', { object, ...coords })
          }
          break

        case 'showStyleBar':
          console.log('showStyleBar')
          break

        case 'editorStart':
          console.log('editorStart')
          break

        /* case "editorKeyTyped":
          var state = xapi1.getEditorState();
          console.log(state, event[1]);
          console.log(event[1]);
          console.log(xapi2.getEditorState());
          xapi2.setEditorState(state);
          break;

        case "editorStop":
          xapi2.setEditorState({ content: "" });
          break;

        case "perspectiveChange":
          console.log("perspectiveChange");
          break;

        case "dropdownOpened":
          console.log("dropdownOpened, label =  " + event.argument);
          break;

        case "dropdownItemFocused":
          console.log(
            "dropdownItemFocused, label = " +
              event.argument +
              " index = " +
              event.index
          );
          break;

        case "dropdownClosed":
          console.log(
            "dropdownClosed, label = " +
              event.argument +
              " index = " +
              event.index
          );
          break;
        */

        case 'undo':
          this.$emit('undo')
          break
        case 'redo':
          this.$emit('redo')
          break
        case 'deleteGeos':
          this.$emit('remove', event[1])
          break

        default:
          console.warn('unhandled event ' + event[0] + ' ' + event)
      }
    },

    addListener(objectName) {
      if (this.api) {
        this.updateOutputs()
        this.$emit('add', objectName)
      }
    },

    removeListener(objectName) {
      if (this.api) {
        this.updateOutputs()
        this.$emit('remove', objectName)
      }
    },

    updateListener(objectName) {
      if (this.api) {
        this.updateOutputs()
        this.$emit('update', objectName)
      }
    },

    updateOutputs() {
      const {
        api,
        value: { outputs },
      } = this
      if (!outputs) {
        return
      }
      const objects = api.getAllObjectNames()
      objects.forEach((name) => {
        if (Object.hasOwn(outputs, name)) {
          const v = api.getValue(name)
          outputs[name] = v
        }
      })
    },

    getViewRect() {
      const { xMin, yMin, width, height, invXscale } = JSON.parse(
        this.api.getViewProperties()
      )
      return {
        x: [xMin, xMin + width * invXscale],
        y: [yMin, yMin + height * invXscale],
      }
    },
    setViewRect({ x, y, contain }) {
      if (!x || !x) {
        return
      }

      const w = x[1] - x[0],
        h = y[1] - y[0]
      if (w <= 0 || h <= 0) {
        console.warn('Ignoring viewRect prop: Invalid ranges')
      } else {
        const { width, height } = JSON.parse(this.api.getViewProperties())
        const aspectRatio = width / height
        if ((contain && w < h) || (!contain && w > h)) {
          const newH = w / aspectRatio
          const cy = y[0] + h / 2
          y[0] = cy - newH / 2
          y[1] = cy + newH / 2
        } else {
          const newW = h * aspectRatio
          const cx = x[0] + w / 2
          x[0] = cx - newW / 2
          x[1] = cx + newW / 2
        }
        this.api.setCoordSystem(x[0], x[1], y[0], y[1])
      }
    },

    fixCSS() {
      const n = this.displayHeight
      const el = document.getElementById(this.id)
      const panel = el.getElementsByClassName('EuclidianPanel')[0]
      panel.style.height = n + 'px'
      const canvas = el.getElementsByTagName('canvas')[0]
      canvas.setAttribute('height', n - 55)
      canvas.style.height = n + 'px'
    },
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
.GeoGebraFrame .toolbarPanel .toolBPanel .toolbar_button {
  border-radius: 30px;
}
.GeoGebraFrame .toolbarPanel {
  position: absolute;
  background-color: #E6E6E6DE;
}
.ggbtoolbarpanel {
  width: 200px;
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
