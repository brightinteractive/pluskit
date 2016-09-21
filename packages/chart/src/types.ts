export interface DataAccessor<Datum, Value> {
  (d: Datum): Value
}

export interface Scale<T> {
  (data: T): number,
  copy(): Scale<T>,
  ticks(): T[],
  range(r: [number, number]): Scale<T>,
  clamp(clamp: boolean): Scale<T>,
}

export type Orientation
= 'left'
| 'right'
| 'top'
| 'bottom'
