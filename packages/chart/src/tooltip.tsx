import * as React from 'react'

import { Axis } from './axis'

export interface TooltipProps<X, Y, Datum> {
  x: Axis<X>
  y: Axis<Y>
  renderer: (y: Y) => String
}

export class Tooltip<X, Y, Datum> extends React.Component<TooltipProps<X, Y, Datum>, {}> {
  anchor: HTMLElement
}
