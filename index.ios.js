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
import * as Pickles from './src'

const LINES = 7
const POINTS = 5
const COLORS = [
  '#557E8A',
  '#38AB9F',
  '#F96040',
  '#FAB737',
  '#4998E6',
  '#418256',
  '#7986E7']

const randomValues = (length = POINTS) => times(length, () => random(100))

export default class pickles extends Component {
  state = {
    values: randomValues(),
    multi: times(LINES, () => randomValues()),
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        values: randomValues(),
        multi: times(LINES, () => randomValues()),
      })
    }, 1000)
  }

  render() {
    const props = {
      static: true,
      values: this.state.values,
      animation: 'timing',
      width: 200,
      height: 200,
      datumProps: ({graph}, i) => {
        if (graph === 'donut')
          return {stroke: COLORS[i]}
        if (graph === 'bar')
          return {fill: COLORS[i]}
      },
    }

    return (
      <View style={styles.container}>
        <Pickles.Graph height={200} width={200} values={this.state.values}>
          {/* <Pickles.Line values={this.state.values} /> */}
          <Pickles.Bar   {...props} values={this.state.values} />
          <Pickles.Donut {...props} values={this.state.values} />
          <Pickles.Radar values={this.state.values} fill={COLORS[6]}/>
          <Pickles.Axis count={5} format={n => n + 1}/>
          <Pickles.Axis vertical count={3} format={n => Math.floor(n)}/>
        </Pickles.Graph>
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
