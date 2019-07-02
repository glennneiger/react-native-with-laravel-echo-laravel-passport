import React, {
  Component
} from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Facebook } from 'expo';

class FacebookLogin extends Component {

  state = {
    appId: '203450737231009',
    returnText: 'NULL'
  };

  async componentDidMount() {
    this.logIn();
  }

  async logIn() {
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync(this.state.appId, {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        this.setState({returnText: `Logged in!, Hi ${(await response.json()).name}!`});
        console.log('Token:', token);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  render() {
    const { navigate } = this.props.navigation;

    return ( 
      <View style = { styles.container } >
        <Text>Facebook login page</Text>
        <Text>{this.state.returnText}</Text>
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

export default FacebookLogin;
