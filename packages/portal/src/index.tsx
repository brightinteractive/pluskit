import * as React from 'react'
import * as ReactDOM from 'react-dom'
const shallowCompare = require('react-addons-shallow-compare')

export default class Portal extends React.Component<{}, {}> {
  static counter = 0

  portalID = `dp-portal-${++Portal.counter}`
  portalElement: HTMLElement

  shouldComponentUpdate(newProps: {}, newState: {}) {
    return shallowCompare(this, newProps, newState)
  }

  componentDidMount() {
    const p = this.portalID && document.getElementById(this.portalID) || createPortal(this.portalID)

    this.portalElement = p;
    this.componentDidUpdate();
  }

  componentWillUnmount() {
    document.body.removeChild(this.portalElement);
  }

  componentDidUpdate() {
    ReactDOM.render(<div {...this.props}>{this.props.children}</div>, this.portalElement);
  }

  render() {
    return null
  }
}

function createPortal(portalID: string): HTMLDivElement {
  const p = document.createElement('div');
  p.id = portalID;
  document.body.appendChild(p);

  return p
}
