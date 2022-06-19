import { GeogebraObject } from './geogebra-object'

function parseString(string) {
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

// -------------------------------------------------------------------------

const close = (a, b, tolerance) => Math.abs(a - b) <= tolerance

// -------------------------------------------------------------------------

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
      return this.invokeEvalWithDefinitionString()
    } else if (s.includes('>')) {
      this.sign = s.replace('>', '<')
      return this.invokeEvalWithDefinitionString()
    }
  }

  // -------------------------------------------------------------------------

  invokeEvalWithDefinitionString() {
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
    this.definition = ineqStr
    if (!this.api) { return ineqStr }
    this.api.evalCommand(`${this.name}: ${ineqStr}`)
    return ineqStr
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

  // -------------------------------------------------------------------------

  equals(other, t = 0, s = 0) {
    if (other.constructor !== LinearInequality) { throw new TypeError('Cannot compare LinearInequality to value or object of a different type') }
    return this.sign === other.sign &&
        close(this.slope, other.slope, s) &&
        close(this.yIntercept, other.yIntercept, t)
  }

  // -------------------------------------------------------------------------

  checkAgainst(others, t = 0, s = 0) {
    const incomparable = others.find(other => other.constructor !== LinearInequality)
    if (incomparable) {
      console.error('Cannot compare LinearInequality to value or object of a different type', incomparable)
      throw new TypeError('Cannot compare LinearInequality to value or object of a different type')
    }

    const yInterceptsMatch = other => close(other.yIntercept, this.yIntercept, t)
    const slopesMatch = other => close(other.slope, this.slope, s)
    const signsMatch = other => other.sign === this.sign

    const commonMistakePatterns = {
      mixedUpSlopeAndYIntercept: other =>
        signsMatch(other) &&
        close(this.yIntercept, other.slope, t) &&
        close(this.slope, other.yIntercept, s),
      yInterceptFlipped: other =>
        signsMatch(other) &&
        slopesMatch(other) &&
        close(this.yIntercept, -other.yIntercept, t),
      yInterceptWrong: other =>
        signsMatch(other) &&
        slopesMatch(other),
      slopeFlipped: other =>
        signsMatch(other) &&
        yInterceptsMatch(other) &&
        close(Math.abs(this.slope), Math.abs(other.slope), s) &&
        Math.sign(this.slope) === -Math.sign(other.slope),
      slopeReciprocal: (other) => {
        const recip = 1 / other.slope
        if (recip.isNaN) { return false }
        return signsMatch(other) &&
          yInterceptsMatch(other) &&
          close(this.slope, recip, s)
      },
      signFlipped: other =>
        yInterceptsMatch(other) &&
        slopesMatch(other),
      slopeHasWrongSign: other =>
        signsMatch(other) &&
        yInterceptsMatch(other) &&
        Math.sign(other.slope) !== Math.sign(this.slope),
      slopeWrong: other =>
        signsMatch(other) &&
        yInterceptsMatch(other),
    }

    const m = others.find(o => o.equals(this, t, s))
    if (m) { return [m, 'equal'] }

    for (const o of others) {
      for (const [mistakeName, check] of Object.entries(commonMistakePatterns)) {
        if (check(o)) { return [o, mistakeName] }
      }
    }

    return [null, undefined]
  }
}
