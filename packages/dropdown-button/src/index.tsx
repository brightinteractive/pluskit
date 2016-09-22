import * as React from 'react'
import ClickOutside from '@damplus/click-outside'
const shallowCompare = require('react-addons-shallow-compare')

export interface DropdownProps {
  children?: React.ReactElement<{}>
  className?: string
  button: React.ReactElement<{ onClick: (e: React.SyntheticEvent<Element>) => void }>
}

export interface DropdownState {
  visible?: boolean
}

export default class DropdownButton extends React.Component<DropdownProps, DropdownState> {
  state: DropdownState = {}

  shouldComponentUpdate(newProps: DropdownProps, newState: DropdownState) {
    return shallowCompare(this, newProps, newState)
  }

  render() {
    const { visible } = this.state
    const { className, button, children } = this.props

    return (
      <div className={className}>
        {
          React.cloneElement(button, {
            onClick: (e: React.SyntheticEvent<Element>) => {
              this.setState({ visible: !visible })

              if (button.props.onClick) {
                button.props.onClick(e)
              }
            }
          })
        }
        {
          visible && (
            <ClickOutside onClickOutside={() => this.setState({ visible: false })}>
              {React.Children.only(children)}
            </ClickOutside>
          )
        }
      </div>
    )
  }
}
