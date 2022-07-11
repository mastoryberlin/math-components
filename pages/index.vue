<template lang="html">
  <div class="">
    <h1>
      Mastory Math Components
    </h1>

    <div v-show="show">
      <!-- :allow-pan="{ x: [-100, 100], y: [-100, 100] }" -->
      <map-geogebra
        v-model="ggb"
        toolbar="move add_inequality"
        :display-width="w"
        :display-height="h"
        :view-rect="{ x: [-20, 20], y: [-20, 20], contain: true }"
        :enable-undo-redo="false"
        @load="onResize"
      />
      <button @click="scheduleShowHide(false)">
        Hide in 1 seconds
      </button>
    </div>
    <button v-show="!show" @click="scheduleShowHide(true)">
      Show in 1 seconds
    </button>
  </div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
export default {
  data: () => ({
    ggb: {api: null},
    w: process.client? window.innerWidth - 30 : 300,
    h: process.client? window.innerHeight -120 : 300,
    show: false,
  }),
  computed: {
    ...mapState(['showGeogebra']),
  },
  activated() {
    console.log('activated')
    window.addEventListener('resize', this.onResize)
    this.onResize()
    this.show = this.$store.state.showGeogebra
  },
  deactivated() {
    console.log('deactivated')
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    ...mapMutations(['setShowGeogebra']),
    onResize() {
      this.w = window.innerWidth - 29
      this.h = window.innerHeight -119
      setTimeout(() => {
        this.w = window.innerWidth - 30
        this.h = window.innerHeight -120
      }, 50)
    },
    scheduleShowHide(v) {
      setTimeout(() => {
        this.setShowGeogebra(v)
        if (this.$route.path === '/') {
          this.onResize()
          this.show = v
        }
      }, 1000)
    },
  }
}
</script>

<style lang="css" scoped>
</style>
