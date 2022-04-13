<template lang="html">
  <component :is="WorksheetComponent" />
</template>

<script>
import GeoGebra from "./GeoGebra.vue"
import Formula from "./Formula.vue"

export default {
  name: 'Worksheet',
  components: { GeoGebra, Formula },
  props: {
    template: {
      type: String,
      default: '<div/>',
    },
    script: {
      type: String,
      default: () => {},
    },
    stylesheet: {
      type: String,
      default: '',
    },
  },
  computed: {
    WorksheetComponent() {
      // eslint-disable-next-line no-new-func
      const options = new Function(`return {${this.script}}`)()
      const { components, data = {} } = options

      return {
        ...options,
        components: { ...components, GeoGebra, Formula },
        data: () => data.constructor === Function ? data() : data,
        template: `<div>${this.template}</div>`,
        styles: this.stylesheet,
      }
    },
  },
}
</script>
