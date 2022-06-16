import { GeogebraObject } from './geogebra-object'

export class Label extends GeogebraObject {
 #value; #coords;
 constructor(name, strValue, coords) {
   super(name, 'Label')
   this.#value = strValue
   if (coords) {
     this.#coords = coords
   }
 }

 get value() {
   if (this.api) {
     return this.api.getValueString(this.name)
   } else {
     return this.#value
   }
 }

 get coords() {
   return this.#coords
 }

 set value(strValue) {
   if (this.api) {
     this.api.evalCommand(`${name} = "${strValue}"`)
   }
     this.#value = strValue
 }

 set coords(c) {
   if (this.api) {
     this.api.setCoords(this.name, c[0], c[1])
   }
   this.#coords = c
 }

  attach(apiObject, dontCreate) {
    super.attach(apiObject)
    if (dontCreate) { return }
    const { api, name, value, coords } = this
    api.evalCommand(`${name} = "${value}"`)
    if (coords) {
      api.setCoords(`${name}`, coords[0], coords[1])
    }
    this.onCreated()
  }

}
