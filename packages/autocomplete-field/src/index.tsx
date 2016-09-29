import * as React from 'react'
import * as ReactDOM from 'react-dom'
import ClickOutside from '@damplus/click-outside'
const shallowCompare = require('react-addons-shallow-compare')

export interface AutocompleteFieldProps<T> {
  className?: string
  field: React.ReactElement<{
    value: string,
    onChange: React.FormEventHandler<HTMLInputElement>
    onKeyDown: React.KeyboardEventHandler<{}>
  }>
  suggestionContainer: React.ReactElement<{}>

  getKey: (x: T) => string
  suggestions: T[]
  renderSuggestion(item: T): React.ReactElement<{
    onClick: React.MouseEventHandler<{}>
  }>

  textValue: string
  onTextChange: (item: string) => void

  onCommit: (value: T) => void
  onDismiss?: () => void
}

export interface AutocompleteFieldState {
  displaySuggestions?: boolean
  selectedIndex?: number
}

/**
  Autocompleting search component
*/
export default class AutocompleteField<T> extends React.Component<AutocompleteFieldProps<T>, AutocompleteFieldState> {
  state: AutocompleteFieldState = {}
  element: Element

  componentWillMount() {
    this.handleInput = this.handleInput.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  componentDidMount() {
    this.element = ReactDOM.findDOMNode(this)
  }

  shouldComponentUpdate(newProps: AutocompleteFieldProps<T>, newState: AutocompleteFieldState) {
    return shallowCompare(this, newProps, newState)
  }

  handleInput(e: React.FormEvent<HTMLInputElement>) {
    this.setState({ displaySuggestions: true, selectedIndex: undefined })
    this.props.onTextChange(e.currentTarget.value)
  }

  handleKeyDown(e: React.KeyboardEvent<{}>) {
    if (e.key === 'ArrowDown') {
      this.setState({
        selectedIndex: this.updatedSelectedIndex(+1, 0),
      });

      e.preventDefault()

    } else if (e.key === 'ArrowUp') {
      this.setState({
        selectedIndex: this.updatedSelectedIndex(-1, this.props.suggestions.length - 1),
      });

      e.preventDefault()

    } else if (e.key === 'Escape') {
      this.setState({ displaySuggestions: false })

      e.preventDefault()
    }
  }

  commit(index: number) {
    this.setState({ displaySuggestions: false })
    this.props.onCommit(this.props.suggestions[index])
  }

  handleCancel() {
    this.setState({ displaySuggestions: false })
    const inputs = this.element.querySelectorAll('input')
    for (let i = 0; i < inputs.length; ++i) {
      inputs[i].blur()
    }

    if (this.props.onDismiss) {
      this.props.onDismiss()
    }
  }

  updatedSelectedIndex(delta: number, defaultIndex: number): number {
    const { selectedIndex } = this.state

    if (typeof selectedIndex === 'undefined') {
      return defaultIndex
    }

    const next = selectedIndex + delta;
    if (next < 0 || next >= this.props.suggestions.length) {
      return selectedIndex;

    } else {
      return next;
    }
  }

  renderSuggestions() {
    if (!this.state.displaySuggestions || this.props.suggestions.length === 0) {
      return undefined
    }

    return (
      <ClickOutside onClickOutside={this.handleCancel}>
      {
        React.cloneElement(this.props.suggestionContainer, {},
          this.props.suggestions.map((s, i) => React.cloneElement(
            <Item key={this.props.getKey(s)}>
            {
              React.cloneElement(this.props.renderSuggestion(s), {
                onClick: (e: {}) => {
                  this.commit(i)
                }
              })
            }
            </Item>
          ))
        )
      }
      </ClickOutside>
    )
  }

  renderField() {
    return React.cloneElement(this.props.field, {
      value: this.props.textValue,
      onChange: this.handleInput,
      onKeyDown: this.handleKeyDown
    })
  }

  render() {
    return (
      <form
        className={this.props.className}
        onSubmit={e => {
          if (typeof this.state.selectedIndex !== 'undefined') {
            this.commit(this.state.selectedIndex)
          }
          e.preventDefault()
        }}
      >
        {this.renderField()}
        {this.renderSuggestions()}
      </form>
    )
  }
}

export const Item = (props: { children?: any }) => React.Children.only(props.children)
