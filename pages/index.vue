<template lang="html">
  <div class="">
    <h1>
      Mastory Math Components
    </h1>
    <vue-geogebra
      v-model="ggb"
      :view-rect="{ x: [-20, 20], y: [-25, 25], contain: true }"
      :enable-undo-redo="false"
    >
    <!-- @load="onLoad"
    @pan="viewRect = $event"
    @add="countPoints"
    @remove="countPoints"
    @update="countPoints"
    @select="onSelect"
    @deselect="onDeselect"
    @click="onClick"
    @drop="onDrop"
    @tool="onTool"
    @destinationPoint="onDestination"
    @undo="onUndo"
    @redo="onRedo" -->
      <!-- Use the src argument to load a Geogebra worksheet from a URL
           Also, anything inside the pre tag will be constructed on top of that -->
      <!-- <pre>
        a=1
        f(x)=a*x
      </pre> -->
    </vue-geogebra>
  </div>
</template>

<script>
export default {
  data: () => ({
    ggb: {api: null}
  })
}
</script>

<style lang="css" scoped>
</style>
