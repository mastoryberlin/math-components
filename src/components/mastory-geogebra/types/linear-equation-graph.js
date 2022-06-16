import { GeogebraObject, LinearEquation } from '../../vue-geogebra'

export class LinearEquationGraph extends GeogebraObject {
  #handles; #equation;
  #suspendHandleUpdateListener = false; #suspendLineUpdateListener = false;
  constructor(name, firstPoint, secondPoint) {
    super(name, 'LinearEquationGraph')
    this.#handles = [firstPoint, secondPoint]
    const slope = (secondPoint.y - firstPoint.y) / (secondPoint.x - firstPoint.x)
    const yIntercept = firstPoint.y - slope * firstPoint.x
    this.#equation = new LinearEquation(`eq__${name}`, slope, yIntercept)
  }

  get handles() { return this.#handles } // read-only
  get equation() { return this.#equation } // read-only for now

  set color(c) {
    console.log(`Setting color for ${this.type}`, c)
    super.color = c
    this.#equation.color = c
    this.#handles.forEach(p => {p.color = c})
  }

  attach(apiObject, dontCreate) {
    if (this.api) { return }
    super.attach(apiObject)
    this.#equation.attach(apiObject, dontCreate)
    this.#handles.forEach((point, index) => {
      point.attach(apiObject, dontCreate)
      const handlerName = this.name + 'Handle' + index + 'UpdateListener'
      window[handlerName] = () => {
        this._onHandleUpdate(index)
      }
      apiObject.registerObjectUpdateListener(point.name, handlerName)
    })
    const handlerName = this.name + 'LineUpdateListener'
    window[handlerName] = () => {
      this._onLineUpdate()
    }
    apiObject.registerObjectUpdateListener(this.#equation.name, handlerName)
  }

  // -------------------------------------------------------------------------

  _onHandleUpdate(index) {
    if (this.#suspendHandleUpdateListener) { return }
    console.log(`${this.type} "${this.name}": Handler point ${index} was updated`)
    const [firstPoint, secondPoint] = this.#handles
    const eq = this.#equation
    const slope = (secondPoint.y - firstPoint.y) / (secondPoint.x - firstPoint.x)
    this.#suspendLineUpdateListener = true
    eq.slope = slope
    eq.yIntercept = firstPoint.y - slope * firstPoint.x
    this.#suspendLineUpdateListener = false
  }

  // -------------------------------------------------------------------------

  _onLineUpdate() {
    if (this.#suspendLineUpdateListener || !this.api) { return }
    console.log(`${this.type} "${this.name}": Line was updated`)
    // const ineq = this.#equation
    // const tmpName = `tmpHelper_{${this.name}}`
    this.#suspendHandleUpdateListener = true
    // this.#handles.forEach(p => {
      //TODO: project handle onto the line to move it along
    // })
    this.#suspendHandleUpdateListener = false
  }
}
