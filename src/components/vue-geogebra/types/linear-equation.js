import { LinearInequality } from './linear-inequality'

export class LinearEquation extends LinearInequality {
  constructor(name, slope, yIntercept, xIntercept) {
    super(name, '=', slope, yIntercept, xIntercept)
  }
}
