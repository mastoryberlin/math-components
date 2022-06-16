import ClientGeogebra from './vue-geogebra.vue'
import ServerGeogebra from './ssr.vue'

import {GeogebraObject, GeogebraNumber, Label, Point, LinearInequality, LinearEquation} from './types'

const VueGeogebra = process && process.server ? ServerGeogebra : ClientGeogebra
export { VueGeogebra, GeogebraObject, GeogebraNumber, Label, Point, LinearInequality, LinearEquation}
export default VueGeogebra
