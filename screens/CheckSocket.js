import React, {
    Component
} from 'react';
import {
    StyleSheet,
    View,
    Button,
    TextInput,
    Clipboard
} from 'react-native';

import Echo from 'laravel-echo/dist/echo';
import Socketio from 'socket.io-client/dist/socket.io';

import axios from 'axios';

class CheckAuth extends Component {
    constructor(props) {
        super(props);

        this.state = {
            access_token: null,
            // channel_id: '10',
            csrf: null,
            host: '192.168.1.13',
            user_id: null,
            // channel: 'allRiders.10'
            channel: 'passenger'
        };

        this.echo = null;
    }

    async componentDidMount() {
        var access_token = await Clipboard.getString();
        this.setState({access_token});

        this.fetchUserId();
    }

    fetchUserId() {
        // Refer this to CheckSocket class with `that` variable xD
        const that = this;

        axios.get(`http://${this.state.host}:8000/api/user`, {
          headers: {
            'Authorization': 'Bearer ' + this.state.access_token
            }
          })
          .then(function (response) {
            console.log(response.data);
            const { id } = response.data;
            that.setState({ user_id: id.toString() });
          })
          .catch(function (error) {
            console.log(JSON.stringify(error));
            alert('Authentication error');
          });

        // Update channel with passenger.id
        this.setState({ channel: this.state.channel + '.' + this.state.user_id });
    }

    join() {
        this.echo = new Echo({
            broadcaster: 'socket.io',
            host: `ws://${this.state.host}:6001`,
            client: Socketio,
            auth: {
                headers: {
                    Authorization: 'Bearer ' + this.state.access_token,
                    Accept: 'application/json',
                }
            }
        });

        this.echo.join(this.state.channel)
            .here((users) => {
                console.log('Users here: ', users);
            })
            .joining((user) => {
                console.log('User joining: ', user);
            })
            .leaving((user) => {
                console.log('User leaving: ', user);
            })
            .listen('MessageRiders', event => {
                console.log('MessageRiders: ', event);
            })
            .listenForWhisper('typing', (response) => {
                console.log('Client whispered: ', JSON.stringify(response));
            });
    }

    whisper() {
        if(this.echo != null) {
            this.echo.join(this.state.channel)
            .whisper('typing', 'I whispered man!');
            alert('Whiser sent.');
        } else {
            alert('Please register websocket!');
        }
    }

    messageRider() {
        axios.post(`http://${this.state.host}:8000/api/trip_requests`, {
            lat_long_pickup: '1.23223, -15.23423',
            lat_long_destination: '2.23223, -13.23423',
            pickup_description: 'Ik heb wit aan.',
            price_range: '20-35',
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured while loggin in.');
        });
    }

    leave() {
        this.echo.leave(this.state.channel);
        alert('I left');
    }

    render() {
        return (
            <View style={styles.container} >
                <TextInput style={{height: 40}}
                    placeholder="Channel name"
                    onChangeText={ (channel) => this.setState({channel}) }
                    value={ this.state.channel }
                />
                <TextInput style={{height: 40}}
                    placeholder="Type here Bearer Access Token"
                    onChangeText={ (access_token) => this.setState({access_token}) }
                    value={ this.state.access_token }
                />
                <Button onPress={ () => this.join() }
                    title="Join websocket"
                    color="#67C492"
                />
                <Button onPress={ () => this.whisper() }
                    title="Send whisper event"
                    color="#263238"
                />
                <Button onPress={ () => this.messageRider() }
                    title="Send Ajax"
                    color="#263238"
                />
                <Button onPress={ () => this.leave() }
                    title="Leave websocket"
                    color="#DFD561"
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

export default CheckAuth;