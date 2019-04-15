import React, {
  Component
} from 'react';
import {
  Button,
  StyleSheet,
  View,
  TextInput,
  Clipboard
} from 'react-native';
import axios from 'axios';

class Login extends Component {

  state = {
    email: '8987273',
    password: 'timmy1420',
    host: '192.168.1.13',
    access_token: null,
    user_type: null
  };

  async componentDidMount() {
    var access_token = await Clipboard.getString();
    this.setState({access_token});
  }

  login = () => {
    const that = this;

    axios.post(`http://${this.state.host}:8000/oauth/token`, {
        grant_type: 'password',
        client_id: '3',
        client_secret: 'dC7EkHJSMNVjeOoZANzyGvpAEnwAGXaDYHwTbZXh',
        username: this.state.email,
        password: this.state.password,
      })
      .then(function (response) {
        const {
          access_token,
          user_type
        } = response.data;
        // Copy token to device clipboard
        Clipboard.setString(access_token);

        // Update user_type
        that.setState({ user_type });
        
        console.log('Access token: ', access_token);
        alert('Access token copied to clipboard!');
      })
      .catch(function (error) {
        console.log(error);
        alert('Problem occured while loggin in.')
      });
  }

  tripModule() {
    this.login(); // First, login to get user type
    const { navigate } = this.props.navigation;

    console.log(this.state.user_type);

    // Navigate to user screen determined by the user_type
    setInterval(() => {
      switch (this.state.user_type) {
        case 'passenger':
          navigate('Passenger');
          break;

        case 'rider':
          navigate('Rider');
          break;
      
        default:
          // alert('User type not defined');
          break;
      }
    }, 1000);
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
          <Button onPress={() => this.tripModule() }
            title='Simulate trip'
            color="#74BF9B" 
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