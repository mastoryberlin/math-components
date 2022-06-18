import { GeogebraObject, LinearInequality } from '../../vue-geogebra'

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

export class LinearInequalityGraph extends GeogebraObject {
  static opacity = {
    default: 0.2,
    selected: 0.5,
    hover: 0.5,
  }
  static flash = {
    speed: 2,
    count: 3,
  }

  #handles; #inequality; #line;
  #suspendHandleUpdateListener = false; #suspendLineUpdateListener = false;
  constructor(name, firstPoint, secondPoint) {
    super(name, 'LinearInequalityGraph')
    this.#handles = [firstPoint, secondPoint]
    let slope, xIntercept, yIntercept
    if (firstPoint.x === secondPoint.x) {
      if (firstPoint.y === secondPoint.y) { throw new Error(`Cannot create line graph: Handles are both the same point`) }
      slope = Infinity
      xIntercept = firstPoint.x
      yIntercept = undefined
    } else {
      slope = (secondPoint.y - firstPoint.y) / (secondPoint.x - firstPoint.x)
      yIntercept = firstPoint.y - slope * firstPoint.x
      xIntercept = slope === 0 ? undefined : -yIntercept / slope
    }
    this.#inequality = new LinearInequality(`ineq__${name}`, '=', slope, yIntercept, xIntercept)
    this.#line = new LinearInequality(`eq__${name}`, '=', slope, yIntercept, xIntercept)
  }

  get handles() { return this.#handles }
  get inequality() { return this.#inequality }
  get line() { return this.#line }


  get sign() { return this.#inequality.sign }
  set sign(v) { this.#inequality.sign = v }

  get slope() { return this.#inequality.slope }
  set slope(v) { this.#inequality.slope = v }

  get yIntercept() { return this.#inequality.yIntercept }
  set yIntercept(v) { this.#inequality.yIntercept = v }

  get definition() { return this.#inequality.definition }
  set definition(v) { this.#inequality.definition = v }

  get showHandles() { return this.#handles.all(p => p.visible) }
  set showHandles(v) { this.#handles.forEach(p => {p.visible = v}) }

  set color(c) {
    console.log(`Setting color for ${this.type}`, c)
    const semitransparent = [...c]
    semitransparent[3] = this.constructor.opacity.default
    super.color = c
    this.#inequality.color = semitransparent
    this.#line.color = c
    this.#handles.forEach(p => {p.color = c})
  }
  get color() { return super.color }

  async flash() {
    const c = this.color
    const low = [...c]; low[3] = this.constructor.opacity.default
    const high = [...c]; high[3] = this.constructor.opacity.selected
    const flashColors = [high, low]
    const sleepTime = 250 / (this.constructor.flash.speed || 1)
    const count = (this.constructor.flash.count || 3) * 2
    for (let i = 0; i < count; i++) {
      const f = flashColors[i % 2]
      this.#inequality.color = f
      this.#line.color = f
      await sleep(sleepTime)
    }
  }

  attach(apiObject, dontCreate) {
    if (this.api) { return }
    super.attach(apiObject)
    this.withoutRepaint(() => {
      this.#inequality.attach(apiObject, dontCreate)
      this.#line.attach(apiObject, dontCreate)
      this.#handles.forEach((point) => { point.attach(apiObject, dontCreate) })
    })
    this.registerListeners(true)
  }

  // -------------------------------------------------------------------------

  detach() {
    if (!this.api) { return }
    this.registerListeners(false)
    this.#handles.forEach((point) => { point.detach() })
    this.#inequality.detach()
    this.#line.detach()
    super.detach()
  }

  // -------------------------------------------------------------------------

  registerListeners(register) {
    const {api} = this
    if (!api) { return }

    this.#handles.forEach((point, index) => {
      const handlerName = this.name + 'Handle' + index + 'UpdateListener'
      if (!register) {api.unregisterObjectUpdateListener(point.name, handlerName)}
      window[handlerName] = register
        ? () => { this._onHandleUpdate(index) }
        : null
      if (register) {api.registerObjectUpdateListener(point.name, handlerName)}
    })

    const handlerName = this.name + 'LineUpdateListener'
    if (!register) {api.unregisterObjectUpdateListener(this.#inequality.name, handlerName)}
    if (!register) {api.unregisterObjectUpdateListener(this.#line.name, handlerName)}

    window[handlerName] = register ? this._onLineUpdate : null
    if (register) {api.registerObjectUpdateListener(this.#inequality.name, handlerName)}
    if (register) {api.registerObjectUpdateListener(this.#line.name, handlerName)}

  }

  // -------------------------------------------------------------------------

  _onHandleUpdate(index) {
    if (this.#suspendHandleUpdateListener) { return }
    console.log(`${this.type} "${this.name}": Handler point ${index} was updated`)
    const otherIndex = (index + 1) % 2
    const thisPoint = this.#handles[index]
    const otherPoint = this.#handles[otherIndex]
    const ineq = this.#inequality
    const eq = this.#line
    if (thisPoint.x === otherPoint.x) {
      if (thisPoint.y === otherPoint.y) { return }
      this.#suspendLineUpdateListener = true
      // TODO: Improve UX by calling ineq.oppositeSign() conditionally
      ineq.slope = Infinity
      ineq.xIntercept = thisPoint.x
      ineq.yIntercept = undefined
      eq.slope = Infinity
      eq.xIntercept = thisPoint.x
      eq.yIntercept = undefined
      this.#suspendLineUpdateListener = false
    } else {
      const slope = (otherPoint.y - thisPoint.y) / (otherPoint.x - thisPoint.x)
      const yIntercept = thisPoint.y - slope * thisPoint.x
      this.#suspendLineUpdateListener = true
      ineq.slope = slope
      ineq.xIntercept = -yIntercept / slope
      ineq.yIntercept = yIntercept
      eq.slope = slope
      eq.xIntercept = -yIntercept / slope
      eq.yIntercept = yIntercept
      this.#suspendLineUpdateListener = false
    }
  }

  // -------------------------------------------------------------------------

  _onLineUpdate() {
    if (this.#suspendLineUpdateListener || !this.api) { return }
    console.log(`${this.type} "${this.name}": Line was updated`)
    // const ineq = this.#inequality
    this.#suspendHandleUpdateListener = true
    // this.#handles.forEach(p => {
      // TODO: project handle onto the line to move it along
    // })
    this.#suspendHandleUpdateListener = false
  }

}
