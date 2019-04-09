import React, {
  Component
} from 'react';
import {
  Button,
  TextInput,
  StyleSheet,
  View,
  Text
} from 'react-native';

import axios from 'axios';

class CheckAuth extends Component {
  state = {
    access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjZkYjJjMDcyODQyZmE0NTg1MGE3ODNjZTU2ZjBjMGJjZjAwNmQzOTRiYzY3Y2MwNGUwMTIwN2JmZWMzYTJkYWEzNTc4Yzk2NTRhMjBkYTA0In0.eyJhdWQiOiI2IiwianRpIjoiNmRiMmMwNzI4NDJmYTQ1ODUwYTc4M2NlNTZmMGMwYmNmMDA2ZDM5NGJjNjdjYzA0ZTAxMjA3YmZlYzNhMmRhYTM1NzhjOTY1NGEyMGRhMDQiLCJpYXQiOjE1NTQ2NTQxNjcsIm5iZiI6MTU1NDY1NDE2NywiZXhwIjoxNTg2Mjc2NTY3LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.He-rveIH8w5VJpFASwHhd8h5qNJa6iJEYtjY4Z-ecCRcF4s54VW1XhY_nAXwXzTOPmM_wJXAAjS7xfDHrsByN1trd96f3v2GTOKBUF57tDk-dMmeKKspsER1DT0sD7BKqELbPu7CACq9EUf8E8t-xCHnWrg8KfgkVB7fihfw8rJeeQxLN-ON6gJn5jXQxaufVSqdP1aM8omuqOA51ZfNd_mIGjPsHrlB566DRbAfYIo1IB5rODkJndOAe2O09-Y1hrmi26TJyrIG1S-BNuO3irxqP35GGXmTX1_BwlDv_EuPfBZtbnP4Ew4k1OYgQu5kccOLl46dmvCCWdDXse54TlAm2sosFa-RxCxP9g-oZ1Unqm2VsOcSauOu-JvqnLKObQdz0mqTWFmbX9X-EhPr3RoH0eCSTMabwV-0jn9BtYMZZxsqj3nnS-C9Poebtx-oCCMq5ObG_lFK-ZbRxMrbUBHyvFYs-LAzjsFEUz-1eJPDoA24aFRN-GQE-k4FewMMHJG4OFNbKsPuD-R076lPNjRb-C13GxROW4srl7x71O6MtwDTDJzyZoD20ABNZRIa8azjAw1MESUj7DDmH3KOfuki8ROVHi3gPu-3MTk5sztIOyaIa5OeLY1zhWmc85UjZa-y-_bnSTB7xoelyODxJPAwCi8l-ZcnnMcdPUVuSYQ',
    host: '192.168.0.138'
  };

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