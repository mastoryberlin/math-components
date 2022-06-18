import MastoryGeogebra from './mastory-geogebra'

import { VueGeogebra, GeogebraObject, Point } from '../vue-geogebra'
import { LinearInequalityGraph, LinearEquationGraph} from './types'

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

const flash = async (objects, color1, color2, speed = 1, count = 3) => {
  if (objects.constructor === GeogebraObject) { objects = [objects] }
  const flashColors = [color2, color1]
  const sleepTime = 250 / speed
  const double = count * 2
  for (let i = 0; i < double; i++) {
    const f = flashColors[i % 2]
    objects.forEach(o => {o.color = f})
    await sleep(sleepTime)
  }
}

export { MastoryGeogebra, VueGeogebra, GeogebraObject, Point, LinearInequalityGraph, LinearEquationGraph, flash }
export default MastoryGeogebra
