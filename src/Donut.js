import React, {Component, PropTypes} from 'react'
import {isFunction, sum} from 'lodash'
import * as styles from './Donut.css'
import * as util from './util'

import Svg, {
  G,
  Circle,
} from 'react-native-svg'

import {
  Animated,
  View,
} from 'react-native'

const TWO_PI = 2 * Math.PI
const CIRCUM = 100
const RADIUS = CIRCUM / TWO_PI

class DonutSegment extends Component {
  shouldComponentUpdate(props) {
    if (
      props.from !== this.props.from ||
      props.to !== this.props.to ||
      props.index !== this.props.index
    ) {
      return true
    } else {
      return false
    }
  }

  register = ref => {
    const {registry, index} = this.props
    registry && (index || index === 0)
      ? registry[index] = ref
      : null
  }

  render() {
    const {start, strokeWidth, radius, center, from, to, index, datumProps} = this.props
    const dashProps = util.generateDash({
      strokeWidth,
      radius,
      start,
      from,
      to,
    })

    const props = isFunction(datumProps)
      ? datumProps({from, to, graph: 'donut'}, index)
      : datumProps || {}

    return (
      <Circle
        ref={this.register}
        key={index}
        cx={center.x}
        cy={center.y}
        r={radius}
        fill='none'
        stroke='#ccc'
        strokeWidth={strokeWidth}
        {...dashProps}
        {...props}
      />
    )
  }
}

export default class Donut extends Component {
  static contextTypes = {
    picklesPlane: PropTypes.object,
  }

  static propTypes = {
    animation: PropTypes.oneOf(['spring', 'timing']),
    height: PropTypes.number,
    radius: PropTypes.number, // Percent of max radius, 0-100
    static: PropTypes.bool,
    start: PropTypes.number,  // Percent clockwise around donut, starting from stop, 0-100
    strokeWidth: PropTypes.number,
    total: PropTypes.number,
    values: PropTypes.array.isRequired,
    width: PropTypes.number,
  }

  static defaultProps = {
    animation: 'timing',
    radius: 100,
    start: 0,
    strokeWidth: 10,
    radius: 95,
  }

  constructor(props, context) {
    super(props)
    const segments = util.calculateArcSegments(props.values, props)

    this.plane = context.picklesPlane
    this.circles = {}

    this.state = {
      values: props.values.map(() => new Animated.Value(0)),
      segments,
      _segments: segments,
      center: this.plane.center,
      radius: (this.plane.radius - ((props.strokeWidth || 0)/2)) * (props.radius / 100),
    }

    this.tracker = new Animated.Value(0)

    this.tracker.addListener(() => {
      this.setState({
        segments: util.calculateArcSegments(
          this.state.values.map(x => x._value),
          this.props,
        ),
      })
      Object.values(this.circles).forEach(this.updateCircle)
    })
  }

  componentDidMount() {
    const {values: next, animation, delay} = this.props
    const {values} = this.state
    const prev = values.map(v => v._value)
    const animate = Animated[animation]

    /** Initial animation needs work
    setTimeout(() => {
      const anims = util.collectAnimations(prev, next, {
        animate,
        values,
        tracker: this.tracker,
      })

      if (anims.length > 1)
        Animated.parallel(anims).start()
    }, delay)
    **/
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

  updateCircle = (circle, index) => {
    const {segments, radius} = this.state
    const {start, strokeWidth} = this.props
    const {from, to} = segments[index]

    const dashProps = util.generateDash({
      strokeWidth,
      radius,
      start,
      from,
      to,
    })

    circle.setNativeProps(dashProps)
  }

  render() {
    const {backgroundProps} = this.props
    const {_segments, radius, center} = this.state

    return (
      <G>
        {/* Background */}
        {backgroundProps && (
          <DonutSegment
            from={0}
            to={1}
            {...backgroundProps}
            radius={radius}
            center={center}
          />
        )}

        {/* Foreground elements */}
        {_segments.map(({from, to}, index) => (
          <DonutSegment
            key={index}
            registry={this.circles}
            from={from}
            to={to}
            index={index}
            {...this.props}
            radius={radius}
            center={center}
          />
        ))}
      </G>
    )
  }
}
