import * as React from 'react'
import { Axis } from './axis'
import { Chart, ChartContext } from './chart'
import { Value } from './util'

export interface TooltipProps<X, Y, Datum> {
  x: Axis<X, Datum>
  y: Axis<Y, Datum>
  reservedSize: number
  data: Datum[]
  value: X
  getKey: (d: Datum) => string | number
  render: (d: Datum, pos: { x: number, y: number }) => React.ReactElement<{}>
}

/**
 * Render tooltips for each y at the provided x value, ensuring that tooltips
 * representing similar Y values do not overlap each other.
 **/
export class Tooltips<X, Y, Datum> extends React.Component<TooltipProps<X, Y, Datum>, {}> {
  static contextTypes = Chart.childContextTypes
  context: ChartContext

  /**
   * Position tooltips on their represented Y values, stacking them if there
   * they would otherwise overlap.
   */
  layout(data: Datum[]) {
    const { y, reservedSize } = this.props
    const yScale = y.projectedScale(this.context)

    const positions: number[] = []
    let dataPosition = (i: number) => yScale(y.get(data[i]))

    positions[0] = dataPosition(0)
    for (let i = 1; i < data.length; ++i) {
      positions[i] = Math.min(positions[i - 1] - reservedSize, dataPosition(i))
    }

    return positions
  }

  render() {
    const { x, y, data, value } = this.props
    const { margins } = this.context.chartDimensions

    const xScale = this.props.x.projectedScale(this.context)

    const displayedData = data
      .filter(d => x.equal(x.get(d), value))
      .sort(y.inverseCompareData)

    const yPositions = this.layout(displayedData)
    const xPos = xScale(value) + margins.left;
    const yStart = margins.top;

    return (
      <div>
      {
        displayedData.map((datum, i) =>
          <Value key={this.props.getKey(datum)}>
            {this.props.render(datum, { x: xPos, y: yStart + yPositions[i] })}
          </Value>
        )
      }
      </div>
    )
  }
}
