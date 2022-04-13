<script>
/* global GGBApplet */
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
      default: () => ([0, 1]),
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
      default: 0.7,
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
    'select',
    'deselect',
    'click',
    'drop',
    'add',
    'remove',
    'update',
    'undo',
    'redo',
  ],
  data: () => ({
    instanceNumber: 0,
    applet: null,
    api: null,
    previousViewProps: null,
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
  },
  beforeMount() {
    // Retrieve all props (or their default values) from instance
    const {
      displayWidth,
      displayHeight,
      src,
      toolbar,
      xml,

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
    } = this

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
    }

    if (src) { params.filename = src }
    if (toolbar !== null) {
      params.showToolBar = !!toolbar
      if ([Array, String].includes(toolbar.constructor)) {
        const t = toolbar.constructor === Array ? toolbar : toolbar.split(/[,;]|[,;]?\s+|\s+[,;]?/g)
        params.customToolBar = t.map((a) => {
          switch (a) {
            case 'move': return 0 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_move.svg/32px-Mode_move.svg.png
            case 'point': return 1 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_point.svg/32px-Mode_point.svg.png
            case 'join': return 2 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_join.svg/32px-Mode_join.svg.png
            case 'parallel': return 3 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_parallel.svg/32px-Mode_parallel.svg.png
            case 'orthogonal': return 4 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_orthogonal.svg/32px-Mode_orthogonal.svg.png
            case 'intersect': return 5 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_intersect.svg/32px-Mode_intersect.svg.png
            case 'delete': return 6 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_delete.svg/32px-Mode_delete.svg.png
            case 'vector': return 7 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_vector.svg/32px-Mode_vector.svg.png
            case 'line_bisector': return 8 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_linebisector.svg/32px-Mode_linebisector.svg.png
            case 'angular_bisector': return 9 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_angularbisector.svg/32px-Mode_angularbisector.svg.png
            case 'circle_two_points': return 10 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circle2.svg/32px-Mode_circle2.svg.png
            case 'circle_three_points': return 11 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circle3.svg/32px-Mode_circle3.svg.png
            case 'conic_five_points': return 12 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_conic5.svg/32px-Mode_conic5.svg.png
            case 'tangents': return 13 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_tangent.svg/32px-Mode_tangent.svg.png
            case 'relation': return 14 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_relation.svg/32px-Mode_relation.svg.png
            case 'segment': return 15 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_segment.svg/32px-Mode_segment.svg.png
            case 'polygon': return 16 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_polygon.svg/32px-Mode_polygon.svg.png
            case 'text': return 17 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_text.svg/32px-Mode_text.svg.png
            case 'ray': return 18 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_ray.svg/32px-Mode_ray.svg.png
            case 'midpoint': return 19 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_midpoint.svg/32px-Mode_midpoint.svg.png
            case 'circle_arc_three_points': return 20 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlearc3.svg/32px-Mode_circlearc3.svg.png
            case 'circle_sector_three_points': return 21 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlesector3.svg/32px-Mode_circlesector3.svg.png
            case 'circumcircle_arc_three_points': return 22 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circumcirclearc3.svg/32px-Mode_circumcirclearc3.svg.png
            case 'circumcircle_sector_three_points': return 23 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circumcirclesector3.svg/32px-Mode_circumcirclesector3.svg.png
            case 'semicircle': return 24 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_semicircle.svg/32px-Mode_semicircle.svg.png
            case 'slider': return 25 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_slider.svg/32px-Mode_slider.svg.png
            case 'image': return 26 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_image.svg/32px-Mode_image.svg.png
            case 'show_hide_object': return 27 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_showhideobject.svg/32px-Mode_showhideobject.svg.png
            case 'show_hide_label': return 28 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_showhidelabel.svg/32px-Mode_showhidelabel.svg.png
            case 'mirror_at_point': return 29 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mirroratpoint.svg/32px-Mode_mirroratpoint.svg.png
            case 'mirror_at_line': return 30 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mirroratline.svg/32px-Mode_mirroratline.svg.png
            case 'translate_by_vector': return 31 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_translatebyvector.svg/32px-Mode_translatebyvector.svg.png
            case 'rotate_by_angle': return 32 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rotatebyangle.svg/32px-Mode_rotatebyangle.svg.png
            case 'dilate_from_point': return 33 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_dilatefrompoint.svg/32px-Mode_dilatefrompoint.svg.png
            case 'circle_point_radius': return 34 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlepointradius.svg/32px-Mode_circlepointradius.svg.png
            case 'copy_visual_style': return 35 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_copyvisualstyle.svg/32px-Mode_copyvisualstyle.svg.png
            case 'angle': return 36 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_angle.svg/32px-Mode_angle.svg.png
            case 'vector_from_point': return 37 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_vectorfrompoint.svg/32px-Mode_vectorfrompoint.svg.png
            case 'distance': return 38 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_distance.svg/32px-Mode_distance.svg.png
            case 'move_rotate': return 39 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_moverotate.svg/32px-Mode_moverotate.svg.png
            case 'translateview': return 40 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_translateview.svg/32px-Mode_translateview.svg.png
            case 'zoom_in': return 41 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_zoomin.svg/32px-Mode_zoomin.svg.png
            case 'zoom_out': return 42 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_zoomout.svg/32px-Mode_zoomout.svg.png
            case 'selection_listener': return 43 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png
            case 'polar_diameter': return 44 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_polardiameter.svg/32px-Mode_polardiameter.svg.png
            case 'segment_fixed': return 45 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_segmentfixed.svg/32px-Mode_segmentfixed.svg.png
            case 'angle_fixed': return 46 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_anglefixed.svg/32px-Mode_anglefixed.svg.png
            case 'locus': return 47 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_locus.svg/32px-Mode_locus.svg.png
            case 'macro': return 48 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_tool.svg/32px-Mode_tool.svg.png
            case 'area': return 49 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_area.svg/32px-Mode_area.svg.png
            case 'slope': return 50 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_slope.svg/32px-Mode_slope.svg.png
            case 'regular_polygon': return 51 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_regularpolygon.svg/32px-Mode_regularpolygon.svg.png
            case 'show_hide_checkbox': return 52 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_showcheckbox.svg/32px-Mode_showcheckbox.svg.png
            case 'compasses': return 53 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_compasses.svg/32px-Mode_compasses.svg.png
            case 'mirror_at_circle': return 54 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mirroratcircle.svg/32px-Mode_mirroratcircle.svg.png
            case 'ellipse_three_points': return 55 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_ellipse3.svg/32px-Mode_ellipse3.svg.png
            case 'hyperbola_three_points': return 56 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_hyperbola3.svg/32px-Mode_hyperbola3.svg.png
            case 'parabola': return 57 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_parabola.svg/32px-Mode_parabola.svg.png
            case 'fitline': return 58 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_fitline.svg/32px-Mode_fitline.svg.png
            case 'record_to_spreadsheet': return 59 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_recordtospreadsheet.svg/32px-Mode_recordtospreadsheet.svg.png
            case 'button_action': return 60 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_buttonaction.svg/32px-Mode_buttonaction.svg.png
            case 'textfield_action': return 61 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_textfieldaction.svg/32px-Mode_textfieldaction.svg.png
            case 'pen': return 62 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_pen.svg/32px-Mode_pen.svg.png
            case 'rigid Polygon': return 64 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rigidpolygon.svg/32px-Mode_rigidpolygon.svg.png
            case 'polyline': return 65 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_polyline.svg/32px-Mode_polyline.svg.png
            case 'probability Calculator': return 66 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_probabilitycalculator.svg/32px-Mode_probabilitycalculator.svg.png
            case 'attach / Detach': return 67 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_attachdetachpoint.svg/32px-Mode_attachdetachpoint.svg.png
            case 'function Inspector': return 68 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_functioninspector.svg/32px-Mode_functioninspector.svg.png
            case 'intersect Two Surfaces': return 69
            case 'vector Polygon': return 70 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_vectorpolygon.svg/32px-Mode_vectorpolygon.svg.png
            case 'create List': return 71 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createlist.svg/32px-Mode_createlist.svg.png
            case 'complex Number': return 72 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_complexnumber.svg/32px-Mode_complexnumber.svg.png
            case 'point on object': return 501 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_pointonobject.svg/32px-Mode_pointonobject.svg.png
            case 'mode_spreadsheet_create_list': return 2001 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createlist.svg/32px-Mode_createlist.svg.png
            case 'mode_spreadsheet_create_matrix': return 2002 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_creatematrix.svg/32px-Mode_creatematrix.svg.png
            case 'mode_spreadsheet_create_listofpoints': return 2003 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createlistofpoints.svg/32px-Mode_createlistofpoints.svg.png
            case 'mode_spreadsheet_create_tabletext': return 2004 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createtable.svg/32px-Mode_createtable.svg.png
            case 'mode_spreadsheet_create_polyline': return 2005 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createpolyline.svg/32px-Mode_createpolyline.svg.png
            case 'mode_spreadsheet_onevarstats': return 2020 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_onevarstats.svg/32px-Mode_onevarstats.svg.png
            case 'mode_spreadsheet_twovarstats': return 2021 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_twovarstats.svg/32px-Mode_twovarstats.svg.png
            case 'mode_spreadsheet_multivarstats': return 2022 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_multivarstats.svg/32px-Mode_multivarstats.svg.png
            case 'mode_spreadsheet_sort': return 2030 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png
            case 'mode_spreadsheet_sort_az': return 2031 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png
            case 'mode_spreadsheet_sort_za': return 2032 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png
            case 'mode_spreadsheet_sum': return 2040 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_sumcells.svg/32px-Mode_sumcells.svg.png
            case 'mode_spreadsheet_average': return 2041 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_meancells.svg/32px-Mode_meancells.svg.png
            case 'mode_spreadsheet_count': return 2042 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_countcells.svg/32px-Mode_countcells.svg.png
            case 'mode_spreadsheet_min': return 2043 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mincells.svg/32px-Mode_mincells.svg.png
            case 'mode_spreadsheet_max': return 2044 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_maxcells.svg/32px-Mode_maxcells.svg.png
            case 'freehand Mode': return 73 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_freehandshape.svg/32px-Mode_freehandshape.svg.png
            case 'view_in_front_of': return 502 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_viewinfrontof.svg/32px-Mode_viewinfrontof.svg.png
            case 'plane_three_points': return 510 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_planethreepoint.svg/32px-Mode_planethreepoint.svg.png
            case 'plane_point_line': return 511 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_plane.svg/32px-Mode_plane.svg.png
            case 'orthogonal_plane': return 512 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_orthogonalplane.svg/32px-Mode_orthogonalplane.svg.png
            case 'parallel_plane': return 513 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_parallelplane.svg/32px-Mode_parallelplane.svg.png
            case 'perpendicular line (3D)': return 514 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_orthogonalthreed.svg/32px-Mode_orthogonalthreed.svg.png
            case 'sphere_point_radius': return 520 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_spherepointradius.svg/32px-Mode_spherepointradius.svg.png
            case 'sphere_two_points': return 521 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_sphere2.svg/32px-Mode_sphere2.svg.png
            case 'cone given by two points and radius': return 522 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_cone.svg/32px-Mode_cone.svg.png
            case 'cylinder given by two points and radius': return 523 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_cylinder.svg/32px-Mode_cylinder.svg.png
            case 'prism': return 531 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_prism.svg/32px-Mode_prism.svg.png
            case 'extrude to Prism or Cylinder': return 532 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_extrusion.svg/32px-Mode_extrusion.svg.png
            case 'pyramid': return 533 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_pyramid.svg/32px-Mode_pyramid.svg.png
            case 'extrude to Pyramid or Cone': return 534 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_conify.svg/32px-Mode_conify.svg.png
            case 'net': return 535 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_net.svg/32px-Mode_net.svg.png
            case 'cube': return 536 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_cube.svg/32px-Mode_cube.svg.png
            case 'tetrahedron': return 537 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_tetrahedron.svg/32px-Mode_tetrahedron.svg.png
            case 'rotate View': return 540 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rotateview.svg/32px-Mode_rotateview.svg.png
            case 'circle Point Radius Direction': return 550 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlepointradiusdirection.svg/32px-Mode_circlepointradiusdirection.svg.png
            case 'circle Axis Point': return 551 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circleaxispoint.svg/32px-Mode_circleaxispoint.svg.png
            case 'volume': return 560 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_volume.svg/32px-Mode_volume.svg.png
            case 'rotate around Line': return 570 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rotatearoundline.svg/32px-Mode_rotatearoundline.svg.png
            case 'mirror at Plane': return 571 // https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png
            default: return null
          }
        })
          .filter(a => a !== null)
          .join('|')
      } else {
        params.customToolBar = ''
      }
    }

    // Include them in the params object used to create GGBApplet
    if (capturingThreshold) { params.capturingThreshold = capturingThreshold }
    if (scale) { params.scale = scale }
    if (buttonRounding) { params.buttonRounding = buttonRounding }
    if (ggbBase64) { params.ggbBase64 = ggbBase64 }
    if (appName) { params.appName = appName }
    if (language) { params.language = language }
    if (showResetIcon) { params.showResetIcon = showResetIcon }
    if (enableLabelDrags) { params.enableLabelDrags = enableLabelDrags }
    if (errorDialogsActive) { params.errorDialogsActive = errorDialogsActive }
    if (useBrowserForJS) { params.useBrowserForJS = useBrowserForJS }
    if (allowStyleBar) { params.allowStyleBar = allowStyleBar }
    if (preventFocus) { params.preventFocus = preventFocus }
    if (disableAutoScale) { params.disableAutoScale = disableAutoScale }
    if (allowUpscale) { params.allowUpscale = allowUpscale }
    if (buttonShadows) { params.buttonShadows = buttonShadows }

    let commands = []
    if (!xml) {
      // If xml prop is set, use this to load previous state
      // – if not, execute any GGB commands passed to the default slot as text content
      const slot = this.$slots.default
      if (slot && slot.length > 0) {
        const pre = slot[0]
        if (pre && pre.tag === 'pre') {
          const text = pre.children[0].text
          if (text) {
            commands = text.split('\n')
          }
        }
      }
    }

    params.appletOnLoad = (api) => {
      if (api) {
        this.api = api

        const { value } = this
        if (xml) {
          api.setXML(xml)
        } else {
          commands.forEach((cmd) => {
            if (cmd.trim() !== '') {
              api.evalCommand(cmd)
            }
          })
        }

        if (this.viewRect) { this.setViewRect(this.viewRect) }

        // Make API object accessible from v-model bound variable
        const self = this
        this.$emit('input', {
          ...value,
          get viewRect() { return self.getViewRect() },
          set viewRect(v) { self.setViewRect(v) },
          get xml() { return self.api.getXML() },
          set xml(v) { self.api.setXML(v) },
          api,
        })
        this.registerListeners()
        this.$emit('load')
      }
    }
    // Create GGB applet
    const applet = new GGBApplet(params, '5.0')

    applet.setPreviewImage(
      'data:image/gif;base64,R0lGODlhAQABAAAAADs=',
      'https://www.geogebra.org/images/GeoGebra_loading.png',
      'https://www.geogebra.org/images/applet_play.png'
    )
    this.applet = applet
  },
  created() {
    appletsCount += 1
    console.log('Increasing appletsCount -> ' + appletsCount)
    this.instanceNumber = appletsCount
  },
  mounted() {
    this.init()

    const { applet, id } = this
    console.log('Injecting applet into DIV with id ' + id)
    this.$nextTick(() => { applet.inject(id) })
  },

  beforeUnmount() {
    this.unregisterListeners()
  },

  methods: {
    init() {
      const GeogebraScript = document.createElement('script')
      GeogebraScript.setAttribute('src', 'https://www.geogebra.org/apps/deployggb.js')
      document.head.appendChild(GeogebraScript)
    },

    registerListeners() {
      const { id, api } = this
      window[id + 'AddListener'] = (name) => { this.addListener(name) }
      window[id + 'RemoveListener'] = (name) => { this.removeListener(name) }
      window[id + 'UpdateListener'] = (name) => { this.updateListener(name) }
      window[id + 'ClientListener'] = (event) => { this.clientListener(event) }

      api.registerAddListener(id + 'AddListener')
      api.registerRemoveListener(id + 'RemoveListener')
      api.registerUpdateListener(id + 'UpdateListener')
      api.registerClientListener(id + 'ClientListener')
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
          this.$emit('change-mode', event[2])
          break

        case 'deselect': this.$emit('deselect'); break // xapi2.evalCommand("SelectObjects[]");
        case 'select': this.$emit('select', event[1]); break // xapi2.evalCommand("SelectObjects[" + event[1] + "]");
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
              if (scale < allowZoom[0]) { scale = allowZoom[0] } else if (scale > allowZoom[1]) { scale = allowZoom[1] }
              this.previousViewProps = { ...props, invXscale: scale, invYscale: scale }
              api.setCoordSystem(xMin, xMin + width * scale, yMin, yMin + height * scale)
              return
            }

            // assuming xScale / yScale is fixed, it is
            // enough to check xScale only
            const scale = props.invXscale
            if (scale < allowZoom[0] || scale > allowZoom[1]) {
              const { width, height, invXscale } = this.previousViewProps
              let { xMin, yMin } = this.previousViewProps
              const w = width * invXscale, h = height * invXscale
              if (props.xMin >= allowPan.x[0] && props.xMin + w <= allowPan.x[1]) { xMin = props.xMin }
              if (props.yMin >= allowPan.y[0] && props.yMin + h <= allowPan.y[1]) { yMin = props.yMin }
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
            console.log('Emit drop, $event=', { object, ...coords })
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
          console.error('unhandled event ' + event[0] + ' ' + event)
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
      const { api, value: { outputs } } = this
      if (!outputs) { return }
      const objects = api.getAllObjectNames()
      objects.forEach((name) => {
        if (Object.hasOwn(outputs, name)) {
          const v = api.getValue(name)
          outputs[name] = v
        }
      })
    },

    getViewRect() {
      const { xMin, yMin, width, height, invXscale } = JSON.parse(this.api.getViewProperties())
      return {
        x: [xMin, xMin + width * invXscale],
        y: [yMin, yMin + height * invXscale],
      }
    },
    setViewRect({ x, y, contain }) {
      if (!x || !x) { return } ;

      const w = x[1] - x[0], h = y[1] - y[0]
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
