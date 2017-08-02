import React, {Component, PropTypes} from 'react'
import CartesianPlane from './CartesianPlane'
import * as util from './util'

import Svg from 'react-native-svg'

export default class PicklesGraph extends Component {
  static childContextTypes = {
    picklesPlane: PropTypes.object,
  }

  state = {
    dimensions: {
      height: 0,
      width: 0,
      set: false,
    },
  }

  constructor(props, context) {
    super(props, context)

    this.plane = new CartesianPlane({
      graph: this,
      values: props.values,
      ...props,
    })
  }

  componentDidReceiveProps(props) {
    if (props.values)
      this.plane.values = props.values
  }

  getChildContext() {
    return {picklesPlane: this.plane}
  }

  get viewBox() {
    return util.viewBox(this.state.dimensions)
  }

  get passthrough() {
    const {viewBox, onLayout, children, ...props} = this.props
    return props
  }

  handleLayout = e => {
    if (this.state.dimensions.set) return
    const {width, height} = e.nativeEvent.layout
    this.setState({dimensions: {width, height, set: true}})
    this.plane.dimensions = {width, height}
  }

  childrenWithDimensions = ({height, width}) => {
    return React.Children.map(this.props.children, child => (
      React.cloneElement(child, {height, width, graph: this})
    ))
  }

  render() {
    const {dimensions} = this.state
    const {children} = this.props
    return (
      <Svg
        onLayout={this.handleLayout}
        viewBox={this.viewBox}
        height={dimensions.height}
        width={dimensions.width}
        {...this.passthrough}
      >
        {dimensions.set && children}
      </Svg>
    )
  }
}
