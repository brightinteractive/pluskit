import * as React from 'react'

import { Chart, ChartContext } from './chart'
import { Axis } from './axis'
import { Value } from './util'

export interface TickLabelProps<T> {
  className?: string
  axis: Axis<T>
  formatter: (t: T) => String
}

export class TickLabels<T> extends React.Component<TickLabelProps<T>, {}> {
  render() {
    const { axis, className, formatter } = this.props
    const TickComponent = Ticks as new () => Ticks<T>

    return (
      <TickComponent
        axis={axis}
        renderer={({ x, y, value }: TickRenderProps<T>) => (
          <text className={className} x={x} y={y}>
            {formatter(value)}
          </text>
        )}
      />
    )
  }
}

export interface GridLinesProps<T> {
  className?: string
  tickSize?: number
  axis: Axis<T>
  formatter: (t: T) => String
}

export class GridLines<T> extends React.Component<GridLinesProps<T>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { width, height } = this.context.chartDimensions
    const { axis, className } = this.props
    const tickSize = this.props.tickSize || 0
    const TicksComponent = Ticks as new () => Ticks<T>

    return (
      <TicksComponent
        axis={axis}
        renderer={(location => <path className={className} d={path(location)} />)}
      />
    )

    function path({ x, y }: { x: number, y: number }) {
      if (axis.isVertical()) {
        return `m ${axis.isAscending() ? -tickSize / 2 : 0} ${y} l ${width + tickSize} ${0}`

      } else {
        return `m ${x} ${axis.isAscending() ? -tickSize / 2 : 0} l ${0} ${height + tickSize}`
      }
    }
  }
}


export interface TickProps<T> {
  axis: Axis<T>
  renderer: TickRenderer<T>,
}

export interface TickRenderer<T> {
  (props: TickRenderProps<T>): React.ReactElement<{}>
}

export interface TickRenderProps<T> {
  value: T
  x: number
  y: number
}

export class Ticks<T> extends React.Component<TickProps<T>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { renderer, axis } = this.props

    const scale = axis.projectedScale(this.context)

    return (
      <g transform={axis.transform(this.context)}>
      {
        axis.ticks.map(value =>
          <Value key={String(value)}>
          {
            renderer(
              axis.isVertical()
              ? { value, x: 0, y: scale(value) }
              : { value, x: scale(value), y: 0 }
            )
          }
          </Value>
        )
      }
      </g>
    )
  }
}
