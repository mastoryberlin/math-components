import { GeogebraObject } from './geogebra-object'
import { Point } from './point'

const BottomLeft = 0
const BottomRight = 1
// const TopRight = 2
const TopLeft = 3

export class Image extends GeogebraObject {
  #anchor; #x; #y; #size; #corners; #angle; #w; #h; #initialAngle; #zoomable
  constructor(name, anchor, x, y, size, angle, visible = true, zoomable = true) {
    super(name, 'Image', {visible})
    this.#anchor = anchor || 'center'
    this.#x = x || 0
    this.#y = y || 0
    this.#w = this.#h = this.#size = size || 1
    this.#angle = angle || 0
    this.#zoomable = zoomable
    this.#corners = []
  }

  // -------------------------------------------------------------------------

  get x() { return this.#x }
  set x(xNew) {
    const c = this.#corners
    const {cos, PI} = Math
    const a = this.#angle / 180 * PI
    switch (this.#anchor) {
      case 'bottom-left': if (this.api) { c[BottomLeft].x = xNew } break
      case 'center': default:
        if (this.api) {
          const aBottomLeft = a + c[BottomLeft].initialAngle
          const aBottomRight = a + c[BottomRight].initialAngle
          c[BottomLeft].x = xNew + cos(aBottomLeft) * c[BottomLeft].radius
          c[BottomRight].x = xNew + cos(aBottomRight) * c[BottomRight].radius
          break
        }
    }
    this.#x = xNew
  }

  // -------------------------------------------------------------------------

  get y() { return this.#y }
  set y(yNew) {
    const c = this.#corners
    const {sin, PI} = Math
    const a = this.#angle / 180 * PI
    switch (this.#anchor) {
      case 'bottom-left': if (this.api) { c[BottomLeft].y = yNew } break
      case 'center': default:
        if (this.api) {
          const aBottomLeft = a + c[BottomLeft].initialAngle
          const aBottomRight = a + c[BottomRight].initialAngle
          c[BottomLeft].y = yNew + sin(aBottomLeft) * c[BottomLeft].radius
          c[BottomRight].y = yNew + sin(aBottomRight) * c[BottomRight].radius
          break
        }
    }
    this.#y = yNew
  }

  // -------------------------------------------------------------------------

  get coordinates() { return [this.x, this.y] }
  set coordinates(array) {
    if (typeof array !== 'object' || array.constructor !== Array || array.length < 2) { throw new TypeError(`An Image's coordinates must be set to an array of Numbers of length 2`) }
    this.x = array[0]
    this.y = array[1]
  }

  // -------------------------------------------------------------------------

  get width() { return this.#w }
  get height() { return this.#h }

  // -------------------------------------------------------------------------

  set width(v) {
    const r = v / this.#w
    this.#w = v
    this.#h *= r
    this.resize()
    this.x = this.#x
    this.y = this.#y
  }
  set height(v) {
    const r = v / this.#h
    this.#h = v
    this.#w *= r
    this.resize()
    this.x = this.#x
    this.y = this.#y
  }

  // -------------------------------------------------------------------------

  get angle() { return this.#angle }
  set angle(v) {
    this.#angle = v
    this.x = this.#x
    this.y = this.#y
  }

  // -------------------------------------------------------------------------

  attach(apiObject, dontCreate) {
    if (this.api) { return }
    super.attach(apiObject)
    for(let i = 1; i <= 4; i++) {
      const cornerName = `${this.name}Corner${i}`
      console.log(`Creating corner point ${cornerName}`)
      const point = new Point(cornerName)
      if (i >= 3) {
        // unlike the 2 bottom corners, create the 3rd and 4th ones as dependent objects to calculate the height
        apiObject.evalCommand(`${cornerName} = Corner(${this.name}, 3)`)
      }
      point.attach(apiObject, true)
      point.visible = false
      this.#corners.push(point)
    }
    const c = this.#corners
    this.#w = c[BottomRight].x - c[BottomLeft].x
    this.#h = c[TopLeft].y - c[BottomLeft].y
    this.resize()
    this.x = this.#x
    this.y = this.#y
    if (dontCreate) {
      return
    }
    //TODO: Create image dynamically (is this even posssible ??)
    this.onCreated()
  }

  // -------------------------------------------------------------------------

  resize() {
    const {atan2, sqrt, pow} = Math
    const c = this.#corners
    const w2 = this.#w / 2
    const h2 = this.#h / 2
    c[BottomLeft].initialAngle = atan2(-h2, -w2)
    c[BottomLeft].radius = sqrt(pow(w2, 2) + pow(h2, 2))
    c[BottomRight].initialAngle = atan2(-h2, w2)
    c[BottomRight].radius = sqrt(pow(w2, 2) + pow(h2, 2))
  }
}
