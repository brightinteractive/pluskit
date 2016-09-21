import * as React from 'react'
import { CurveFactory, line, curveLinear } from 'd3-shape'

import { ChartContext } from './chart'
import { Axis } from './axis'
import { Chart } from './chart'
import { Value } from './util'

export interface RendererProps2D<X, Y, Datum> {
  className?: string
  data: Datum[],
  xAxis: Axis<X>,
  yAxis: Axis<Y>,
  getX: (d: Datum) => X,
  getY: (d: Datum) => Y,
  curve?: CurveFactory,
  getKey?: (x: X) => number | string
}

export class Line<X, Y, Datum> extends React.Component<RendererProps2D<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, getX, getY, curve, className } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    const path = line<Datum>()
      .curve(curve || curveLinear)
      .x(d => x(getX(d)))
      .y(d => y(getY(d)))

    return <path className={className} d={path(data)} />
  }
}

export class Dots<X, Y, Datum> extends React.Component<RendererProps2D<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, getX, getY, getKey, className } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    return (
      <g>
      {
        data.map((d, i) =>
          <Value key={getKey ? getKey(getX(d)) : i}>
            <circle className={className} cx={x(getX(d))} cy={y(getY(d))} />
          </Value>
        )
      }
      </g>
    )
  }
}

export interface RendererProps2DImages<X, Y, Datum> extends RendererProps2D<X, Y, Datum> {
  getImage(d: Datum): string
  width: number
  height: number
}

export class Images<X, Y, Datum> extends React.Component<RendererProps2DImages<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, getX, getY, getImage, getKey, width, height } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    return (
      <g>
      {
        data.map((d, i) =>
          <Value key={getKey ? getKey(getX(d)) : i}>
            <image xlinkHref={getImage(d)} x={x(getX(d)) - width / 2} y={y(getY(d)) - height / 2} width={width} height={height} />
          </Value>
        )
      }
      </g>
    )
  }
}
