import { Orientation, Scale } from './types'
import { ChartContext } from './chart'

export interface AxisOpts<T, Datum> {
  orientation: Orientation
  scale: Scale<T>
  get: (d: Datum) => T
  getKey: (val: T) => number|string
  ticks?: (scale: Scale<T>) => T[]
  compare?: (a: T, b: T) => number
}

export class Axis<T, Datum> {
  orientation: Orientation
  scale: Scale<T>
  ticks: T[]
  get: (d: Datum) => T
  compare: (a: T, b: T) => number
  getKey: (val: T) => number|string

  constructor(opts: AxisOpts<T, Datum>) {
    this.orientation = opts.orientation
    this.scale = opts.scale
    this.get = opts.get
    this.ticks = opts.ticks ? opts.ticks(opts.scale) : opts.scale.ticks()
    this.compare = opts.compare || ((a, b) => {
      if (a < b) return 1
      if (a > b) return -1
      return 0
    })
    this.getKey = opts.getKey

    this.compareData = this.compareData.bind(this)
    this.inverseCompareData = this.inverseCompareData.bind(this)
    this.equal = this.equal.bind(this)

    Object.freeze(this)
  }

  projectedScale(chart: ChartContext): Scale<T> {
    const { chartDimensions } = chart

    if (this.isVertical()) {
      return this.scale.copy().range([chartDimensions.height, 0])

    } else {
      return this.scale.copy().range([0, chartDimensions.width])
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

  isAscending(): boolean {
    switch (this.orientation) {
      case 'left':
      case 'top':
        return true

      case 'right':
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
