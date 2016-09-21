import * as React from 'react'
import { Axis } from './axis'
import { Value } from './util'

export interface SeriesProps<Datum> {
  data: Datum[]
  axis: Axis<{}, Datum>
  render: (data: Datum[], value: string|number) => React.ReactElement<{}>
  spacing?: number
}

/**
 * Adjusts the Y position of each child so that equal x,y values aren't
 * rendered on the exact same point
 **/
export class Series<Datum> extends React.Component<SeriesProps<Datum>, {}> {
  getSpacing(count: number) {
    const spacing = this.props.spacing || 0

    if (count <= 1) {
      return { offset: 0, spacing: 0 };

    } else {
      const totalSpacing = (count - 1) * spacing;
      return { offset: totalSpacing * -0.5, spacing };
    }
  }

  seriesData() {
    const { axis } = this.props
    const groups: { [key: string]: Datum[] } = {}

    this.props.data.forEach(d => {
      const key = axis.datumKey(d)
      groups[key] = groups[key] || []

      groups[key].push(d)
    })

    return Object.keys(groups).map(key => groups[key])
  }

  render() {
    const { axis, render } = this.props
    const seriesArray = this.seriesData()
    const { offset, spacing } = this.getSpacing(seriesArray.length);

    return (
      <g>
      {
        seriesArray.map((series, i) =>
          <Value key={axis.datumKey(series[0])}>
            <g transform={`translate(0,${i * spacing + offset})`}>
              {render(series, axis.datumKey(series[0]))}
            </g>
          </Value>
        )
      }
      </g>
    );
  }
}
