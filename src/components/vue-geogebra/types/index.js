import { GeogebraObject } from './geogebra-object'
import { GeogebraNumber } from './geogebra-number'
import { Label } from './label'
import { Point } from './point'
import { LinearEquation } from './linear-equation'
import { LinearInequality } from './linear-inequality'
import { Image } from './image'

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

export { GeogebraObject, GeogebraNumber, Label, Point, LinearEquation, LinearInequality, Image, flash }
