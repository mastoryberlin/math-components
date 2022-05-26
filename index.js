export * from './src/components'

import Formula from './src/components/formula'
import Geogebra from './src/components/geogebra'
import MapGeogebra from './src/components/mapgeogebra'
import Openstreetmap from './src/components/openstreetmap'
import Worksheet from './src/components/worksheet'

export default {
  install (Vue) {
    Vue.component('Formula', Formula)
    Vue.component('Geogebra', Geogebra)
    Vue.component('MapGeogebra', MapGeogebra)
    Vue.component('Openstreetmap', Openstreetmap)
    Vue.component('Worksheet', Worksheet)
  }
}
