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
  ],
  data: () => ({
    instanceNumber: 0,
    applet: null,
    api: null,
    previousViewProps: null,
    settingJSON: true,
    tools: [
      {name: 'move', id: 0, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_move.svg/32px-Mode_move.svg.png'},
      {name: 'point', id: 1, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_point.svg/32px-Mode_point.svg.png'},
      {name: 'join', id: 2, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_join.svg/32px-Mode_join.svg.png'},
      {name: 'parallel', id: 3, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_parallel.svg/32px-Mode_parallel.svg.png'},
      {name: 'orthogonal', id: 4, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_orthogonal.svg/32px-Mode_orthogonal.svg.png'},
      {name: 'intersect', id: 5, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_intersect.svg/32px-Mode_intersect.svg.png'},
      {name: 'delete', id: 6, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_delete.svg/32px-Mode_delete.svg.png'},
      {name: 'vector', id: 7, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_vector.svg/32px-Mode_vector.svg.png'},
      {name: 'line_bisector', id: 8, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_linebisector.svg/32px-Mode_linebisector.svg.png'},
      {name: 'angular_bisector', id: 9, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_angularbisector.svg/32px-Mode_angularbisector.svg.png'},
      {name: 'circle_two_points', id: 10, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circle2.svg/32px-Mode_circle2.svg.png'},
      {name: 'circle_three_points', id: 11, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circle3.svg/32px-Mode_circle3.svg.png'},
      {name: 'conic_five_points', id: 12, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_conic5.svg/32px-Mode_conic5.svg.png'},
      {name: 'tangents', id: 13, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_tangent.svg/32px-Mode_tangent.svg.png'},
      {name: 'relation', id: 14, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_relation.svg/32px-Mode_relation.svg.png'},
      {name: 'segment', id: 15, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_segment.svg/32px-Mode_segment.svg.png'},
      {name: 'polygon', id: 16, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_polygon.svg/32px-Mode_polygon.svg.png'},
      {name: 'text', id: 17, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_text.svg/32px-Mode_text.svg.png'},
      {name: 'ray', id: 18, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_ray.svg/32px-Mode_ray.svg.png'},
      {name: 'midpoint', id: 19, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_midpoint.svg/32px-Mode_midpoint.svg.png'},
      {name: 'circle_arc_three_points', id: 20, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlearc3.svg/32px-Mode_circlearc3.svg.png'},
      {name: 'circle_sector_three_points', id: 21, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlesector3.svg/32px-Mode_circlesector3.svg.png'},
      {name: 'circumcircle_arc_three_points', id: 22, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circumcirclearc3.svg/32px-Mode_circumcirclearc3.svg.png'},
      {name: 'circumcircle_sector_three_points', id: 23, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circumcirclesector3.svg/32px-Mode_circumcirclesector3.svg.png'},
      {name: 'semicircle', id: 24, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_semicircle.svg/32px-Mode_semicircle.svg.png'},
      {name: 'slider', id: 25, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_slider.svg/32px-Mode_slider.svg.png'},
      {name: 'image', id: 26, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_image.svg/32px-Mode_image.svg.png'},
      {name: 'show_hide_object', id: 27, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_showhideobject.svg/32px-Mode_showhideobject.svg.png'},
      {name: 'show_hide_label', id: 28, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_showhidelabel.svg/32px-Mode_showhidelabel.svg.png'},
      {name: 'mirror_at_point', id: 29, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mirroratpoint.svg/32px-Mode_mirroratpoint.svg.png'},
      {name: 'mirror_at_line', id: 30, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mirroratline.svg/32px-Mode_mirroratline.svg.png'},
      {name: 'translate_by_vector', id: 31, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_translatebyvector.svg/32px-Mode_translatebyvector.svg.png'},
      {name: 'rotate_by_angle', id: 32, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rotatebyangle.svg/32px-Mode_rotatebyangle.svg.png'},
      {name: 'dilate_from_point', id: 33, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_dilatefrompoint.svg/32px-Mode_dilatefrompoint.svg.png'},
      {name: 'circle_point_radius', id: 34, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlepointradius.svg/32px-Mode_circlepointradius.svg.png'},
      {name: 'copy_visual_style', id: 35, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_copyvisualstyle.svg/32px-Mode_copyvisualstyle.svg.png'},
      {name: 'angle', id: 36, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_angle.svg/32px-Mode_angle.svg.png'},
      {name: 'vector_from_point', id: 37, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_vectorfrompoint.svg/32px-Mode_vectorfrompoint.svg.png'},
      {name: 'distance', id: 38, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_distance.svg/32px-Mode_distance.svg.png'},
      {name: 'move_rotate', id: 39, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_moverotate.svg/32px-Mode_moverotate.svg.png'},
      {name: 'translateview', id: 40, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_translateview.svg/32px-Mode_translateview.svg.png'},
      {name: 'zoom_in', id: 41, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_zoomin.svg/32px-Mode_zoomin.svg.png'},
      {name: 'zoom_out', id: 42, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_zoomout.svg/32px-Mode_zoomout.svg.png'},
      {name: 'selection_listener', id: 43, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png'},
      {name: 'polar_diameter', id: 44, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_polardiameter.svg/32px-Mode_polardiameter.svg.png'},
      {name: 'segment_fixed', id: 45, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_segmentfixed.svg/32px-Mode_segmentfixed.svg.png'},
      {name: 'angle_fixed', id: 46, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_anglefixed.svg/32px-Mode_anglefixed.svg.png'},
      {name: 'locus', id: 47, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_locus.svg/32px-Mode_locus.svg.png'},
      {name: 'macro', id: 48, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_tool.svg/32px-Mode_tool.svg.png'},
      {name: 'area', id: 49, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_area.svg/32px-Mode_area.svg.png'},
      {name: 'slope', id: 50, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_slope.svg/32px-Mode_slope.svg.png'},
      {name: 'regular_polygon', id: 51, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_regularpolygon.svg/32px-Mode_regularpolygon.svg.png'},
      {name: 'show_hide_checkbox', id: 52, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_showcheckbox.svg/32px-Mode_showcheckbox.svg.png'},
      {name: 'compasses', id: 53, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_compasses.svg/32px-Mode_compasses.svg.png'},
      {name: 'mirror_at_circle', id: 54, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mirroratcircle.svg/32px-Mode_mirroratcircle.svg.png'},
      {name: 'ellipse_three_points', id: 55, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_ellipse3.svg/32px-Mode_ellipse3.svg.png'},
      {name: 'hyperbola_three_points', id: 56, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_hyperbola3.svg/32px-Mode_hyperbola3.svg.png'},
      {name: 'parabola', id: 57, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_parabola.svg/32px-Mode_parabola.svg.png'},
      {name: 'fitline', id: 58, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_fitline.svg/32px-Mode_fitline.svg.png'},
      {name: 'record_to_spreadsheet', id: 59, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_recordtospreadsheet.svg/32px-Mode_recordtospreadsheet.svg.png'},
      {name: 'button_action', id: 60, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_buttonaction.svg/32px-Mode_buttonaction.svg.png'},
      {name: 'textfield_action', id: 61, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_textfieldaction.svg/32px-Mode_textfieldaction.svg.png'},
      {name: 'pen', id: 62, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_pen.svg/32px-Mode_pen.svg.png'},
      {name: 'rigid Polygon', id: 64, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rigidpolygon.svg/32px-Mode_rigidpolygon.svg.png'},
      {name: 'polyline', id: 65, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_polyline.svg/32px-Mode_polyline.svg.png'},
      {name: 'probability Calculator', id: 66, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_probabilitycalculator.svg/32px-Mode_probabilitycalculator.svg.png'},
      {name: 'attach / Detach', id: 67, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_attachdetachpoint.svg/32px-Mode_attachdetachpoint.svg.png'},
      {name: 'function Inspector', id: 68, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_functioninspector.svg/32px-Mode_functioninspector.svg.png'},
      {name: 'intersect Two Surfaces', id: 69},
      {name: 'vector Polygon', id: 70, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_vectorpolygon.svg/32px-Mode_vectorpolygon.svg.png'},
      {name: 'create List', id: 71, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createlist.svg/32px-Mode_createlist.svg.png'},
      {name: 'complex Number', id: 72, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_complexnumber.svg/32px-Mode_complexnumber.svg.png'},
      {name: 'point on object', id: 501, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_pointonobject.svg/32px-Mode_pointonobject.svg.png'},
      {name: 'mode_spreadsheet_create_list', id: 2001, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createlist.svg/32px-Mode_createlist.svg.png'},
      {name: 'mode_spreadsheet_create_matrix', id: 2002, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_creatematrix.svg/32px-Mode_creatematrix.svg.png'},
      {name: 'mode_spreadsheet_create_listofpoints', id: 2003, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createlistofpoints.svg/32px-Mode_createlistofpoints.svg.png'},
      {name: 'mode_spreadsheet_create_tabletext', id: 2004, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createtable.svg/32px-Mode_createtable.svg.png'},
      {name: 'mode_spreadsheet_create_polyline', id: 2005, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_createpolyline.svg/32px-Mode_createpolyline.svg.png'},
      {name: 'mode_spreadsheet_onevarstats', id: 2020, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_onevarstats.svg/32px-Mode_onevarstats.svg.png'},
      {name: 'mode_spreadsheet_twovarstats', id: 2021, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_twovarstats.svg/32px-Mode_twovarstats.svg.png'},
      {name: 'mode_spreadsheet_multivarstats', id: 2022, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_multivarstats.svg/32px-Mode_multivarstats.svg.png'},
      {name: 'mode_spreadsheet_sort', id: 2030, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png'},
      {name: 'mode_spreadsheet_sort_az', id: 2031, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png'},
      {name: 'mode_spreadsheet_sort_za', id: 2032, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png'},
      {name: 'mode_spreadsheet_sum', id: 2040, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_sumcells.svg/32px-Mode_sumcells.svg.png'},
      {name: 'mode_spreadsheet_average', id: 2041, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_meancells.svg/32px-Mode_meancells.svg.png'},
      {name: 'mode_spreadsheet_count', id: 2042, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_countcells.svg/32px-Mode_countcells.svg.png'},
      {name: 'mode_spreadsheet_min', id: 2043, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_mincells.svg/32px-Mode_mincells.svg.png'},
      {name: 'mode_spreadsheet_max', id: 2044, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_maxcells.svg/32px-Mode_maxcells.svg.png'},
      {name: 'freehand Mode', id: 73, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_freehandshape.svg/32px-Mode_freehandshape.svg.png'},
      {name: 'view_in_front_of', id: 502, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_viewinfrontof.svg/32px-Mode_viewinfrontof.svg.png'},
      {name: 'plane_three_points', id: 510, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_planethreepoint.svg/32px-Mode_planethreepoint.svg.png'},
      {name: 'plane_point_line', id: 511, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_plane.svg/32px-Mode_plane.svg.png'},
      {name: 'orthogonal_plane', id: 512, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_orthogonalplane.svg/32px-Mode_orthogonalplane.svg.png'},
      {name: 'parallel_plane', id: 513, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_parallelplane.svg/32px-Mode_parallelplane.svg.png'},
      {name: 'perpendicular line (3D)', id: 514, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_orthogonalthreed.svg/32px-Mode_orthogonalthreed.svg.png'},
      {name: 'sphere_point_radius', id: 520, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_spherepointradius.svg/32px-Mode_spherepointradius.svg.png'},
      {name: 'sphere_two_points', id: 521, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_sphere2.svg/32px-Mode_sphere2.svg.png'},
      {name: 'cone given by two points and radius', id: 522, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_cone.svg/32px-Mode_cone.svg.png'},
      {name: 'cylinder given by two points and radius', id: 523, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_cylinder.svg/32px-Mode_cylinder.svg.png'},
      {name: 'prism', id: 531, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_prism.svg/32px-Mode_prism.svg.png'},
      {name: 'extrude to Prism or Cylinder', id: 532, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_extrusion.svg/32px-Mode_extrusion.svg.png'},
      {name: 'pyramid', id: 533, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_pyramid.svg/32px-Mode_pyramid.svg.png'},
      {name: 'extrude to Pyramid or Cone', id: 534, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_conify.svg/32px-Mode_conify.svg.png'},
      {name: 'net', id: 535, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_net.svg/32px-Mode_net.svg.png'},
      {name: 'cube', id: 536, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_cube.svg/32px-Mode_cube.svg.png'},
      {name: 'tetrahedron', id: 537, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_tetrahedron.svg/32px-Mode_tetrahedron.svg.png'},
      {name: 'rotate View', id: 540, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rotateview.svg/32px-Mode_rotateview.svg.png'},
      {name: 'circle Point Radius Direction', id: 550, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circlepointradiusdirection.svg/32px-Mode_circlepointradiusdirection.svg.png'},
      {name: 'circle Axis Point', id: 551, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_circleaxispoint.svg/32px-Mode_circleaxispoint.svg.png'},
      {name: 'volume', id: 560, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_volume.svg/32px-Mode_volume.svg.png'},
      {name: 'rotate around Line', id: 570, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_rotatearoundline.svg/32px-Mode_rotatearoundline.svg.png'},
      {name: 'mirror at Plane', id: 571, img: 'https://wiki.geogebra.org/uploads/thumb/8/83/Mode_/32px-Mode_.png'},
    ],
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
      console.log('Increasing appletsCount -> ' + appletsCount)
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
              const json = JSON.parse(JSON.stringify(api.getFileJSON()))
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
  <file name="embedded-image${n+1}"/>
  <inBackground val="false"/>
  <startPoint number="0" exp="${p1.name}"/>
  <startPoint number="1" exp="${p2.name}"/>
  <show object="true" label="true"/>
  <objColor r="0" g="0" b="0" alpha="1"/>
  <layer val="0"/>
  <labelMode val="0"/>
  <animation step="0.1" speed="1" type="0" playing="false"/>
</element>
`
}) + '</construction>')
              json.archive.push(...images.map((i, n) => ({
                fileName: `embedded-image${n+1}`,
                fileContent: i.src,
              })))
              console.log('Embedding images', images, json, xmlPart)
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

          self.registerListeners()
          self.$emit('load')
        }
      }
      // Create GGB applet
      const applet = new GGBApplet(params, '5.0')

      applet.setPreviewImage(
        'data:image/gif;base64,R0lGODlhAQABAAAAADs=',
        'https://www.geogebra.org/images/GeoGebra_loading.png',
        'https://www.geogebra.org/images/applet_play.png'
      )
      self.applet = applet

      const { id } = self
      console.log('Injecting applet into DIV with id ' + id)
      self.$nextTick(() => applet.inject(id))
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
          this.$emit('deselect')
          break // xapi2.evalCommand("SelectObjects[]");
        case 'select':
          this.$emit('select', event[1])
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
