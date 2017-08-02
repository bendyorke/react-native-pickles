import React, {Component, PropTypes} from 'react'
import * as util from './util'

import {
  random,
  isFunction,
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

    this.tracker = new Animated.Value(0)

    this.tracker.addListener(() => {
      Object.values(this.bars).forEach(this.updateBar)
    })
  }

  componentDidMount() {
    const {values: next, animation, delay} = this.props
    const {values} = this.state
    const prev = values.map(v => v._value)
    const animate = Animated[animation]

    setTimeout(() => {
      const anims = util.collectAnimations(prev, next, {
        animate,
        values,
        tracker: this.tracker,
      })

      if (anims.length > 1)
        Animated.parallel(anims).start()
    }, delay)
  }

  componentWillReceiveProps(props) {
    const {values: next, animation} = props
    const {values: prev} = this.props
    const animate = Animated[animation]
    const triggered = false

    const anims = util.collectAnimations(prev, next, {
      animate,
      values: this.state.values,
      tracker: this.tracker,
    })

    if (anims.length > 1)
      Animated.parallel(anims).start()
  }

  shouldComponentUpdate(props, state) {
    return util.shouldComponentUpdate(this, props, state)
  }


  updateBar = (bar, index) => {
    const {values} = this.state
    const value = values[index] && values[index]._value || 0
    const height = `${-value}`
    bar.setNativeProps({height})
  }

  getDatumProps = (datum, index) => {
    const {datumProps} = this.props

    return (
      isFunction(datumProps)
        ? datumProps(datum, index)
        : datumProps || {}
    )
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
            {...this.getDatumProps({
              size,
              spacing,
              x: spacing * index,
              graph: 'bar',
            }, index)}
          />
        ))}
      </Svg>
    )
  }
}
