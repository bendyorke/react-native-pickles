import React, {Component, PropTypes} from 'react'
import * as util from './util'

import {
  Path,
} from 'react-native-svg'

import {
  Animated,
} from 'react-native'

export default class PicklesRadar extends Component {
  static contextTypes = {
    picklesPlane: PropTypes.object,
  }

  static propTypes = {
    animation: PropTypes.string,
    delay: PropTypes.number,
    values: PropTypes.array,
    max: PropTypes.number,
    rotate: PropTypes.number, // in degrees
    counterClockwise: PropTypes.bool,
  }

  static defaultProps = {
    rotate: 0,
    animation: 'timing',
  }

  constructor(props, context) {
    super(props, context)

    this.plane = context.picklesPlane

    this.state = {
      values: props.values.map(() => new Animated.Value(0)),
    }

    this.tracker = new Animated.Value(0)

    this.tracker.addListener(this.updatePath)
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

  updatePath = () => {
    const {values} = this.state
    const {width, height} = this.plane

    const d = util.generatePoints(values, {
      width: width || 0,
      height: height || 0,
      max: this.props.max,
      rotate: this.props.rotate,
      counterClockwise: this.props.counterClockwise,
    })

    this.refs.path.setNativeProps({d})
  }


  render() {
    const {values} = this.state
    const {max, rotate, counterClockwise, ...props} = this.props
    const {width, height} = this.plane
    return (
      <Path
        ref='path'
        d={util.generatePoints(values, {width, height, max, rotate, counterClockwise})}
        {...props}
      />
    )
  }
}
