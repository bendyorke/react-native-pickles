import React, {Component, PropTypes} from 'react'

import {
  times,
} from 'lodash'

import {
  Text
} from 'react-native-svg'

export default class PicklesAxis extends Component {
  static contextTypes = {
    picklesPlane: PropTypes.object,
  }

  static propTypes = {
    vertical: PropTypes.bool,
    count: PropTypes.number,
  }

  constructor(props, context) {
    super(props, context)

    this.plane = context.picklesPlane
  }

  get values() {
    const {vertical, count, format} = this.props
    const range = vertical ? this.plane.yRange : this.plane.xRange
    const step = range / count
    return times(count, n => format(n * step))
  }

  renderVertical = () => {
    return (
      <Text y={20}>{this.values.join(',')}</Text>
    )
  }

  renderHorizontal = () => {
    return (
      <Text>{this.values.join(',')}</Text>
    )
  }

  render() {
    const {vertical} = this.props

    if (vertical) return this.renderVertical()

    return this.renderHorizontal()
  }
}
