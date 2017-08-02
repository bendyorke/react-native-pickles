import {sum, get, each, reduce, isArray, isNaN} from 'lodash'
import extractPolygon from 'react-native-svg/lib/extract/extractPolyPoints'

const PI_OVER_180 = 0.01745329252
const TWO_PI = 2 * Math.PI

/**
 * Default 'shouldComponentUpdate' function.  The goal here is to
 * short any potential update-checks to keep the JS thread animating.
 */
export const shouldComponentUpdate = ({props, state}, props2, state2) => {
  if (props2.static && props2.values.length === props.values.length) {
    if (state2.values.length !== state.values.length) return true
    return false
  } else {
    return true
  }
}

/**
 * Loop through new values and see if they differ from the previous values.
 * Collect the differences in terms of animations.
 */
export const collectAnimations = (prev, next, {animate, values, tracker}) => {
  return reduce(next, function(memo, toValue, i) {
    if (toValue !== prev[i]) {
      memo.push(animate(values[i], {toValue}))
    }

    return memo
  }, [animate(tracker, {toValue: tracker._value + 1})])
}

/**
 * Generate Line
 */
export const generatePath = (points, {scale, curve: _curve, width, height}) => {
  const spacing = width / (points.length - 1)
  const curve = _curve === 'auto' ? spacing / 2 : _curve
  let prev = {}

  return reduce(points, function(memo, point, i) {
    let x = spacing * i
    let y = height - (point._value * scale)

    if (isNaN(y)) {
      // If y is NaN, skip this point
      return memo
    } else if (!memo.length) {
      // First point should only move the cursor
      memo = `M ${x || 0},${y}`
    // If there is truthy curve, do the math required
    } else if (curve) {
      memo = `
        ${memo}
        C
        ${prev.x + curve},${prev.y || y}
        ${x - curve},${y}
        ${x},${y}
      `
    // Create a straight line
    } else {
      memo = `
        ${memo}
        L
        ${x},${y}
      `
    }

    prev = {x, y}

    return memo
  }, '')
}

export const viewBox = ({width, height}) => {
  return `0 0 ${width} ${height}`
}

export const generatePoints = (values, {width, height, max, rotate, counterClockwise}) => {
  const xMid = width / 2
  const yMid = height / 2
  const angle = (2 * Math.PI) / values.length
  const angleOffset = (rotate + 180) * PI_OVER_180
  const angleDirection = counterClockwise ? 1 : -1
  const realMax = max || Math.max(...values.map(x => x._value).concat(1))
  const scale = (yMid / realMax) * 0.9

  const points = values.reduce((memo, {_value: value}, index) => {
    const rotation = ((angle * index * angleDirection) + angleOffset) % (2 * Math.PI)
    const x = xMid + (Math.sin(rotation) * value * scale)
    const y = yMid + (Math.cos(rotation) * value * scale)

    return `${memo} ${x},${y}`
  }, '')

  return `M${extractPolygon(points)}z`
}

export const calculateArcSegments = (values, {total: forcedTotal}) => {
  const total = forcedTotal || sum(values)
  let start = 0

  return values.map(value => {
    const percent = (value / total)// + 0.01
    const segment = {from: start, to: start + percent}
    start += percent
    return segment
  })
}

export const generateDash = ({from, to, radius, start, strokeWidth}) => {
  const circum = TWO_PI * radius
  const length = (to - from) * circum
  const offset = (circum / 4) - (from * circum) - (start * circum)

  return {
    strokeDashoffset: offset,
    strokeDasharray: [length, circum - length],
  }
}
