<script>
/* global GGBApplet */
import { stdTools } from './tools'
import { GeogebraNumber, Label, Image, Point, LinearInequality, LinearEquation } from './types'
// import { LinearInequalityGraph } from './types'
// import { LinearEquationGraph } from './types'


let appletsCount = 0

export default {
  props: {
    // These properties are used internally to compute the size of the GGB applet
    displayWidth: { type: Number, default: 300 },
    displayHeight: { type: Number, default: 300 },

    // The object bound through v-model
    value: { type: Object, default: () => ({ inputs: {}, outputs: {} }) },

    // Custom component properties
    viewRect: { type: Object, default: null },
    xml: { type: String, default: null },
    allowZoom: { type: Array, default: () => [0, 1] },
    allowPan: { type: Object, default: () => ({ x: [-10, 10], y: [-10, 10] }) },
    src: { type: String, default: null },
    toolbar: { type: [Array, String, Boolean], default: null },
    transparent: { type: Boolean, default: false },
    noFullscreen: { type: Boolean, default: false },
    customTools: { type: Array, default: () => ([]) },

    // Props that directly forward to Geogebra applet params
    capturingThreshold: { type: Number, default: 3 },
    scale: { type: Number, default: 1 },
    buttonRounding: { type: Number, default: 1.5 },
    ggbBase64: { type: String, default: null },
    appName: { type: String, default: 'classic' },
    language: { type: String, default: 'en' },
    showResetIcon: { type: Boolean, default: false },
    enableLabelDrags: { type: Boolean, default: false },
    errorDialogsActive: { type: Boolean, default: false },
    useBrowserForJS: { type: Boolean, default: false },
    allowStyleBar: { type: Boolean, default: false },
    preventFocus: { type: Boolean, default: false },
    disableAutoScale: { type: Boolean, default: false },
    allowUpscale: { type: Boolean, default: false },
    clickToLoad: { type: Boolean, default: false },
    buttonShadows: { type: Boolean, default: false },
    enableUndoRedo: { type: Boolean, default: true },
  },
  emits: [
    'input',
    'before-load',
    'load',
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
    selectedObjects: new Set(),
    prevSelectedObjects: new Set(),
    suspendAddListener: false,
  }),
  computed: {
    id() {
      return 'ggb' + this.instanceNumber
    },
    tools() {
      return [...stdTools, ...this.customTools]
    },
  },
  watch: {
    displayWidth(n) {
      if (this.api) { this.api.setWidth(n) }
      this.resize()
    },
    displayHeight(n) {
      if (this.api) { this.api.setHeight(n) }
      this.resize()
    },
  },

  // =========================================================================
  // Lifecycle Hooks
  // =========================================================================

  created() {
    appletsCount += 1
    this.instanceNumber = appletsCount
  },

  beforeMount() {
    this.setup(this.initialConfig)
  },

  beforeUnmount() {
    this.unregisterListeners()
  },

  methods: {

    // =========================================================================
    // Public API
    // =========================================================================

    add(object) {
      if (typeof object !== 'object') { throw new TypeError(`VueGeogebra: add() must be passed a GeogebraObject or a descendant of it.`) }

      const { api, value } = this
      //TODO: check if object of same name already exists

      this.suspendAddListener = true
      object.attach(api)
      this.suspendAddListener = false
      if (value) {
        value[object.name] = object
        this.$emit('input', value)
      }

      return object
    },
    remove(object) {
      object.detach()
      return object
    },

    // -------------------------------------------------------------------------

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

    // =========================================================================
    // Setup Applet
    // =========================================================================

    setup(loadInitialConfig) {
      const URL = 'https://www.geogebra.org/apps/deployggb.js'
      const scripts = [...document.getElementsByTagName('script')]

      if (scripts.some(({ src }) => src === URL)) return

      const GeogebraScript = document.createElement('script')
      GeogebraScript.setAttribute('src', URL)
      GeogebraScript.onload = () => loadInitialConfig()
      document.head.appendChild(GeogebraScript)
    },

    // -------------------------------------------------------------------------

    initialConfig() {
      if (process && process.server) { return }
      const self = this

      // console.log('Increasing appletsCount -> ' + appletsCount)

      // Retrieve all props (or their default values) from instance
      const {
        src,
        toolbar,
        xml,
        transparent,
        noFullscreen,
        customTools,

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
        enableUndoRedo,
      } = self

      const params = {
        scaleContainerClass: 'ggb-container',
        width: this.displayWidth,
        height: this.displayHeight - 120,
        enableRightClick: false,
        perspective: 'G',
        showMenuBar: false,
        showAlgebraInput: false,
        showToolBarHelp: false,
        showZoomButtons: false,
        showFullscreenButton: !noFullscreen,
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
            const n = Number.parseInt(name)
            if (n) { return name }
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
      if (enableUndoRedo !== undefined) {
        params.enableUndoRedo = enableUndoRedo
      }

      let commands = []
      let images = []
      if (!xml) {
        // If xml prop is set, use this to load previous state
        // – if not, execute any GGB commands passed to the default slot as text content
        const slot = self.$slots.default
        if (slot && slot.length > 0) {
          let imageCount = 0
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
                imageCount++
                const {src, name, anchor, x, y, size, angle, visible} = el.data.attrs
                const zoomable = el.data.attrs['fixed-size'] === undefined
                if (!src) {
                  console.warn('Geogebra: Encountered embedded <img> element without a src attribute.')
                // } else if (!handles
                //   || handles.constructor !== Array
                //   || handles.length !== 2
                //   || handles.some(h => ![String, Object].includes(h.constructor))
                //   || handles.some(h => h.constructor === Object && (
                //     !h.name || h.name.constructor !== String || (h.x !== undefined && h.y === undefined) || (h.y  !== undefined && h.x  === undefined) || (h.x  !== undefined && h.y  !== undefined && [h.x, h.y].some(p => p.constructor !== Number))
                //   ))
                // ) {
                //   console.warn('Geogebra: Encountered embedded <img> element with invalid handles attribute - make sure to pass an array of length 2, where each element is either a String providing the handle name or an object of the form {name, x, y} to additionally define the location.')
                } else {
                  const i = {
                    src,
                    name: name || `EmbeddedImage${imageCount}`,
                    anchor: anchor || 'center',
                    x: x ? Number.parseFloat(x) : 0,
                    y: y ? Number.parseFloat(y) : 0,
                    size: size ? Number.parseFloat(size) : 1,
                    angle: angle ? Number.parseFloat(angle) : 0,
                    visible: visible || true,
                    zoomable,
                    // handles,
                  }
                  console.log(`Creating embedded image`, i, el.data.attrs)
                  images.push(i)
                }
              }
              break
            }
          }
        }
      }

      const additionalTools = customTools.filter(t => t.id > 100000)

      self.settingJSON = true
      params.appletOnLoad = (api) => {
        if (api) {
          if (xml) {
            api.setXML(xml)
          } else if (this.settingJSON) {
            if (images.length > 0 || additionalTools.length > 0) {
              const json = api.getFileJSON()

              const imagesPart = json.archive.find(item => item.fileName === 'geogebra.xml')
              imagesPart.fileContent = imagesPart.fileContent.replace('</construction>', images.map(i => {
                let p = [1, 2].map(c => ({name: i.name + `Corner${c}`}))
                const {name, anchor, size, x, y, visible} = i
                const half = size / 2
                switch (anchor) {
                  case 'bottom-left':
                    p[0].x = x; p[0].y = y
                    p[1].x = x + size; p[1].y = y
                    break
                  case 'center': default:
                    p[0].x = x - half; p[0].y = y - half
                    p[1].x = x + half; p[1].y = y - half
                    break
                }
                return `
<element type="point" label="${p[0].name}">
  <show object="false" label="false"/>
  <objColor r="77" g="77" b="255" alpha="0"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="1" playing="false"/>
  <coords x="${p[0].x}" y="${p[0].y}" z="1"/>
  <pointSize val="5"/>
  <pointStyle val="0"/>
</element>
<element type="point" label="${p[1].name}">
  <show object="false" label="false"/>
  <objColor r="77" g="77" b="255" alpha="0"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="1" playing="false"/>
  <coords x="${p[1].x}" y="${p[1].y}" z="1"/>
  <pointSize val="5"/>
  <pointStyle val="0"/>
</element>
<element type="image" label="${name}">
  <file name="${name}.png"/>
  <inBackground val="false"/>
  <startPoint number="0" exp="${p[0].name}"/>
  ${i.zoomable ? `<startPoint number="1" exp="${p[1].name}"/>` : ''}
  <show object="${visible}" label="false"/>
  <objColor r="0" g="0" b="0" alpha="1"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="0" playing="false"/>
</element>`
}) + '</construction>')

              json.archive.push(...images.map(i => ({
                fileName: `${i.name}.png`,
                fileContent: i.src,
              })))

              let toolsPart = json.archive.find(item => item.fileName === 'geogebra_macro.xml')
              if (!toolsPart) {
                toolsPart = {fileName: 'geogebra_macro.xml'}
                json.archive.push(toolsPart)
              }
              toolsPart.fileContent = `
<?xml version="1.0" encoding="utf-8"?>
<geogebra format="5.0" version="5.0.713.0" app="classic" platform="w"  xsi:noNamespaceSchemaLocation="http://www.geogebra.org/apps/xsd/ggt.xsd" xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >
  ${additionalTools.map(t => `<macro cmdName="${t.name}" toolName="${t.hint || t.name}" toolHelp="${t.name}[  ]" iconFile="custom_tool_${t.name}.png" showInToolBar="true" copyCaptions="true" viewId="1">
    <macroInput/>
    <macroOutput/>
    <construction title="" author="" date="">
    </construction>
  </macro>`).join('\n')}
</geogebra>`
              json.archive.push(...additionalTools.map(t => ({
                fileName: `custom_tool_${t.name}.png`,
                fileContent: t.src,
              })))

              this.settingJSON = false
              api.setFileJSON(json)
              return
            }
          }

          self.api = api
          self.$nextTick(self.resize)

          const imageKeyValues = Object.fromEntries(
            images.map(i => ([i.name, new Image(i.name, i.anchor, i.x, i.y, i.size, i.angle, i.visible, i.zoomable)]))
          )
          Object.values(imageKeyValues).forEach(i => {i.attach(api, true)})

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
            ...imageKeyValues,

            add(...args) { return _self.add(...args) },
            remove(...args) { return _self.remove(...args) },

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

            get tool() {
              const id = _self.api.getMode()
              const tl = _self.tools.find(l => l.id === id)
              return tl ? tl.name : null
            },
            set tool(v) {
              const tl = _self.tools.find(l => l.name.toLowerCase() === v.toLowerCase())
              if (tl) { _self.api.setMode(tl.id) }
              else { console.warn(`Unable to select tool "${v}": this name is unknown`)}
            },

            api,
          })

          self.registerListeners()
          self.$emit('before-load')
          self.$nextTick(() => {
            self.modifyTools()
            self.$emit('load')
          })
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

      console.log('Injecting applet into DIV with id ' + this.id)
      this.$nextTick(() => applet.inject(this.id))
    },

    // =========================================================================
    // Helpers
    // =========================================================================

    resize() {
      const container = this.$el
      container.style.width = this.displayWidth  + 'px'
      container.style.height = this.displayHeight + 'px'
      if (this.api) { this.api.setHeight(this.displayHeight) }
      const ggbFrame = container.getElementsByClassName('GeoGebraFrame')[0]
      if (ggbFrame) { ggbFrame.style.height = (this.displayHeight - 54) + 'px' }
    },

    // -------------------------------------------------------------------------

    modifyTools() {
      const modifiedTools = this.customTools.filter(t => t.id <= 100000)
      for (const t of modifiedTools) {
        console.log(`Modifying tool ${t.id} (${t.name})...`)
        const img = document.querySelector(`.toolbar_button[mode="${t.id}"] > .toolbar_icon`)
        if (img) {
          console.log(`Found toolbar image - replacing by src=${t.src}`)
          img.src = t.src
        }
      }
    },

    // =========================================================================
    // Event Listeners
    // =========================================================================

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

    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------

    clientListener(event) {
      const { api } = this

      const emitSelectDeselectEvents = () => {
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
      }

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
          emitSelectDeselectEvents()
          break // xapi2.evalCommand("SelectObjects[]");
        case 'select':
          this.prevSelectedObjects = new Set([...this.selectedObjects])
          this.selectedObjects.add(event[1])
          emitSelectDeselectEvents()
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

        case 'viewChanged2D': this.onViewChanged(); break
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

        case 'undo': this.$emit('undo'); break
        case 'redo': this.$emit('redo'); break
        case 'deleteGeos': this.$emit('remove', event[1]); break

        default:
          console.warn('unhandled event ' + event[0] + ' ' + event)
      }
    },

    // -------------------------------------------------------------------------

    addListener(objectName) {
      const {value, api} = this
      if (api) {
        if (!this.suspendAddListener) {
          this.updateOutputs()
          const objectType = api.getObjectType(objectName)
          if (!value[objectName]) {
            let object
            switch (objectType) {
              case 'numeric':
                {
                  object = new GeogebraNumber(objectName)
                  object.attach(api, true)
                }
                break
              case 'text':
                {
                  object = new Label(objectName)
                  object.attach(api, true)
                }
                break
              case 'point':
                {
                  object = new Point(objectName)
                  object.attach(api, true)
                }
                break
              case 'line':
                {
                  object = new LinearEquation(objectName)
                  object.attach(api, true)
                }
                break
              case 'inequality':
                {
                  object = new LinearInequality(objectName)
                  object.attach(api, true)
                }
                break
              default:
                console.warn(`An object of unknown type "${objectType}" added to the Geogebra worksheet`)
                object = null
            }
            value[objectName] = object
            this.$emit('input', value)
          } else {
            console.warn(`An object named "${objectName}" (type ${objectType}) was added to the Geogebra worksheet, but a key of this name already exists in the object bound as v-model.`)
          }
        }
        this.$emit('add', objectName)
      }
    },

    // -------------------------------------------------------------------------

    removeListener(objectName) {
      const { value, api } = this
      if (api) {
        const obj = value[objectName]
        if (obj) {
          obj.detach()
          delete value[objectName]
          this.$emit('input', value)
        }
        this.updateOutputs()
        this.$emit('remove', objectName)
      }
    },

    // -------------------------------------------------------------------------

    updateListener(objectName) {
      if (this.api) {
        this.updateOutputs()
        this.$emit('update', objectName)
      }
    },

    // -------------------------------------------------------------------------

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

    onViewChanged() {
      const {api} = this
      const props = JSON.parse(api.getViewProperties())

      let { xMin, yMin } = props
      const { width, height } = props
      let scale = props.invXscale // ignore invYscale for now - it's anyway the same most of the time
      let w = width * scale
      let h = height * scale

      const { allowZoom, allowPan } = this
      const invalidViewRect = xMin < allowPan.x[0] || yMin < allowPan.y[0] || xMin + w > allowPan.x[1] || yMin + h > allowPan.y[1]

      if (!this.previousViewProps) {
        // First time this event is fired

        // Check scale and adjust if necessary
        if (scale < allowZoom[0]) {
          scale = allowZoom[0]
        } else if (scale > allowZoom[1]) {
          scale = allowZoom[1]
        } else if (invalidViewRect) {
          scale = (allowZoom[0] + allowZoom[1]) / 2 // last resort: guess a value that has a chance to work out
        }
        w = width * scale
        h = height * scale

        this.previousViewProps = {
          ...props,
          invXscale: scale,
          invYscale: scale,
        }

        api.setCoordSystem(xMin, xMin + w, yMin, yMin + h)
        return
      }

      const prev = this.previousViewProps
      let adjust = false

      if (scale !== prev.invXscale) {
        if (scale > prev.invXscale) {
          if (invalidViewRect || scale > allowZoom[1]) {
            // prevent zooming out further
            // console.warn('Zooming out too far')
            scale = prev.invXscale
            w = prev.width * scale
            h = prev.height * scale
            adjust = true
          } else {
            this.$emit('zoom', scale)
          }
        } else if (scale < allowZoom[0]) {
          // prevent zooming in further
          // console.warn('Zooming in too far')
          scale = prev.invXscale
          w = prev.width * scale
          h = prev.height * scale
          // if (xMin < allowPan.x[0] || xMin + w > allowPan.x[1]) { xMin = prev.xMin }
          // if (yMin < allowPan.y[0] || yMin + w > allowPan.y[1]) { yMin = prev.yMin }
          adjust = true
        } else {
          this.$emit('zoom', scale)
        }
      }

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
      } else {
        this.previousViewProps = props
      }

      this.$emit('pan', { x: [xMin, xMin + w], y: [yMin, yMin + h] })
    },
  },
  render(createElement) {
    const { id, displayWidth, displayHeight } = this
    return createElement('div', {
      attrs: { id },
      class: 'ggb-container',
      style: {
        width: displayWidth + 'px',
        height: displayHeight + 'px',
      },
    })
  },
}
</script>
