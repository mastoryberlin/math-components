import { GeogebraObject } from './geogebra-object'

export function parseString(string) {
  const m = string.replaceAll(' ', '').match(/^y(<|>|=|<=|>=|≤|≥)(?:([+-]?(?:\d|\.)*)[×|·]?x([+-](?:\d|\.)*)|([+-]?(?:\d|\.)*)([+-](?:\d|\.)*)[×|·]?x|([+-]?(?:\d|\.)*)|([+-]?(?:\d|\.)*)[×|·]?x)$|^x(<|>|=|<=|>=|≤|≥)([+-]?(?:\d|\.)*)/)
  if (m) {
    if (m[8]) {
      const sign = m[8].replace('≤', '<=').replace('≥', '>=')
      const xIntercept = Number.parseFloat(m[9])
      return [sign, Infinity, undefined, xIntercept]
    } else {
      const sign = m[1].replace('≤', '<=').replace('≥', '>=')
      let slope = Number.parseFloat(m[2] || m[5] || m[7] || 0)
      if (m[2] ==='' || m[5] === '' || m[7] === '') { slope = 1 }
      const yIntercept = Number.parseFloat(m[3] || m[4] || m[6] || 0)
      return [sign, slope, yIntercept]
    }
  } else {
    throw new Error(`Unable to parse inequality string '${string}'`)
  }
}

export class LinearInequality extends GeogebraObject {
  #sign; #slope; #yIntercept; #xIntercept;
  constructor(name, sign, slope, yIntercept, xIntercept) {
    super(name, 'LinearInequality')
    this.#sign = sign
    this.#slope = slope
    if (yIntercept) {
      this.#yIntercept = yIntercept
    }
    if (xIntercept) {
      this.#xIntercept = xIntercept
    }
  }

  // =========================================================================
  // Static Functions
  // =========================================================================

  static fromString(name, def) {
    return new LinearInequality(name, ...parseString(def))
  }

  // =========================================================================
  // Properties
  // =========================================================================

  get sign() {
    if (this.api) {
      if (this.api.exists(this.name)) {
        var defArr = this.api.getValueString(this.name).split(':')
        var ineqInfo = parseString(defArr[1])
        return ineqInfo[0]
      } else {
        return this.#sign
      }
    } else {
      return this.#sign
    }
  }
  set sign(s) {
    this.#sign = s
    if (this.api) { this.invokeEvalWithDefinitionString() }
  }

  // -------------------------------------------------------------------------

  get slope() {
    if (this.api) {
      if (this.api.exists(this.name)) {
        var defArr = this.api.getValueString(this.name).split(':')
        var ineqInfo = parseString(defArr[1])
        return ineqInfo[1]
      } else {
        return this.#slope
      }
    } else {
      return this.#slope
    }
  }
  set slope(m) {
    this.#slope = m
    if (this.api) { this.invokeEvalWithDefinitionString() }
  }

  // -------------------------------------------------------------------------

  get xIntercept() {
    if (this.api) {
      if (this.api.exists(this.name)) {
        const def = this.api.getValueString(this.name).split(':')[1]
        const ineqInfo = parseString(def)
        return ineqInfo[3] || this.#xIntercept
      } else {
        return this.#xIntercept
      }
    } else {
      return  this.#xIntercept
    }
  }
  set xIntercept(x) {
    this.#xIntercept = x
    if (this.api) { this.invokeEvalWithDefinitionString() }
  }

  // -------------------------------------------------------------------------

  get yIntercept() {
    if (this.api) {
      if (this.api.exists(this.name)) {
        var defArr = this.api.getValueString(this.name).split(':')
        var ineqInfo = parseString(defArr[1])
        return ineqInfo[2]
      } else {
        return this.#yIntercept
      }
    } else {
      return  this.#yIntercept
    }
  }
  set yIntercept(y) {
    this.#yIntercept = y
    if (this.api) { this.invokeEvalWithDefinitionString() }
  }

  // -------------------------------------------------------------------------

  get isAxisParallel() {
    if (this.api) {
      const def = this.api.getValueString(this.name).split(':')[1]
      if (!def.includes('y')) { return 'y' }
      if (this.slope === 0) { return 'x'}
    } else {
      if (this.#xIntercept) { return 'y'}
      if (this.#slope === 0) { return 'x'}
    }
    return false
  }

  // =========================================================================
  // Methods
  // =========================================================================

  attach(apiObject, dontCreate) {
    if (this.api) { return }
    super.attach(apiObject)
    if (dontCreate) { return }
    this.invokeEvalWithDefinitionString()
    this.onCreated()
  }

  // -------------------------------------------------------------------------

  oppositeSign() {
    const s = this.sign
    if (s.includes('<')) {
      this.sign = s.replace('<', '>')
      this.invokeEvalWithDefinitionString()
    } else if (s.includes('>')) {
      this.sign = s.replace('>', '<')
      this.invokeEvalWithDefinitionString()
    }
  }

  // -------------------------------------------------------------------------

  invokeEvalWithDefinitionString() {
    if (!this.api) { return }
    const s = this.#sign
    const m = this.#slope
    const r = this.#xIntercept
    const b = this.#yIntercept
    let ineqStr
    if (m === Infinity) {
      ineqStr = `x ${s} ${r}`
    } else {
      ineqStr = `y ${s} ${m}x + ${b}`
    }
    this.api.evalCommand(`${this.name}: ${ineqStr}`)
  }

  // -------------------------------------------------------------------------

  contains(x, y) {
    if (typeof x === 'object' && y === undefined) {
      y = x.y; x = x.x
    }
    let params
    switch (this.isAxisParallel) {
    case 'x': params = `${y}`; break
    case 'y': params = `${x}`; break
    default: params = `${x}, ${y}`
    }
    const v = this.api.getValue(`${this.name}(${params})`)
    return v === 1
  }
}
