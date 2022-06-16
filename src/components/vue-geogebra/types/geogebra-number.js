import { GeogebraObject } from './geogebra-object'

export class GeogebraNumber extends GeogebraObject {
  #value;
  constructor(name, numValue) {
    super(name, 'GeogebraNumber')
    this.#value = numValue
  }

  get value() {
    if (this.api) {
      return this.#value = this.api.getValue(this.name)
    } else {
      return this.#value
    }
  }
  set value(numValue) {
    if (this.api) {
      this.api.setValue(this.name, numValue)
    }
    this.#value = numValue
  }

  attach(apiObject, dontCreate) {
    super.attach(apiObject)
    if (dontCreate) { return }
    const { api, name, value } = this
    api.evalCommand(`${name} = ${value}`)
    this.onCreated()
  }
}
