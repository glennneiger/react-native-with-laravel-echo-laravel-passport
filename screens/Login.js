import React, {
  Component
} from 'react';
import {
  Button,
  StyleSheet,
  View,
  TextInput
} from 'react-native';
import axios from 'axios';

class Login extends Component {

  state = {
    email: 'tim.poco01@gmail.com',
    password: 'timmy1420',
    host: '192.168.0.138'
  };

  login = () => {
    axios.post(`http://${this.state.host}:8000/oauth/token`, {
        grant_type: 'password',
        client_id: '6',
        client_secret: 'ObTXXOAgGXIWjwT9UCG5VIs0E0oxPnHY2SXR4U1Z',
        username: this.state.email,
        password: this.state.password,
      })
      .then(function (response) {
        const {
          access_token,
          token_type
        } = response.data;
        if (token_type == "Bearer") alert('You are successfully logged in');
        console.log('Access token: ', access_token);
      })
      .catch(function (error) {
        console.log(error);
        alert('Problem occured while loggin in.')
      });
  }

  render() {
    const { navigate } = this.props.navigation;

    return ( 
      <View style={styles.container}>
        <View>
        <Button onPress={ () => navigate('Test') }
          title="Test the socket!"
          color="grey"
          accessibilityLabel="Learn more about this purple button"
        />
        </View> 
        <View>
          <Button onPress={this.login}
            title="Login"
            color="blue"
            accessibilityLabel="Learn more about this purple button"
          />
          <TextInput style={{height: 40}}
                  placeholder="Email"
                  onChangeText={ (email) => this.setState({email}) }
                  value={ this.state.email }
          />
          <TextInput style={{height: 40}}
            placeholder="Password"
            onChangeText={ (password) => this.setState({password}) }
            value={ this.state.password }
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

export default Login;