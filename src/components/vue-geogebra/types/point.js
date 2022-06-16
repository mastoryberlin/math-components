import { GeogebraObject } from './geogebra-object'

export class Point extends GeogebraObject {
  #x; #y
  constructor(name, x, y) {
    super(name, 'Point')
    this.#x = x
    this.#y = y
    this.length = 2
  }

  // -------------------------------------------------------------------------

  // allow index-based access to coordinate values
  // e.g. const [x, y] = myPoint
  [Symbol.iterator]() {
    return [this.x, this.y].values()
  }

  // -------------------------------------------------------------------------

  get x() {
    if (this.api) {
      return this.#x = this.api.getXcoord(this.name)
    } else {
      return this.#x
    }
  }
  set x(xNew) {
    if (this.api) {
      let yCurrent = this.y
      this.api.setCoords(this.name, xNew, yCurrent)
    }
    this.#x = xNew
  }

  // -------------------------------------------------------------------------

  get y() {
    if (this.api) {
      return this.#y = this.api.getYcoord(this.name)
    } else {
      return this.#y
    }
  }
  set y(yNew) {
    if (this.api) {
      let xCurrent = this.x
      this.api.setCoords(this.name, xCurrent, yNew)
    }
    this.#y = yNew
  }

  // -------------------------------------------------------------------------

  get coordinates() { return [...this] }
  set coordinates(array) {
    if (typeof array !== 'object' || array.constructor !== Array || array.length < 2) { throw new TypeError(`A Point's coordinates must be set to an array of Numbers of length 2`) }
    this.x = array[0]
    this.y = array[1]
  }

  // -------------------------------------------------------------------------

  attach(apiObject, dontCreate) {
    if (this.api) { return }
    super.attach(apiObject)
    if (dontCreate) { return }
    apiObject.evalCommand(`${this.name} = (${this.#x}, ${this.#y})`)
    this.onCreated()
  }
}
