import React, {Component, PropTypes} from 'react'

import {
  random,
} from 'lodash'

import Svg, {
  Rect,
} from 'react-native-svg'

import {
  Animated,
} from 'react-native'

export default class PicklesBar extends Component {
  static propTypes = {
    animation: PropTypes.oneOf(['spring', 'timing']),
    height: PropTypes.number,
    width: PropTypes.number,
  }

  static defaultProps = {
    animation: 'timing',
  }

  constructor(props) {
    super(props)

    this.bars = {}

    this.state = {
      values: props.values.map(() => new Animated.Value(0))
    }

    this.state.values[0].addListener(point => (
      Object.values(this.bars).forEach(this.updateBar)
    ))
  }

  componentWillReceiveProps(props) {
    const {values: next, animation} = props
    const {values: prev} = this.props

    next.forEach((toValue, index) => {
      if (toValue !== prev[index])
        Animated[animation](this.state.values[index], {toValue}).start()
    })
  }

  updateBar = (bar, index) => {
    const {values} = this.state
    const value = values[index] && values[index]._value || 0
    const height = `${-value}`
    bar.setNativeProps({height})
  }

  render() {
    const {height, width} = this.props
    const {values} = this.state
    const size = 4
    const spacing = (100 - size) / (values.length - 1)

    return (
      <Svg height={height} width={width} viewBox="0 0 100 100" style={{borderWidth: 1, borderColor: 'black'}}>
        {values.map((_, index) => (
          <Rect
            ref={ref => index || index === 0 ? this.bars[index] = ref : null}
            key={index}
            x={(spacing * index)}
            width={size}
            y={100}
            height={0}
            fill='red'
          />
        ))}
      </Svg>
    )
  }
}
