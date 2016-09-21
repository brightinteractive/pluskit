import * as React from 'react'
import { CurveFactory, line, curveLinear } from 'd3-shape'

import { ChartContext } from './chart'
import { Axis } from './axis'
import { Chart } from './chart'
import { Value } from './util'

export interface RendererProps2D<X, Y, Datum> {
  className?: string
  data: Datum[]
  xAxis: Axis<X, Datum>
  yAxis: Axis<Y, Datum>
  curve?: CurveFactory
}

export class Line<X, Y, Datum> extends React.Component<RendererProps2D<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, curve, className } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    const path = line<Datum>()
      .curve(curve || curveLinear)
      .x(d => x(xAxis.get(d)))
      .y(d => y(yAxis.get(d)))

    return <path className={className} d={path(data)} />
  }
}

export class Dots<X, Y, Datum> extends React.Component<RendererProps2D<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, className } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    return (
      <g>
      {
        data.map(d =>
          <Value key={xAxis.datumKey(d)}>
            <circle className={className} cx={x(xAxis.get(d))} cy={y(yAxis.get(d))} />
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
    const { data, xAxis, yAxis, getImage, width, height } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    return (
      <g>
      {
        data.map(d =>
          <Value key={xAxis.datumKey(d)}>
            <image xlinkHref={getImage(d)} x={x(xAxis.get(d)) - width / 2} y={y(yAxis.get(d)) - height / 2} width={width} height={height} />
          </Value>
        )
      }
      </g>
    )
  }
}
