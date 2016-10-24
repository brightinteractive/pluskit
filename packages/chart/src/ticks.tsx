import * as React from 'react'

import { Chart, ChartContext } from './chart'
import { Axis } from './axis'
import { Value } from './util'
import { AnyScale, isDiscrete } from './types'

export interface TickLabelProps<T> {
  className?: string
  style?: {}
  axis: Axis<T, {}, AnyScale<T>>
  formatter: (t: T) => String
  dx?: number | string
  dy?: number | string
  align?: 'start'|'end'
}

export class TickLabels<T> extends React.Component<TickLabelProps<T>, {}> {
  render() {
    const { axis, style, className, dx, dy, formatter } = this.props
    const TickComponent = Ticks as new () => Ticks<T>

    return (
      <TickComponent
        axis={axis}
        renderer={({ x, y, value }: TickRenderProps<T>) => {
          return (
            <text style={style} className={className} x={x} y={y} dx={dx} dy={dy}>
              {formatter(value)}
            </text>
          )
        }}
      />
    )
  }
}

export interface GridLinesProps<T> {
  className?: string
  tickSize?: number
  axis: Axis<T, {}, AnyScale<T>>
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
        return `m ${axis.ascending ? -tickSize / 2 : 0} ${y} l ${width + tickSize} ${0}`

      } else {
        return `m ${x} ${axis.ascending ? -tickSize / 2 : 0} l ${0} ${height + tickSize}`
      }
    }
  }
}


export interface TickProps<T> {
  axis: Axis<T, {}, AnyScale<T>>
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

  renderValue(value: T, scale: AnyScale<T>) {
    const position = scale(value)
    if (typeof position === 'undefined') return undefined

    const offset = isDiscrete(scale) ? scale.bandwidth() * (this.props.axis.ascending ? 0.5 : -0.5) : 0

    return this.props.renderer(
      this.props.axis.isVertical()
      ? { value, x: 0, y: position + offset }
      : { value, x: position + offset, y: 0 }
    )
  }

  render() {
    const { axis } = this.props
    const scale = axis.projectedScale(this.context)

    return (
      <g transform={axis.transform(this.context)}>
      {
        axis.ticks.map(value =>
          <Value key={String(value)}>
          {
            this.renderValue(value, scale)
          }
          </Value>
        )
      }
      </g>
    )
  }
}
