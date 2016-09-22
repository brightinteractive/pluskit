import * as React from 'react'
const shallowCompare = require('react-addons-shallow-compare')

export interface MyComponentProps {
  className?: string
}

export interface MyComponentState {
}

export default class MyComponentButton extends React.Component<MyComponentProps, MyComponentState> {
  state: MyComponentState = {}

  shouldComponentUpdate(newProps: MyComponentProps, newState: MyComponentState) {
    return shallowCompare(this, newProps, newState)
  }

  render() {
    const { className } = this.props

    return (
      <div className={className}>
      </div>
    )
  }
}
