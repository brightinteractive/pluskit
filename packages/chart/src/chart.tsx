import * as React from 'react'

export type ChartContext = {
  chartDimensions: ChartDimensions
}

export type ChartDimensions = {
  width: number
  height: number
  top: number
  left: number
  right: number
  bottom: number
  margins: {
    left: number
    right: number
    top: number
    bottom: number
  }
}

export interface ChartProps {
  dimensions: ChartDimensions
  children?: any
}

export class Chart extends React.Component<ChartProps, {}> {
  static childContextTypes: any = {
    chartDimensions: React.PropTypes.object,
  }

  getChildContext() {
    const { width, height, margins } = this.props.dimensions

    return {
      chartDimensions: {
        margins,
        width: width - margins.left - margins.right,
        height: height - margins.top - margins.bottom,
      },
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export class Surface extends React.Component<{ children?: any }, {}> {
  context: ChartContext

  static contextTypes = Chart.childContextTypes

  render() {
    const { width, height, margins } = this.context.chartDimensions
    const fullWidth = width + margins.left + margins.right
    const fullHeight = height + margins.top + margins.bottom

    return (
      <svg width={fullWidth} height={fullHeight} style={{ shapeRendering: 'crisp-edges' }}>
        <g transform={`translate(${margins.left},${margins.top})`}>
          {this.props.children}
        </g>
      </svg>
    )
  }
}
