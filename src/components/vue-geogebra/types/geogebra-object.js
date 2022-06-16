export class GeogebraObject {
  #name
  #type
  #api = null
  #definition
  #visible = true
  #color
  #fixed = false
  #selectable = true
  #caption
  constructor(name, type = 'GeogebraObject', options) {
    console.log(`Creating ${type} instance`, options)
    this.#name = name
    this.#type = type
    if (options) {
      const {definition, visible, color, fixed, selectable, caption} = options
      if (visible !== undefined) {this.#visible = visible}
      if (color !== undefined) {this.#color = color}
      if (fixed !== undefined) {this.#fixed = fixed}
      if (selectable !== undefined) {this.#selectable = selectable}
      if (caption !== undefined) {this.#caption = caption}
      if (definition !== undefined) {this.#definition = definition}
    }
  }

  get name() { return this.#name }
  set name(v) {
    if (this.#api) {
      this.#api.renameObject(this.#name, v)
    }
    this.#name = v
  }

  get type() { return this.#type }
  get api() { return this.#api }
  get visible() { return this.#visible }
  get color() { return this.#color }
  get fixed() { return this.#fixed }
  get selectable() { return this.#selectable }
  get caption() { return this.#caption }

  get definition() {
    if (this.#api) {
      return this.#api.getDefinitionString(this.#name)
    } else {
      return this.#definition
    }
  }
  set definition(d) { this.#definition = d }

  set visible(v) {
    if (this.#api) {
      if (this.#api.exists(this.name)) {
        this.#api.setVisible(this.name, v)
      }
    }
    this.#visible = v
  }
  set color(c) {
    if (this.#api) {
      if (this.#api.exists(this.name)) {
        const [R, G, B, opacity] = c
        this.#api.evalCommand(`SetDynamicColor(${this.name},${R/255},${G/255},${B/255}, ${opacity === undefined ? 1 : opacity})`)
      }
    }
    this.#color = c
  }

  set fixed(f) {
    if (this.#api) {
      if (this.#api.exists(this.name)) {
        this.#api.setFixed(this.name, f)
      }
    }
    this.#fixed = f
  }

  set selectable(s) {
    if (this.#api) {
      if (this.#api.exists(this.name)) {
        this.#api.setFixed(this.name, this.fixed, s)
      }
    }
    this.#selectable = s
  }
  set caption(c) {
    if (this.#api) {
      if (this.#api.exists(this.name)) {
        this.#api.setCaption(this.name, c)
      }
    }
    this.#caption = c
  }

  attach(apiObject) {
    if (this.#api) {
      if (this.#api !== apiObject) {
        throw new Error(`Cannot attach ${this.#type} ${this.#name}: object is already attached to another Geogebra applet.`)
      }
    } else {
      this.#api = apiObject
    }
  }
  detach() {
    if (!this.#api) {
      throw new Error(`Cannot detach ${this.#name} since it is nowhere attached.`)
    } else {
      this.#api.deleteObject(this.#name)
      this.#api = null
    }
  }

  onCreated() {
    // Pass on all initial options to Geogebra
    console.log('onCreated called')
    if (this.#api) {
      this.#api.setVisible(this.name, this.#visible)
    }
    //TODO: handle the others as well
  }

  withoutRepaint(doStuff) {
    if (!this.#api) { throw new Error('withoutRepaint needs an API object attached') }
    this.#api.setRepaintingActive(false)
    doStuff()
    this.#api.setRepaintingActive(true)
  }

}
