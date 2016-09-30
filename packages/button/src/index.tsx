import * as React from 'react'
import * as css from 'classnames'
const shallowCompare = require('react-addons-shallow-compare')

export interface ButtonProps {
  theme: ButtonTheme
  onClick: (e: React.SyntheticEvent<{}>) => void
  iconClass?: string
}

export interface ButtonState {
}

export interface ButtonTheme {
  root: string
  icon: string
  iconContainer: string
  text: string
}

export default class Button extends React.Component<ButtonProps, ButtonState> {
  state: ButtonState = {}

  shouldComponentUpdate(newProps: ButtonProps, newState: ButtonState) {
    return shallowCompare(this, newProps, newState)
  }

  render() {
    const { theme, iconClass, children } = this.props

    return (
      <button className={theme.root} onClick={this.props.onClick}>
        <span className={theme.text}>{children}</span>
        {
          iconClass && (
            <div className={theme.iconContainer}>
              <i className={css(theme.icon, iconClass)} />
            </div>
          )
        }
      </button>
    )
  }
}
