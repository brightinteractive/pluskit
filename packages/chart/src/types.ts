export interface DataAccessor<Datum, Value> {
  (d: Datum): Value
}

export interface Scale<T> {
  (data: T): number | undefined
  domain(): T[]
  copy(): this
  range(r: [number, number]): this
  ticks?: () => T[]
}

export interface ContinuousScale<T> extends Scale<T> {
  (data: T): number
}

export interface DiscreteScale<T> extends Scale<T> {
  bandwidth: () => number
}

export type AnyScale<T> = ContinuousScale<T> | DiscreteScale<T>

export function isContinuous<T>(s: ContinuousScale<T> | DiscreteScale<T>): s is ContinuousScale<T> {
  return typeof (s as any).bandwidth === 'undefined'
}

export function isDiscrete<T>(s: ContinuousScale<T> | DiscreteScale<T>): s is DiscreteScale<T> {
  return typeof (s as any).bandwidth !== 'undefined'
}

export type Orientation
= 'left'
| 'right'
| 'top'
| 'bottom'
