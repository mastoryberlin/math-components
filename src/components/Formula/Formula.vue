<template lang="html">
  <math-field ref="mf" class="formula" v-on="listeners">
    <slot />
  </math-field>
</template>

<script>
const VIRTUAL_KEYBOARD_LAYERS = {
  // This is an example taken from the MathLive docs on custom keyboards at
  // https://cortexjs.io/mathlive/guides/virtual-keyboards/
  'high-school-layer': {
    styles: '',
    rows: [
      [
        { latex: 'a' },
        { latex: 'x' },
        { class: 'separator w5' },
        { label: '7', key: '7' },
        // Will display the label using the system font. To display
        // with the TeX font, use:
        // { class: "tex", label: "7", key: "7" },
        // or
        // { latex: "7"},
        { label: '8', key: '8' },
        { label: '9', key: '9' },
        { latex: '\\div' },
        { class: 'separator w5' },
        {
          class: 'tex small',
          label: '<span><i>x</i>&thinsp;²</span>',
          insert: '$$#@^{2}$$',
        },
        {
          class: 'tex small',
          label: '<span><i>x</i><sup>&thinsp;<i>n</i></sup></span>',
          insert: '$$#@^{}$$',
        },
        {
          class: 'small',
          latex: '\\sqrt{#0}',
          insert: '$$\\sqrt{#0}$$',
        },
      ],
      [
        { class: 'tex', latex: 'b' },
        { class: 'tex', latex: 'y' },
        { class: 'separator w5' },
        { label: '4', latex: '4' },
        { label: '5', key: '5' },
        { label: '6', key: '6' },
        { latex: '\\times' },
        { class: 'separator w5' },
        { class: 'small', latex: '\\frac{#0}{#0}' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { class: 'tex', label: '<i>c</i>' },
        { class: 'tex', label: '<i>z</i>' },
        { class: 'separator w5' },
        { label: '1', key: '1' },
        { label: '2', key: '2' },
        { label: '3', key: '3' },
        { latex: '-' },
        { class: 'separator w5' },
        { class: 'separator' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { latex: '(' },
        { latex: ')' },

        { class: 'separator w5' },
        { label: '0', key: '0' },
        { latex: '.' },
        { latex: '\\pi' },
        { latex: '+' },
        { class: 'separator w5' },
        {
          class: 'action',
          label: "<svg><use xlink:href='#svg-arrow-left' /></svg>",
          command: ['performWithFeedback', 'moveToPreviousChar'],
        },
        {
          class: 'action',
          label: "<svg><use xlink:href='#svg-arrow-right' /></svg>",
          command: ['performWithFeedback', 'moveToNextChar'],
        },
        {
          class: 'action font-glyph bottom right',
          label: '&#x232b;',
          command: ['performWithFeedback', 'deleteBackward'],
        },
      ],
    ],
  },
  'numbers-layer': {
    styles: '',
    rows: [
      [
        { label: '7', key: '7' },
        // Will display the label using the system font. To display
        // with the TeX font, use:
        // { class: "tex", label: "7", key: "7" },
        // or
        // { latex: "7"},
        { label: '8', key: '8' },
        { label: '9', key: '9' },
        { class: 'separator w5' },
        { class: 'separator' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { label: '4', latex: '4' },
        { label: '5', key: '5' },
        { label: '6', key: '6' },
        { class: 'separator w5' },
        { class: 'separator' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { label: '1', key: '1' },
        { label: '2', key: '2' },
        { label: '3', key: '3' },
        { class: 'separator w5' },
        { class: 'separator' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { label: '0', key: '0' },
        { latex: '.' },
        { latex: '-' },
        { class: 'separator w5' },
        {
          class: 'action',
          label: "<svg><use xlink:href='#svg-arrow-left' /></svg>",
          command: ['performWithFeedback', 'moveToPreviousChar'],
        },
        {
          class: 'action',
          label: "<svg><use xlink:href='#svg-arrow-right' /></svg>",
          command: ['performWithFeedback', 'moveToNextChar'],
        },
        {
          class: 'action font-glyph bottom right',
          label: '&#x232b;',
          command: ['performWithFeedback', 'deleteBackward'],
        },
      ],
    ],
  },
  'coords-layer': {
    styles: '',
    rows: [
      [
        { label: '7', key: '7' },
        // Will display the label using the system font. To display
        // with the TeX font, use:
        // { class: "tex", label: "7", key: "7" },
        // or
        // { latex: "7"},
        { label: '8', key: '8' },
        { label: '9', key: '9' },
        { class: 'separator w5' },
        { class: 'separator' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { label: '4', latex: '4' },
        { label: '5', key: '5' },
        { label: '6', key: '6' },
        { class: 'separator w5' },
        { latex: '(' },
        { latex: ')' },
        { latex: ';' },
      ],
      [
        { label: '1', key: '1' },
        { label: '2', key: '2' },
        { label: '3', key: '3' },
        { class: 'separator w5' },
        { class: 'separator' },
        { class: 'separator' },
        { class: 'separator' },
      ],
      [
        { label: '0', key: '0' },
        { latex: '.' },
        { latex: '-' },
        { class: 'separator w5' },
        {
          class: 'action',
          label: "<svg><use xlink:href='#svg-arrow-left' /></svg>",
          command: ['performWithFeedback', 'moveToPreviousChar'],
        },
        {
          class: 'action',
          label: "<svg><use xlink:href='#svg-arrow-right' /></svg>",
          command: ['performWithFeedback', 'moveToNextChar'],
        },
        {
          class: 'action font-glyph bottom right',
          label: '&#x232b;',
          command: ['performWithFeedback', 'deleteBackward'],
        },
      ],
    ],
  },
}
const VIRTUAL_KEYBOARDS = {
  'high-school': {
    label: 'High School', // Label displayed in the Virtual Keyboard Switcher
    tooltip: 'High School Level', // Tooltip when hovering over the label
    layer: 'high-school-layer',
  },
  'numbers': {
    label: 'Number Input', // Label displayed in the Virtual Keyboard Switcher
    tooltip: 'Number Input', // Tooltip when hovering over the label
    layer: 'numbers-layer',
  },
  'coords': {
    label: 'Coordinate Input', // Label displayed in the Virtual Keyboard Switcher
    tooltip: 'Coordinate Input', // Tooltip when hovering over the label
    layer: 'coords-layer',
  },
}

export default {
  props: {
    keyboard: {
      type: String,
      default: null,
    },
  },
  emits: ['input'],
  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: this.onInput,
      }
    },
  },
  mounted() {
    const { mf } = this.$refs
    const options = {
      virtualKeyboardMode: 'onfocus',
      customVirtualKeyboardLayers: VIRTUAL_KEYBOARD_LAYERS,
      customVirtualKeyboards: VIRTUAL_KEYBOARDS,
    }
    if (this.keyboard) {
      options.virtualKeyboards = this.keyboard
    }
    mf.setOptions(options)
  },
  methods: {
    onInput(ev) {
      // console.log(ev.target)
      if (ev.target) {
        try {
          this.$emit('input', JSON.parse(ev.target.getValue('math-json')))
        } catch {
          console.warn('Formula onInput(): ev.target is undefined')
        }
      }
    },
  },
}
</script>

<style>
.formula {
  font-size: 32px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, .3);
  box-shadow: 0 0 8px rgba(0, 0, 0, .2);
}
.ML__keyboard {
  z-index: 10000 !important;
}
</style>
