import * as React from 'react'
import * as css from 'classnames'
const shallowCompare = require('react-addons-shallow-compare')

export interface ButtonProps<T> {
  theme: ButtonTheme
  value: T
  onClick: (x: T, e: React.SyntheticEvent<{}>) => void
  iconClass?: string
}

export interface ButtonState {
}

export interface ButtonTheme {
  root: string
  icon: string
  text: string
}

export default class Button<T> extends React.Component<ButtonProps<T>, ButtonState> {
  state: ButtonState = {}

  componentWillMount() {
    this.handleClick = this.handleClick.bind(this)
  }

  shouldComponentUpdate(newProps: ButtonProps<T>, newState: ButtonState) {
    return shallowCompare(this, newProps, newState)
  }

  handleClick(e: React.SyntheticEvent<{}>) {
    this.props.onClick(this.props.value, e)
  }

  render() {
    const { theme, iconClass, children } = this.props

    return (
      <button className={theme.root} onClick={this.handleClick}>
        <span className={theme.text}>{children}</span>
        {iconClass && <i className={css(theme.icon, iconClass)} />}
      </button>
    )
  }
}
