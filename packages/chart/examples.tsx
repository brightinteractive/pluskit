import * as React from 'react';
import * as _ from 'lodash'
import { scaleLinear, scaleBand } from 'd3-scale'
import { storiesOf } from '@kadira/storybook';
import * as Chart from './src';

declare var module: {}

interface Datum {
  x: number
  y1: number
  y2: number
}

const data = _.times(20, x => ({ x, y1: _.random(0, 100, false), y2: _.random(0, 50, false) }))

const xAxisV = new Chart.Axis({
  orientation: 'bottom',
  scale: scaleLinear().domain([0, 20]),
  get: ({ x }: Datum) => x,
  getKey: (x: number) => x
})
const yAxisV = new Chart.Axis({
  orientation: 'left',
  scale: scaleLinear().domain([0, 150]),
  get: ({ y1 }: Datum) => y1,
  getKey: (y: number) => y,
})
const y2AxisV = new Chart.Axis({
  orientation: 'left',
  scale: scaleLinear().domain([0, 150]),
  get: ({ y2 }: Datum) => y2,
  getKey: (y: number) => y
})
const xAxisH = new Chart.Axis({
  orientation: 'left',
  scale: scaleLinear().domain([0, 20]),
  get: ({ x }: Datum) => x,
  getKey: (x: number) => x,
  ascending: true
})
const yAxisH = new Chart.Axis({
  orientation: 'top',
  scale: scaleLinear().domain([0, 150]),
  get: ({ y1 }: Datum) => y1,
  getKey: (y: number) => y
})
const y2AxisH = new Chart.Axis({
  orientation: 'top',
  scale: scaleLinear().domain([0, 150]),
  get: ({ y2 }: Datum) => y2,
  getKey: (y: number) => y
})

const barsScale = scaleBand<number>()
  .domain(data.map(d => d.x))
  .round(true)

const Line = Chart.Line as new() => Chart.Line<number, number, Datum>
const Bar = Chart.Bar as new() => Chart.Bar<number, number, Datum>
const Values = Chart.Values as new () => Chart.Values<number, number, Datum>

storiesOf('Chart', module)
  .add('Simple Line', () => (
    <Container>
      <Chart.ResponsiveChart marginLeft={50} marginBottom={50}>
        <Chart.Surface>
          <Line
            data={data}
            style={{ stroke: 'steelblue', strokeWidth: 1, fill: 'none' }}
            xAxis={xAxisV}
            yAxis={yAxisV}
          />
        </Chart.Surface>
      </Chart.ResponsiveChart>
    </Container>
  ))
  .add('Vertical Bars', () => (
    <Container>
      <Chart.ResponsiveChart marginLeft={50} marginBottom={50}>
        <Chart.Surface>
          <Bar
            data={data}
            style={{ fill: 'steelblue' }}
            xAxis={xAxisV.withScale(barsScale)}
            yAxis={yAxisV}
            spacing={1}
          />
          <Values
            xAxis={xAxisV.withScale(barsScale)}
            yAxis={yAxisV}
            data={data}
            formatter={(d: Datum) => d.y1}
            style={{ textAnchor: 'middle', fill: 'white' }}
            dy="1em"
          />
        </Chart.Surface>
      </Chart.ResponsiveChart>
    </Container>
  ))
  .add('Horizontal Bars', () => (
    <Container flipped>
      <Chart.ResponsiveChart marginLeft={50} marginBottom={50}>
        <Chart.Surface>
          <Bar
            data={data}
            style={{ fill: 'steelblue' }}
            xAxis={xAxisH.withScale(barsScale)}
            yAxis={yAxisH}
            spacing={1}
          />
          <Values
            xAxis={xAxisH.withScale(barsScale)}
            yAxis={yAxisH}
            data={data}
            formatter={(d: Datum) => d.y1}
            style={{ textAnchor: 'end', fill: 'white' }}
            dx="-0.25em"
            dy="0.33em"
          />
        </Chart.Surface>
      </Chart.ResponsiveChart>
    </Container>
  ))
  .add('Stacked Vertical Bars', () => (
    <Container>
    <Chart.ResponsiveChart marginLeft={50} marginBottom={50}>
      <Chart.Surface>
        <Chart.Stack
          data={data}
          stacks={[
            { fill: 'orange', axis: yAxisV },
            { fill: 'steelblue', axis: y2AxisV }
          ]}
          render={
            (data, { fill, axis }) => (
              <g>
                <Bar
                  xAxis={xAxisV.withScale(barsScale)}
                  yAxis={axis}
                  data={data}
                  style={{ fill }}
                  spacing={1}
                />,
                <Values
                  xAxis={xAxisV.withScale(barsScale)}
                  yAxis={axis}
                  data={data}
                  style={{ textAnchor: 'middle', fill: 'white' }}
                  formatter={(d: Datum) => String(axis.get(d))}
                  dy="1em"
                />
              </g>
            )
          }
        />
        </Chart.Surface>
      </Chart.ResponsiveChart>
    </Container>
  ))
  .add('Stacked Horizontal Bars', () => (
    <Container flipped>
    <Chart.ResponsiveChart marginLeft={50} marginBottom={50}>
      <Chart.Surface>
        <Chart.Stack
          data={data}
          stacks={[
            { fill: 'orange', axis: yAxisH },
            { fill: 'steelblue', axis: y2AxisH }
          ]}
          render={
            (data, { fill, axis }) => (
              <g>
                <Bar
                  data={data}
                  style={{ fill }}
                  xAxis={xAxisH.withScale(barsScale)}
                  yAxis={axis}
                  spacing={1}
                />
                <Values
                  xAxis={xAxisH.withScale(barsScale)}
                  yAxis={axis}
                  data={data}
                  formatter={(d: Datum) => String(axis.get(d))}
                  style={{ textAnchor: 'end', fill: 'white' }}
                  dx="-0.25em"
                  dy="0.33em"
                />
              </g>
            )
          }
        />
        </Chart.Surface>
      </Chart.ResponsiveChart>
    </Container>
  ))

const Container = ({ flipped, children }: { flipped?: boolean, children?: React.ReactChild }) => (
  <div>
    <div style={ flipped ? { width: 320, height: 400 } : { width: 530, height: 240 }}>
      {children}
    </div>
    <p><strong>y1:</strong> {data.map(d => d.y1).join(', ')}</p>
    <p><strong>y2:</strong> {data.map(d => d.y2).join(', ')}</p>
  </div>
)
