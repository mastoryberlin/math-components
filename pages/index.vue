<template lang="html">
  <div class="">
    <h1>
      Mastory Math Components
    </h1>
    <map-geogebra
      v-model="ggb"
      toolbar="move add_inequality"
      :display-width="w"
      :display-height="h"
      :view-rect="{ x: [-20, 20], y: [-25, 25], contain: true }"
      :allow-pan="{ x: [-100, 100], y: [-100, 100] }"
      :enable-undo-redo="false"
    >
    </map-geogebra>
  </div>
</template>

<script>
export default {
  data: () => ({
    ggb: {api: null},
    w: 300,
    h: 300,
  }),
  mounted() {
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.w = window.innerWidth - 50
      this.h = window.innerHeight - 200
    }
  }
}
</script>

<style lang="css" scoped>
</style>
