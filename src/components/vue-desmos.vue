<template lang="html">
  <div class="vue-desmos--wrapper">
    <div class="vue-desmos"></div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: null,
    }
  },
  data: () => ({
    lastBounds: null,
  }),
  mounted() {
    const el = this.$el.getElementsByClassName('vue-desmos')[0]
    const desmos = Desmos.GraphingCalculator(el, {
      autosize: true,
      zoomButtons: false,
      showResetButtonOnGraphpaper: false,
      settingsMenu: false,
      expressionsCollapsed: true,
      pointsOfInterest: false,
      trace: false,
      border: false,
      audio: false,
      images: false,
      colors: { red: "#ef5965", 'light green': "#98cf9f", purple: "#4d35c7", 'light blue': "#94d5db", pink: "#c35da3" }
    })
    this.$emit('input', desmos)
  }
}
</script>

<style lang="css">
.vue-desmos--wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: aliceblue;
}
.vue-desmos {
  width: 75%;
  height: 50%;
}
.dcg-exppanel-outer {
  display: none !important;
}
.dcg-exppanel-container {
  display: none !important;
}
.dcg-calculator-api-container .dcg-container {
  background: unset !important;
}
.dcg-container {
  background: unset;
}
.dcg-calculator-api-container .dcg-overgraph-icon-container {
  display: none;
}
</style>
