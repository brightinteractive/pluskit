import * as React from 'react'
const shallowCompare = require('react-addons-shallow-compare')
const ContainerDimensions = require('react-container-dimensions').default

import { Chart } from './chart'

export interface ResponsiveChartProps {
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
}

export class ResponsiveChart extends React.Component<ResponsiveChartProps, {}> {
  componentWillMount() {
    this.renderChart = this.renderChart.bind(this)
  }

  shouldComponentUpdate(nextProps: ResponsiveChartProps, nextState: {}) {
    return shallowCompare(this, nextProps, nextState)
  }

  renderChart(dims: { width: number, height: number, top: number, bottom: number, left: number, right: number }) {
    const { width, height, left, right, top, bottom } = dims
    const margins = {
      left: this.props.marginLeft || 0,
      right: this.props.marginRight || 0,
      top: this.props.marginTop || 0,
      bottom: this.props.marginBottom || 0,
    }

    return (
      <Chart dimensions={{ margins, width, height, left, right, top, bottom }}>
        <div style={dims}>
          {this.props.children}
        </div>
      </Chart>
    )
  }

  render() {
    return (
      <ContainerDimensions>
        {this.renderChart}
      </ContainerDimensions>
    )
  }
}
