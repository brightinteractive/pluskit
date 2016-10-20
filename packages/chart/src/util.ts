import * as React from 'react'

export function Value(props: { children?: any }) {
  return React.Children.only(props.children)
}


export type Rect = { width: number, height: number, x: number, y: number }

export function normalizeRect({ width, height, x, y }: Rect): Rect {
  return {
    x: Math.min(x, x + width),
    y: Math.min(y, y + height),
    width: Math.abs(width),
    height: Math.abs(height)
  }
}

export function withDefault<T>(x : T | undefined, defaultVal: T): T {
  return (typeof x === 'undefined') ? defaultVal : x
}

export function accumulate<T, T_>(array: T[], start: T_, fn: (x: T, prev: T_, i: number) => T_): T_[] {
  let memo = start
  return array.map((x, i) => {
    memo = fn(x, memo, i)
    return memo
  })
}
