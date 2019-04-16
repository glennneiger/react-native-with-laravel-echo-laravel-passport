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
    ToastAndroid,
    ScrollView
} from 'react-native';

import Echo from 'laravel-echo/dist/echo';
import Socketio from 'socket.io-client/dist/socket.io';

import axios from 'axios';

class Rider extends Component {
    mine = 'Yo';

    constructor(props) {
        super(props);

        this.state = {
            access_token: null,
            host: '192.168.1.13',
            user_id: null,
            channel: 'allRiders',
            passengerChannel: null, // Specific channel from a passenger
            readyText: 'Not ready',
            online: false,
            trip_id: null,
            trip_request_id: null,
            trip_started: false,
            interval: null, // Usefull for geo 5 second update,
            car_id: 1
        };

        this.echo = null;
    }

    async componentDidMount() {
        var access_token = await Clipboard.getString();
        this.setState({access_token});

        this.fetchUserId();
    }

    componentWillUnmount() {
        this.leave();
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
            const { id } = response.data;

            // Update channel with passenger.id
            that.setState({ channel: that.state.channel });

            // Update readyText
            that.setState({ readyText: 'Ready to go...' });
          })
          .catch(function (error) {
            console.log(JSON.stringify(error));
            alert('Authentication error');
          });
    }

    join(channel = this.state.channel) {
        // Refer this class with `that` variable :)
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

        this.echo.join(channel)
            .here((users) => {
                console.log('Rider: Users here: ', users);
            })
            .joining((user) => {
                console.log('Rider: User joining: ', user);
            })
            .leaving((user) => {
                console.log('Rider: User leaving: ', user);
            })
            .listen('MessageRiders', event => {
                console.log('Rider: MessageRiders: ', event);
                const { status, user_type, passenger_user_id, trip_request_id } = event;
                if(status == 'pickup' &&  user_type == 'passenger') {
                    alert('Trip aanvraag');
                    // that.leave(); // Leave riders channel
                    that.setState({ passengerChannel: 'passenger.' + passenger_user_id });
                    that.setState({ trip_request_id });
                    // that.join(that.state.passengerChannel); // Then join the passenger channel
                }
            })
            .listen('MessagePassengers', event => {
                console.log('Rider: MessagePassengers: ', event);
            })
            .listenForWhisper('geo_update', (response) => {
                console.log('Rider: Passenger location update: ', JSON.stringify(response));
            });
    }

    whisper(channel = null, event = null, data = null) {
        if(this.echo != null && channel != null && data != null && event != null ) {
            this.echo.join(channel)
                .whisper(event, data);
            alert('Whisper sent!');
        } else {
            alert('Please register websocket!');
        }
    }

    leave(channel = this.state.channel) {
        this.echo.leave(channel);
        this.echo = null;
        this.setState({ online: false }); // Toggle online state
        alert('I left');
    }

    onlineToggle() {
        switch(this.state.online) {
            case true:
                this.leave();
                break;

            case false:
                this.join();
                break;

            default:
                this.leave();
        }
        this.setState({ online: !this.state.online }); // Toggle online state
    }

    locationUpdate() {
        const data = 'My location [bsdkjhfbk,sdfdsdgf]';
        this.whisper(this.state.passengerChannel, 'geo_update', data);
    }

    disableLocationUpdate() {
        if( this.state.interval != null ) clearInterval(this.state.interval);
        this.setState({ interval: null });
    }

    _3A_accept() {
        if(this.state.trip_request_id == null) return false;

        // Refer this class with `that` variable :)
        const that = this;

        axios.post(`http://${this.state.host}:8000/api/trip/accept`, {
            trip_request_id: that.state.trip_request_id,
            car_id: that.state.car_id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
            const { trip_id } = response.data;
            that.setState({ trip_id });
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured while loggin in.');
        });

        this.leave(); // Leave rider channel

        // After AJAX request, activate passenger channel
        this.join(this.state.passengerChannel);

        // Start interval, Send location update every 5 seconds
        // var interval = setInterval(this.locationUpdate, 5000);
        // this.setState({ interval });

        // Clear interval
        // this.clearInterval(this.state.interval);
    }

    _5_1_1delayed() {
        axios.post(`http://${this.state.host}:8000/api/trip/delayed`, {
            trip_id: this.state.trip_id
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });
    }

    _5_1_1cancelled() {
        axios.post(`http://${this.state.host}:8000/api/trip/cancel`, {
            trip_id: this.state.trip_id
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });

        // this.disableLocationUpdate(); // Clear interval
        this.leave(this.state.passengerChannel); // Leave passenger channel
        this.setState({ trip_id: null }); // Clear trip id
        this.setState({ trip_request_id: null }); // Clear trip id
        if(this.state.online == true) this.join(); // Re-Join the riders channel
    }

    _6A_arrived() {
        axios.post(`http://${this.state.host}:8000/api/trip/pickupArrived`, {
            trip_id: this.state.trip_id
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });
    }

    _7_start() {
        axios.post(`http://${this.state.host}:8000/api/trip/start`, {
            trip_id: this.state.trip_id
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });
    }

    _8arrived() {
        this.disableLocationUpdate(); // Clear interval

        axios.post(`http://${this.state.host}:8000/api/trip/destinationArrived`, {
            trip_id: this.state.trip_id
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });
    }

    _9_1rate() {
        axios.post(`http://${this.state.host}:8000/api/trip/rate`, {
            trip_id: this.state.trip_id,
            rating: 4
        },
        {
          headers: {
            Authorization: 'Bearer ' + this.state.access_token
          }
        })
        .then((response) => {
            console.log('Rider response.data: ', response.data);
        })
        .catch((error) => {
            console.log(error);
            alert('Problem occured.');
        });

        // this.setState({ trip_id: null }); // Clear trip id
        // this.setState({ trip_request_id: null }); // Clear trip id
    }

    tripDone() {
        this.leave(this.state.passengerChannel); // Leave passenger channel
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.text}>Rider</Text>
                    <Text style={styles.riderText}>
                        { this.state.online ? 'Online' : 'Offline' }
                    </Text>
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
                    <Button onPress={ () => this.onlineToggle() }
                        title={ this.state.online ? 'Go offline' : 'Go online' }
                        color={ this.state.online ? "#E76E6E" : "#8EC781" }
                    />
                    <Button onPress={ () => this._3A_accept() }
                        title="3a. Accept trip"
                        color="#5560BE"
                    />
                    <Button onPress={ () => this._5_1_1delayed() }
                        title="5.1.1 Rider delayed"
                        color="#DEA569"
                    />
                    <Button onPress={ () => this._5_1_1cancelled() }
                        title="5.1.1 Rider cancelled"
                        color="#DEA569"
                    />
                    <Button onPress={ () => this._6A_arrived() }
                        title="6a. Arrived at pickup"
                        color="#CDCD4E"
                    />
                    <Button onPress={ () => this._7_start() }
                        title="7. Start trip"
                        color="#65CD4E"
                    />
                    <Button onPress={ () => this.locationUpdate() }
                        title="7.2.1 Send location update"
                        color="#4ECDBB"
                    />
                    <Button onPress={ () => this._8arrived() }
                        title="8. Arrived at destination"
                        color="#D38DDC"
                    />
                    <Button onPress={ () => this._9_1rate() }
                        title="9.1 Rate passenger"
                        color="#8EC781"
                    />
                    <Button onPress={ () => this.tripDone() }
                        title="Trip done"
                        color="#007CED"
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 35,
        paddingBottom: 35
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    riderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'green'
    }
});

export default Rider;