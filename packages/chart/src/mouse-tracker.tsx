import * as React from 'react'

import { ChartContext } from './chart'
import { Axis } from './axis'
import { Chart } from './chart'

export interface MouseTrackerProps<ScaleValue> {
  axis: Axis<ScaleValue, {}>,
  onChange: (value?: ScaleValue) => void,
}

const mouseTrackerStyle = {
  fill: 'none',
  stroke: 'none',
  pointerEvents: 'all',
}

export class MouseTracker<ScaleValue> extends React.Component<MouseTrackerProps<ScaleValue>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  constructor(props: MouseTrackerProps<ScaleValue>) {
    super(props)

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
  }

  handleMouseLeave() {
    this.props.onChange()
  }

  handleMouseMove(evt: React.MouseEvent<SVGElement>) {
    const { axis, onChange } = this.props
    const { margins } = this.context.chartDimensions

    const targetDims = evt.currentTarget.getBoundingClientRect()
    const offsetX = evt.clientX - targetDims.left - margins.left
    const offsetY = evt.clientY - targetDims.top - margins.top

    const location = axis.isVertical() ? offsetY : offsetX
    const renderedTicks = axis.ticks.map(axis.projectedScale(this.context))
    const idx = closestElementIndex(renderedTicks, location)

    onChange(axis.ticks[idx])
  }

  render() {
    const dims = this.context.chartDimensions

    return (
      <rect
        style={mouseTrackerStyle}
        x={-dims.margins.left}
        y={-dims.margins.top}
        width={dims.width + dims.margins.left + dims.margins.right}
        height={dims.height + dims.margins.top + dims.margins.bottom}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
      />
    )
  }
}

function closestElementIndex(array: number[], value: number): number {
  let closestDistance = Infinity
  let closestIndex = -1

  array.forEach((x, i) => {
    const distance = Math.abs(x - value)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = i
    }
  })

  return closestIndex
}
