import * as React from 'react'
import * as ReactDOM from 'react-dom'
const shallowCompare = require('react-addons-shallow-compare')

export interface ClickOutsideProps {
  onClickOutside(): void
}

export interface ClickOutsideState {
}

/**
  Fires an event on click outside the child element
*/
export default class ClickOutside extends React.Component<ClickOutsideProps, ClickOutsideState> {
  componentWillMount() {
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, false);
    document.addEventListener('touchstart', this.handleClickOutside, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, false);
    document.removeEventListener('touchstart', this.handleClickOutside, false);
  }

  handleClickOutside(e: MouseEvent) {
    if (!ReactDOM.findDOMNode(this).contains(event.target as any)) {
      this.props.onClickOutside();
      e.preventDefault()
      e.stopPropagation()
    }
  }

  shouldComponentUpdate(newProps: ClickOutsideProps, newState: ClickOutsideState) {
    return shallowCompare(this, newProps, newState)
  }

  render() {
    return React.Children.only(this.props.children as any)
  }
}
