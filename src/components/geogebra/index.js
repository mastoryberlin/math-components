import ClientGeogebra from './geogebra.vue'
import ServerGeogebra from './ssr.vue'

const Geogebra = process && process.server ? ServerGeogebra : ClientGeogebra
export { Geogebra }
export default Geogebra
