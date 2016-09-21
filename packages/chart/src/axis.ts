import { Orientation, Scale } from './types'
import { ChartContext } from './chart'

export class Axis<T> {
  orientation: Orientation
  scale: Scale<T>
  ticks: T[]

  constructor(opts: { orientation: Orientation, scale: Scale<T>, ticks?: (s: Scale<T>) => (T[]) }) {
    this.orientation = opts.orientation
    this.scale = opts.scale
    this.ticks = opts.ticks ? opts.ticks(opts.scale) : opts.scale.ticks()

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
