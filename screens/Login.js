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
    email: '8933396',
    password: 'password',
    host: 'ride.sr',
    access_token: null,
    user_type: null
  };

  async componentDidMount() {
    var access_token = await Clipboard.getString();
    this.setState({access_token});
  }

  login = () => {
    const that = this;

    axios.post(`http://${this.state.host}/oauth/token`, {
        grant_type: 'password',
        client_id: '1',
        // client_id: '3',
        // client_secret: 'dC7EkHJSMNVjeOoZANzyGvpAEnwAGXaDYHwTbZXh',
        client_secret: 'mCs46si2yA6lrPzEZPMAj1Lvyss9XHBF6todAJtU',
        username: this.state.email,
        password: this.state.password,
      })
      .then(function (response) {
        const { access_token, user_type } = response.data;
        
        Clipboard.setString(access_token); // Copy token to device clipboard
        that.setState({ user_type }); // Update user_type
        
        console.log('Access token: ', access_token);
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
    var interval = setInterval(() => {
      switch (this.state.user_type) {
        case 'passenger':
          clearInterval(interval);
          navigate('Passenger');
          break;

        case 'rider':
          clearInterval(interval);
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