import React, {Component, PropTypes} from 'react'
import {sum} from 'lodash'
import * as styles from './Donut.css'

import Svg, {
  Circle,
} from 'react-native-svg'

import {
  Animated,
  View,
} from 'react-native'

const TWO_PI = 2 * Math.PI
const CIRCUM = 100
const RADIUS = CIRCUM / TWO_PI

export default class Donut extends Component {
  static propTypes = {
    animation: PropTypes.oneOf(['spring', 'timing']),
    height: PropTypes.number,
    radius: PropTypes.number, // Percent of standard radius, 0-100
    renderBackground: PropTypes.func,
    renderForeground: PropTypes.func,
    start: PropTypes.number,  // Percent clockwise around donut, starting from stop, 0-100
    strokeWidth: PropTypes.number,
    total: PropTypes.number,
    values: PropTypes.array.isRequired,
    width: PropTypes.number,
  }

  static defaultProps = {
    animation: 'timing',
    radius: 100,
    renderBackground: C => <C />,
    renderForeground: (C, i) => <C key={i} />,
    start: 0,
    strokeWidth: 10,
  }

  constructor(props) {
    super(props)

    this.circles = {}

    this.state = {
      height: 0,
      width: 0,
      needsLayout: true,
      values: props.values.map(() => new Animated.Value(0)),
      segments: this.calculateSegments(),
      _segments: this.calculateSegments(),
    }

    this.state.values[0].addListener(point => {
      this.setState({
        segments: this.calculateSegments(this.state.values.map(x => x._value)),
      })
      Object.values(this.circles).forEach(this.updateCircle)
    })
  }

  componentWillReceiveProps(props) {
    const {values: next, animation} = props
    const {values: prev} = this.props

    next.forEach((toValue, index) => {
      if (toValue !== prev[index])
        Animated[animation](this.state.values[index], {toValue}).start()
    })
  }

  updateCircle = (circle, index) => {
    const {segments} = this.state
    const {start: from, end: to} = segments[index]
    const {start, strokeWidth, radius: radiusAdjustment} = this.props
    const radius = RADIUS * (radiusAdjustment / 100)
    const circum = TWO_PI * radius
    const length = (to - from) * circum
    const offset = (circum / 4) - (from * circum) - (start * circum)

    circle.setNativeProps({
      strokeDashoffset: offset,
      strokeDasharray: [length, circum - length],
    })
  }

  calculateSegments = (values = this.props.values) => {
    const {total: _total} = this.props
    const total = _total || sum(values)
    let start = 0

    return values.map(value => {
      const percent = value / total
      const segment = {start, end: start + percent}
      start += percent
      return segment
    })
  }

  handleLayout = e => {
    this.setState({
      height: this.props.height || e.nativeEvent.layout.height,
      width:  this.props.width  || e.nativeEvent.layout.width,
      needsLayout: false,
    })
  }

  render() {
    const {renderBackground, renderForeground} = this.props
    const {height, width, needsLayout, _segments} = this.state

    if (needsLayout)
      return <View onLayout={this.handleLayout} />

    return (
      <View style={[styles.container, {height, width}]}>
        {this.props.children &&
          <View style={styles.children}>
            {this.props.children}
          </View>
        }
        <Svg
          height={height}
          width={width}
          viewBox='0 0 42 42'
          preserveAspectRatio='xMidyMid meet'
        >
          {/* Background */}
          {renderBackground(this.createCircle(0, 1))}

          {/* Foreground elements */}
          {_segments.map(({start, end}, i) => (
            renderForeground(this.createCircle(start, end, i), i)
          ))}
        </Svg>
      </View>
    )
  }

  /**
   * renderCircle takes a start and stop percent (between 0 and 1)
   * and returns a functional stateless component.  This is then passed
   * to renderForeground/renderBackground and can be used to render a
   * segment
   */
  createCircle = (from, to, index) => {
    const {start, strokeWidth, radius: radiusAdjustment} = this.props
    const radius = RADIUS * (radiusAdjustment / 100)
    const circum = TWO_PI * radius
    const length = (to - from) * circum
    const offset = (circum / 4) - (from * circum) - (start * circum)

    const CircleFn = props => (
      <Circle
        ref={ref => index || index === 0 ? this.circles[index] = ref : null}
        key={index}
        cx={21}
        cy={21}
        r={radius}
        fill='none'
        stroke='#ccc'
        strokeWidth={strokeWidth}
        strokeDashoffset={offset}
        strokeDasharray={[length, circum - length]}
        {...props}
      />
    )

    CircleFn.start  = offset
    CircleFn.stop   = offset + length
    CircleFn.length = length
    CircleFn.circumference = circum

    return CircleFn

  }
}
