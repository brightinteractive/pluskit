import * as React from 'react'

export function Value(props: { children?: any }) {
  return React.Children.only(props.children)
}
