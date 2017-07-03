import React, {Component, PropTypes} from 'react'

import {
  random,
} from 'lodash'

import Svg, {
  Path,
  Circle,
} from 'react-native-svg'

import {
  Animated,
} from 'react-native'

export default class PicklesLine extends Component {
  static propTypes = {
    animation: PropTypes.oneOf(['spring', 'timing']),
    height: PropTypes.number,
    values: PropTypes.array,
    width: PropTypes.number,
  }

  static defaultProps = {
    animation: 'timing',
  }

  constructor(props) {
    super(props)

    this.lines = {}

    this.multi = Array.isArray(props.values[0])

    this.state = {
      values: this.multi
      ? props.values.map(arr => arr.map(() => new Animated.Value(0)))
      : props.values.map(() => new Animated.Value(0))
    }

    const observed = this.multi ? this.state.values[0][0] : this.state.values[0]

    observed.addListener(point => {
      this.multi
      ? Object.entries(this.lines).forEach(this.updateLine)
      : this.updateLine([null, this.refs.line])
    })
  }

  componentWillReceiveProps(props) {
    const {values: next, animation} = props
    const {values: prev} = this.props

    if (this.multi) {
      next.forEach((arr, i) => {
        arr.forEach((toValue, j) => {
          if (toValue !== prev[i][j])
            Animated[animation](this.state.values[i][j], {toValue}).start()
        })
      })
    } else {
      next.forEach((toValue, index) => {
        if (toValue !== prev[index])
          Animated[animation](this.state.values[index], {toValue}).start()
      })
    }
  }

  updateLine = ([index, line]) => {
    line.setNativeProps({
      d: this.generatePath(index)
    })
  }

  generatePath = (index) => {
    const {values} = this.state
    const data = index || index === 0 ? values[index] : values
    const spacing = 100 / (data.length - 1)
    return data.reduce((memo, point, i) => (
      `${memo} ${i === 0 ? 'M' : 'L'} ${spacing * i} ${100 - point._value}`
    ), '')
  }

  render() {
    const {height, width, values} = this.props

    return (
      <Svg height={height} width={width} viewBox="0 0 100 100" style={{borderWidth: 1, borderColor: 'black'}}>
        {this.multi
          ? values.map((_, index) => (
            <Path
              ref={ref => index || index === 0 ? this.lines[index] = ref : null}
              key={index}
              d="M0 100"
              stroke="black"
              fill="none"
            />
          ))
          : (
            <Path
              ref='line'
              d="M0 100"
              stroke="black"
              fill="none"
            />
          )}
      </Svg>
    )
  }
}
