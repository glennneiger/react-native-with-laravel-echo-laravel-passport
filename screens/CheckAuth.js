import React, {
  Component
} from 'react';
import {
  Button,
  TextInput,
  StyleSheet,
  View,
  Text,
  Clipboard
} from 'react-native';

import axios from 'axios';

class CheckAuth extends Component {
  state = {
    access_token: null,
    host: '192.168.1.13'
  };

  async componentDidMount() {
    var access_token = await Clipboard.getString();
    this.setState({access_token});
  }

  authenticate() {
    axios.get(`http://${this.state.host}:8000/api/data`, {
      headers: {
        'Authorization': 'Bearer ' + this.state.access_token
        }
      })
      .then(function (response) {
        console.log(response.data);
        if (response.data.status == 'OK') alert('You are logged in');
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
        alert('Authentication error');
      });
  }

  getCsrf() {
    axios.get(`http://${this.state.host}:8000/csrf`)
      .then(function (response) {
        console.log(response.data);
        alert('Fetched CSRF');
      })
      .catch(function (error) {
        console.log(JSON.stringify(error));
        alert('Error fetching CSRF!');
      });
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <Text>First check if the login Authentication works,</Text>
        <Text > then check the socket.</Text>
        <View>
          <Button onPress={() => this.authenticate()}
            title="Check Auth"
            color="grey"
          />
          <TextInput style={{ height: 40 }}
            placeholder="Type here Bearer Token"
            onChangeText={(access_token) => this.setState({ access_token })}
            value={ this.state.access_token }
          />
          <Button onPress={() => navigate('CheckSocket')}
            title="Check Socket"
            color="#74BF9B" 
          />
          <Button onPress={() => this.getCsrf()}
            title="Check CSRF"
            color="#67C492" 
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

export default CheckAuth;