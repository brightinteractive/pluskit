import * as React from 'react'
const shallowCompare = require('react-addons-shallow-compare')
const ContainerDimensions = require('react-container-dimensions')

import { Chart, Surface } from './chart'

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

  renderChart(dims: { width: number, height: number }) {
    const { width, height } = dims
    const margins = {
      left: this.props.marginLeft || 0,
      right: this.props.marginRight || 0,
      top: this.props.marginTop || 0,
      bottom: this.props.marginBottom || 0,
    }

    return (
      <Chart dimensions={{ margins, width, height }}>
        <div style={dims}>
          <Surface>
            {this.props.children}
          </Surface>
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
