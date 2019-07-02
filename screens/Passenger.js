import React, {
    Component
} from 'react';
import {
    StyleSheet,
    View,
    Button,
    TextInput,
    Clipboard,
    Text,
    ToastAndroid
} from 'react-native';
import { Permissions, Notifications } from 'expo';

import Echo from 'laravel-echo/dist/echo';
import Socketio from 'socket.io-client/dist/socket.io';

import axios from 'axios';

class Passenger extends Component {
    constructor(props) {
        super(props);

        this.state = {
            access_token: null,
            csrf: null,
            host: '10.1.1.72',
            user_id: null,
            channel: null,
            readyText: 'Not ready',
            trip_id: null,
            notification: {}
        };

        this.echo = null;
    }

    componentWillUnmount() {
        this.leave();
    }

    async componentDidMount() {
        var access_token = await Clipboard.getString();
        this.setState({access_token});

        this.fetchUserId();
        this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    _handleNotification = (notification) => {
        this.setState({ notification });
        console.log('Notification data: ', notification);
    };

    fetchUserId() {
        // Refer this class with `that` variable xD
        const that = this;

        axios.get(`http://${this.state.host}:8000/api/initial`, {
          headers: {
            'Authorization': 'Bearer ' + this.state.access_token
            }
          })
          .then(function (response) {
            console.log(response.data);
              
            const { id } = response.data;
            // const { id } = data;

            // Update channel with passenger.id
            that.setState({ channel: 'passenger.' + id.toString() });
            that.setState({ user_id: id });

            // Update readyText
            that.setState({ readyText: 'Ready to go...' });
          })
          .catch(function (error) {
            console.log(JSON.stringify(error));
            alert('Authentication error');
          });
    }

    join() {
        // Refer this class with `that` variable xD
        const that = this;

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
                console.log('Passenger: Users here: ', users);
            })
            .joining((user) => {
                console.log('Passenger: User joining: ', user);
            })
            .leaving((user) => {
                console.log('Passenger: User leaving: ', user);
            })
            .listen('MessagePassenger', event => {
                console.log('Passenger: MessagePassenger: ', event);
                const { status, trip_id, name, message, image, user_type } = event;

                switch(status) {
                    case 'on_the_way':
                        alert('Rider onderweg');
                        that.setState({ trip_id });
                        break;
                    case 'delayed': 
                        if (user_type == 'rider')
                            ToastAndroid.show('Rider vertraagd', ToastAndroid.SHORT);
                        break;
                    case 'canceled': 
                        if (user_type == 'rider')
                            ToastAndroid.show('Rider heeft geannulleerd', ToastAndroid.SHORT);
                        this.leaveAll();
                        break;
                    case 'rate': 
                        if (user_type == 'rider')
                            ToastAndroid.show('Rider rated', ToastAndroid.SHORT);
                        break;
                    case 'arrived_at_pickup': 
                        if (user_type == 'rider')
                            ToastAndroid.show('Rider aangekomen op pickup location', ToastAndroid.SHORT);
                        break;
                    case 'trip_start': 
                        if (user_type == 'rider')
                            ToastAndroid.show('Rider heeft de trip gestart', ToastAndroid.SHORT);
                        break;
                    case 'arrived_at_destination': 
                        if (user_type == 'rider')
                            ToastAndroid.show('Rider aangekomen op bestemming location', ToastAndroid.SHORT);
                        break;
                }
            })
            .listenForWhisper('geo_update', (response) => {
                console.log('Passenger: Rider location update: ', JSON.stringify(response));
                ToastAndroid.show('Rider location update', ToastAndroid.SHORT);
            });
    }

    // whisper() {
    //     if(this.echo != null) {
    //         this.echo.join(this.state.channel)
    //         .whisper('typing', 'I whispered man!');
    //         alert('Whiser sent.');
    //     } else {
    //         alert('Please register websocket!');
    //     }
    // }

    _1tripRequest() {
        axios.post(`http://${this.state.host}:8000/api/trip_requests/register`, {
            lat_long_pickup: '5.8258842,-55.1955983',
            lat_long_destination: '5.8242192,-55.188131',
            pickup_description: 'Ik heb wit aan.',
            price_range: '20-35',
            pickup_address: 'Ergens',
            destination_address: 'Ergens',
            distance: '105',
            duration: '25',
    	    // map_image: ''
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Passenger response.data: ', response.data);
        })
        .catch((error) => {
            console.log(JSON.stringify(error));
            alert('Problem occured.');
        });

        // After AJAX request, active websocket
        // Don't open an extra socket connection by re-calling this.join() if isn't null
        if( this.echo == null ) this.join();
        ToastAndroid.show('Waiting for rider to accept...', ToastAndroid.SHORT);
    }

    _5_1_2delayed() {
        axios.post(`http://${this.state.host}:8000/api/trip/delayed`, {
            trip_id: this.state.trip_id,
            reason: 'Some reason for delay from passenger'
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Passenger response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });
    }

    _5_1_2canelled() {
        axios.post(`http://${this.state.host}:8000/api/trip/cancel`, {
            trip_id: this.state.trip_id
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Passenger response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });

        this.leave(); // Leave passenger channel
    }

    _9_1rate() {
        axios.post(`http://${this.state.host}:8000/api/trip/rate`, {
            trip_id: this.state.trip_id,
            rating: 3,
            tip: 19
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Passenger response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });

        this.setState({ trip_id: null }); // Clear trip id
    }

    leave() {
        if(this.echo != null) {
            this.echo.leave(this.state.channel);
            this.echo = null;
            alert('I left');
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Passenger</Text>
                <Text>{ this.state.readyText }</Text>
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
                <Button onPress={ () => this._1tripRequest() }
                    title="1. Trip Request"
                    color="#263238"
                />
                <Button onPress={ () => this._5_1_2canelled() }
                    title="5.1.2 Cancel trip request"
                    color="#E76E6E"
                />
                <Button onPress={ () => this._5_1_2delayed() }
                    title="5.1.2 Passenger delayed"
                    color="#DEA569"
                />
                <Button onPress={ () => this._9_1rate() }
                    title="9.1 Rate rider"
                    color="#8EC781"
                />
                <Button onPress={ () => this.leave() }
                    title="Trip done"
                    color="#007CED"
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
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});

export default Passenger;
