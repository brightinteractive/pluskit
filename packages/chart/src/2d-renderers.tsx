import * as React from 'react'
import { CurveFactory, line, curveLinear } from 'd3-shape'
import { ScaleLinear } from 'd3-scale'

import { ChartContext } from './chart'
import { Axis } from './axis'
import { Chart } from './chart'
import { Value, normalizeRect, withDefault } from './util'
import { DiscreteScale, ContinuousScale, isDiscrete } from './types'

export type ConinuousScale = ScaleLinear<number, number>

export interface RendererPropsBase<Datum> {
  className?: string
  style?: {}
  data: Datum[]
}


export interface LineProps<X, Y, Datum> extends RendererPropsBase<Datum> {
  xAxis: Axis<X, Datum, ContinuousScale<X>>
  yAxis: Axis<Y, Datum, ContinuousScale<Y>>
  curve?: CurveFactory
}

export class Line<X, Y, Datum> extends React.Component<LineProps<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, curve, className, style } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    const path = line<Datum>()
      .curve(curve || curveLinear)
      .x(d => x(xAxis.get(d)))
      .y(d => y(yAxis.get(d)))

    return <path className={className} style={style} d={path(data)} />
  }
}


export interface BarProps<X, Y, Datum> extends RendererPropsBase<Datum> {
  xAxis: Axis<X, Datum, DiscreteScale<X>>
  yAxis: Axis<Y, Datum, ContinuousScale<Y>>
  spacing: number
}

export class Bar<X, Y, Datum> extends React.Component<BarProps<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, spacing, className, style } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)
    const width = x.bandwidth() - spacing

    if (xAxis.isVertical()) {
      return (
        <g>
        {
          data.map(d => {
            return (
              <Value key={xAxis.datumKey(d)}>
                <rect
                  className={className}
                  style={style}
                  {
                    ...normalizeRect({
                      x: y(y.domain()[0]),
                      y: withDefault(x(xAxis.get(d)), NaN),
                      width: y(yAxis.get(d)) - y(y.domain()[0]),
                      height: width
                    })
                  }
                />
              </Value>
            )
          })
        }
        </g>
      )
    } else {
      return (
        <g>
        {
          data.map(d => {
            return (
              <Value key={xAxis.datumKey(d)}>
                <rect
                  className={className}
                  style={style}
                  {
                    ...normalizeRect({
                      x: withDefault(x(xAxis.get(d)), NaN),
                      y: y(y.domain()[0]),
                      width: width,
                      height: y(yAxis.get(d)) - y(y.domain()[0])
                    })
                  }
                />
              </Value>
            )
          })
        }
        </g>
      )
    }
  }
}


export interface DotsProps<X, Y, Datum> extends RendererPropsBase<Datum> {
  xAxis: Axis<X, Datum, ContinuousScale<X>>
  yAxis: Axis<Y, Datum, ContinuousScale<Y>>
  radius: number
}

export class Dots<X, Y, Datum> extends React.Component<DotsProps<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { data, xAxis, yAxis, className, style } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    return (
      <g>
      {
        data.map(d =>
          <Value key={xAxis.datumKey(d)}>
            <circle className={className} style={style} cx={x(xAxis.get(d))} cy={y(yAxis.get(d))} r={this.props.radius} />
          </Value>
        )
      }
      </g>
    )
  }
}


export interface ValuesProps<X, Y, Datum> extends RendererPropsBase<Datum> {
  xAxis: Axis<X, Datum, ContinuousScale<X> | DiscreteScale<X>>
  yAxis: Axis<Y, Datum, ContinuousScale<Y>>
  formatter: (d: Datum) => React.ReactNode
  requiredSpace?: number
  dx?: number|string
  dy?: number|string
}

export class Values<X, Y, Datum> extends React.Component<ValuesProps<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { className, style, data, xAxis, yAxis, formatter, requiredSpace, dx, dy } = this.props

    const x = xAxis.projectedScale(this.context)
    const y = yAxis.projectedScale(this.context)

    // Distance between projected position for value and the x axis
    const availableSpace = (d: Datum) => Math.abs(y(yAxis.get(d)) - y(y.domain()[0]))

    // Render only if we have enough space to draw the value between its projected
    // position and the x axis (or we don't care about that)
    const shouldRender = (d: Datum) => (typeof requiredSpace === 'undefined') || availableSpace(d) > requiredSpace

    if (xAxis.isVertical()) {
      return (
        <g>
        {
          data.map(d =>
            <Value key={xAxis.datumKey(d)}>
              <text
                dx={dx}
                dy={dy}
                className={className}
                style={style}
                x={y(yAxis.get(d))}
                y={x(xAxis.get(d)) + (isDiscrete(x) ? (x.bandwidth() * 0.5) : 0)}
              >
                {shouldRender(d) && formatter(d)}
              </text>
            </Value>
          )
        }
        </g>
      )
    } else {
      return (
        <g>
        {
          data.map(d =>
            <Value key={xAxis.datumKey(d)}>
              <text
                dx={dx}
                dy={dy}
                className={className}
                style={style}
                x={x(xAxis.get(d)) + (isDiscrete(x) ? (x.bandwidth() * 0.5) : 0)}
                y={y(yAxis.get(d))}
              >
                {shouldRender(d) && formatter(d)}
              </text>
            </Value>
          )
        }
        </g>
      )
    }
  }
}


export interface ImagesProps<X, Y, Datum> extends RendererPropsBase<Datum> {
  xAxis: Axis<X, Datum, ContinuousScale<X>>
  yAxis: Axis<Y, Datum, ContinuousScale<Y>>
  getImage: (d: Datum) => string
  width: number
  height: number
}

export class Images<X, Y, Datum> extends React.Component<ImagesProps<X, Y, Datum>, {}> {
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
