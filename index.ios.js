/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {random, times} from 'lodash'
import * as Pickles from './index.js'

const LINES = 25
const POINTS = 5
const COLORS = ['red', 'green', 'blue', 'purple', 'orange']

const randomValues = (length = POINTS) => times(length, () => random(100))

export default class pickles extends Component {
  state = {
    values: randomValues(),
    multi: times(LINES, () => randomValues()),
  }

  componentDidMount() {
    setInterval(() => this.setState({
      values: randomValues(),
      multi: times(LINES, () => randomValues()),
    }), 2000)
  }

  render() {
    const props = {
      values: this.state.values,
      height: 200,
      width: 200,
      animation: 'spring',
    }

    return (
      <View style={styles.container}>
        <Pickles.Line {...props} values={this.state.multi} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('pickles', () => pickles);
