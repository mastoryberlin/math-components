<template lang="html">
  <div class="empty-wrapper">
    <component :is="WorksheetComponent" />
  </div>
</template>

<script>
import { Geogebra, Formula, MapGeogebra } from "../";

export default {
  name: "Worksheet",
  components: { Geogebra, Formula, MapGeogebra },
  props: {
    template: {
      type: String,
      default: "<div/>",
    },
    script: {
      type: String,
      default: () => {},
    },
    stylesheet: {
      type: String,
      default: "",
    },
  },
  emit: ["submit"],
  computed: {
    WorksheetComponent() {
      // eslint-disable-next-line no-new-func
      const options = new Function(`return {${this.script}}`)();
      const { components, data = {} } = options;

      return {
        ...options,
        components: { ...components, Geogebra, Formula, MapGeogebra },
        data: () => (data.constructor === Function ? data() : data),
        template: `<div id="previewArea">${this.template}</div>`,
      };
    },
  },
  mounted() {
    window.submit = (output) => this.$emit("submit", { output });
    setTimeout(() => {
      const previewArea = document.getElementById("previewArea");
      if (previewArea && previewArea.firstChild) {
        const cssRules = this.stylesheet;
        const styleElement = document.createElement("style");
        styleElement.appendChild(document.createTextNode(cssRules));
        previewArea.firstChild.appendChild(styleElement);
      }
    }, 500);
  },
};
</script>

<style>
&-app > *:not(.ggb-container) {
  all: initial !important;
}
</style>
