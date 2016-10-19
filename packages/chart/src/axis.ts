import { assign } from 'lodash'

import { Orientation, AnyScale } from './types'
import { ChartContext } from './chart'
import { withDefault } from './util'

export interface AxisOpts<T, Datum, Scale extends AnyScale<T>> {
  orientation: Orientation
  scale: Scale
  get: (d: Datum) => T
  getKey: (val: T) => number|string
  ticks?: (scale: Scale) => T[]
  compare?: (a: T, b: T) => number
  ascending?: boolean
}

export class Axis<T, Datum, Scale extends AnyScale<T>> {
  orientation: Orientation
  scale: Scale
  ticks: T[]
  get: (d: Datum) => T
  compare: (a: T, b: T) => number
  getKey: (val: T) => number|string
  ascending: boolean

  constructor(opts: AxisOpts<T, Datum, Scale>) {
    this.orientation = opts.orientation
    this.scale = opts.scale
    this.get = opts.get
    this.ticks = opts.ticks && opts.ticks(opts.scale) || (opts.scale.ticks && opts.scale.ticks()) || []
    this.compare = opts.compare || ((a, b) => {
      if (a < b) return 1
      if (a > b) return -1
      return 0
    })
    this.getKey = opts.getKey

    this.compareData = this.compareData.bind(this)
    this.inverseCompareData = this.inverseCompareData.bind(this)
    this.equal = this.equal.bind(this)
    this.ascending = withDefault(opts.ascending, !this.isVertical())

    Object.freeze(this)
  }

  withScale<S extends AnyScale<T>>(scale: S) {
    return new Axis<T, Datum, S>(assign({}, this, { scale, ticks: () => this.ticks }))
  }

  projectedScale(chart: ChartContext): Scale {
    const { chartDimensions } = chart

    if (this.isVertical()) {
      return this.scale.copy().range([
        this.ascending ? 0 : chartDimensions.height,
        this.ascending ? chartDimensions.height : 0,
      ])

    } else {
      return this.scale.copy().range([
        this.ascending ? 0 : chartDimensions.width,
        this.ascending ? chartDimensions.width : 0,
      ])
    }
  }

  datumKey(d: Datum) {
    return this.getKey(this.get(d))
  }

  equal(a: T, b: T) {
    return this.compare(a, b) === 0
  }

  compareData(a: Datum, b: Datum) {
    return this.compare(this.get(a), this.get(b))
  }

  inverseCompareData(a: Datum, b: Datum) {
    return this.compareData(a, b) * -1
  }

  isVertical(): boolean {
    switch (this.orientation) {
      case 'left':
      case 'right':
        return true

      case 'top':
      case 'bottom':
        return false

      default: throw new Error(`Invalid orientation ${this.orientation}`)
    }
  }

  transform(chart: ChartContext): string | undefined {
    const dims = chart.chartDimensions

    switch (this.orientation) {
      case 'left':
        return undefined

      case 'right':
        return `translate(${dims.width},0`

      case 'top':
        return undefined

      case 'bottom':
        return `translate(0,${dims.height})`

      default: throw new Error(`Invalid orientation ${this.orientation}`)
    }
  }
}
