export * from "./formula";
export * from "./geogebra";
export * from "./worksheet";
export * from "./openstreetmap";
export * from "./map-geogebra";

export default {
  install (Vue) {
    Vue.component('Formula', Formula)
    Vue.component('Geogebra', Geogebra)
    Vue.component('MapGeogebra', MapGeogebra)
    Vue.component('Openstreetmap', Openstreetmap)
    Vue.component('Worksheet', Worksheet)
  }
}
