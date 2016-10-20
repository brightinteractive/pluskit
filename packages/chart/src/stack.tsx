import * as React from 'react'

import { Chart, ChartContext } from './chart'
import { Axis } from './axis'
import { ContinuousScale } from './types'
import { accumulate } from './util'

export interface StackParams<Datum> {
  axis: Axis<{}, Datum, ContinuousScale<{}>>
}

export interface StackProps<Datum, T extends StackParams<Datum>> {
  data: Datum[]
  stacks: T[]
  render: (data: Datum[], params: T) => React.ReactElement<{}>
}

export class Stack<Datum, Params extends StackParams<Datum>> extends React.Component<StackProps<Datum, Params>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  render() {
    const { stacks, data, render } = this.props
    const projectedScales = this.props.stacks.map(s => s.axis.projectedScale(this.context))

    return (
      <g>
      {
        data.map(datum => {
          const indexOffset = (i: number): number => {
            const axis = stacks[i].axis
            const scale = projectedScales[i]

            return scale(axis.get(datum)) - scale(scale.domain()[0])
          }
          const offsets = accumulate(this.props.stacks, 0, (x, prev, i) =>
            (i === 0) ? 0 : prev + indexOffset(i - 1)
          )

          return this.props.stacks.map((s, i) => {
            const offset = offsets[i]

            return (
              <g transform={`translate(${s.axis.isVertical() ? 0 : offset},${s.axis.isVertical() ? offset : 0})`}>
                { render([datum], s) }
              </g>
            )
          })
        })
      }
      </g>
    );
  }
}
