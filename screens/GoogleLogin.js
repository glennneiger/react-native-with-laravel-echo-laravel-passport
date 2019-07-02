import React, {
  Component
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button
} from 'react-native';
import Expo from 'expo';

class GoogleLogin extends Component {
  state = {
    androidClientId: '18078930342-vjkpla7k4mlainq0i5sjjvlaf7rbbijc.apps.googleusercontent.com',
    iosClientId: null
  };

  async componentDidMount() {
    // this.signInWithGoogleAsync();
  }

  signInWithGoogleAsync = async () => {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId: '18078930342-vjkpla7k4mlainq0i5sjjvlaf7rbbijc.apps.googleusercontent.com',
        // iosClientId: this.state.iosClientId,
        scopes: ['profile', 'email'],
      });
  
      if (result.type === 'success') {
        console.log('AccessToken', result.accessToken);
        return result.accessToken;
      } else {
        console.log('Login cancelled.');
        // return { cancelled: true };
      }
    } catch (e) {
      console.log('Google Error', e);
      // return { error: true };
    }
  }

  render() {
    const { navigate } = this.props.navigation;

    return ( 
      <View style = { styles.container } >
        <Text>Google login page</Text>
        <Button onPress={this.signInWithGoogleAsync}
          title="Login"
          color="blue"
          accessibilityLabel="Learn more about this purple button"
        />
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

export default GoogleLogin;
