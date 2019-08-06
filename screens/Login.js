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
import { Permissions, Notifications } from 'expo';

class Login extends Component {

  state = {
    email: '8987274',
    // email: '8933396',
    password: 'timmy1420',
    // password: 'password',
    host: '192.168.10.176:8000',
    access_token: null,
    user_type: null,
    expo_token: null
  };

  async componentDidMount() {
    var access_token = await Clipboard.getString();
    this.setState({access_token});

    this.registerForPushNotificationsAsync();
  }

  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      console.log('Push notification permission DENIED!');
      return;
    }

    // Get the token that uniquely identifies this device
    let expo_token = await Notifications.getExpoPushTokenAsync();
    console.log('Expo Token: ', expo_token);
    this.setState({expo_token});
  }

  login = () => {
    const that = this;

    axios.post(`http://${this.state.host}/oauth/login`, {
        grant_type: 'password',
        client_id: '3', // Local
        // client_id: '1',
        client_secret: 'rty', // Local
        // client_secret: 'mCs46si2yA6lrPzEZPMAj1Lvyss9XHBF6todAJtU', // Live
        username: this.state.email,
        password: this.state.password,
        expo_token: this.state.expo_token,
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
          <Button onPress={() => this.props.navigation.navigate('PushNotification') }
            title='Push Notification'
            color="#74BF9B" 
          />
          <Button onPress={() => this.props.navigation.navigate('FacebookPage') }
            title='Facebook Login'
            color="#AABFFF" 
          />
          <Button onPress={() => this.props.navigation.navigate('GooglePage') }
            title='Google Login'
            color="#FFBFAA" 
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
