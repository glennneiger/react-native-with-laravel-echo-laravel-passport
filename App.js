import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { createStackNavigator, createAppContainer } from "react-navigation";

import LoginScreen from './screens/Login';
import TestPusher from './screens/CheckAuth';
import CheckSocket from './screens/CheckSocket';

class AppScreen extends Component {
  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={ styles.container }>
        <View>
          <Text>This is the Pusher test app.</Text>
        </View>
        <View>
          <Button
            onPress={ () => navigate('Login') }
            title="Go test the pusher action!"
            color="#841587"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const RootStack = createStackNavigator(
  {
    Login: LoginScreen,
    App: AppScreen,
    Test: TestPusher,
    CheckSocket: CheckSocket,
  },
  {
    initialRouteName: 'App',
  }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends Component {
  render() {
    return <AppContainer />;
  }
}
