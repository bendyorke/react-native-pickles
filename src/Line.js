import React, {Component, PropTypes} from 'react'
import {graphTypes, graphDefaults} from './propTypes'
import * as util from './util'

import {
  get,
  max,
} from 'lodash'

import {
  Path,
} from 'react-native-svg'

import {
  Animated,
} from 'react-native'

export default class PicklesLine extends Component {
  static contextTypes = {
    picklesPlane: PropTypes.object,
  }

  static propTypes = {
    ...graphTypes,
    values: PropTypes.array,
    borderRadius: PropTypes.number,
    weight: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
    max: PropTypes.number,
  }

  static defaultProps = {
    ...graphDefaults,
    borderRadius: 0,
    weight: 3,
    stroke: '#7a7a7a',
    fill: 'none',
  }

  constructor(props, context) {
    super(props, context)

    this.plane = context.picklesPlane

    this.state = {
      values: props.values.map(() => new Animated.Value(0)),
    }

    this.tracker = new Animated.Value(0)

    this.tracker.addListener(this.updateLine)

    this.scale = 90 / (props.max || max(props.values))
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
    const {height} = this.plane
    const animate = Animated[animation]
    const values = props.values.map((_, i) =>
        get(this.state.values, [i], new Animated.Value(0)))
    this.scale = (height * 0.9) / (props.max || max(props.values.concat([0])))

    this.setState({values}, () => {
      const anims = util.collectAnimations(prev, next, {
        animate,
        values: this.state.values,
        tracker: this.tracker,
      })

      if (anims.length > 1)
        Animated.parallel(anims).start()
    })
  }

  shouldComponentUpdate(props, state) {
    return util.shouldComponentUpdate(this, props, state)
  }

  updateLine = () => {
    const {values} = this.state
    const {borderRadius} = this.props
    const {width, height} = this.plane

    const d = util.generatePath(values, {
      scale: this.scale,
      curve: borderRadius,
      width: width || 0,
      height: height || 0,
    })

    if (d === undefined) {
      console.log('here!')
    }

    this.refs.path.setNativeProps({d})
  }

  render() {
    const {values, weight, ...props} = this.props

    return (
      <Path
        ref='path'
        fill="none"
        d="M 0 100 L 100 100"
        {...props}
      />
    )
  }
}
