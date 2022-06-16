export * from './src/components'

import Formula from './src/components/formula'
import VueGeogebra from './src/components/vue-geogebra'
import MastoryGeogebra from './src/components/mastory-geogebra'
import MapGeogebra from './src/components/map-geogebra'
import Openstreetmap from './src/components/openstreetmap'
import Worksheet from './src/components/worksheet'

export default {
  install (Vue) {
    Vue.component('Formula', Formula)
    Vue.component('VueGeogebra', VueGeogebra)
    Vue.component('MastoryGeogebra', MastoryGeogebra)
    Vue.component('MapGeogebra', MapGeogebra)
    Vue.component('Openstreetmap', Openstreetmap)
    Vue.component('Worksheet', Worksheet)
  }
}
