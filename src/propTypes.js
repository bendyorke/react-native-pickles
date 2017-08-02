import {PropTypes as T} from 'react'

export const graphTypes = {
  values: T.array,
  height: T.oneOfType([T.string, T.number]),
  width: T.oneOfType([T.string, T.number]),
  color: T.oneOfType([T.string, T.array]),
  animation: T.oneOf(['spring', 'timing']),
  delay: T.number,
}

export const graphDefaults = {
  animation: 'timing',
  colors: '#111',
  delay: 200,
}

