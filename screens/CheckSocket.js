import React, {
    Component
} from 'react';
import {
    StyleSheet,
    View,
    Button,
    TextInput
} from 'react-native';

import Echo from 'laravel-echo/dist/echo';
import Socketio from 'socket.io-client/dist/socket.io';

class CheckAuth extends Component {
    constructor(props) {
        super(props);

        this.state = {
            access_token: null,
            csrf: null,
            host: '192.168.0.138'
        };
    }

    join() {
        let echo = new Echo({
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

        echo.join('chat')
            .here((users) => {
                console.log('Users here: ', users);
            })
            .joining((user) => {
                console.log('User joining: ', user);
            })
            .leaving((user) => {
                console.log('User leaving: ', user);
            })
            .listen('MessageSent', event => {
                console.log('MessageSent: ', event);
            });
    }

    render() {
        return (
            <View style={styles.container} >
                <TextInput style={{height: 40}}
                    placeholder="Type here Bearer Access Token"
                    onChangeText={ (access_token) => this.setState({access_token}) }
                />
                <Button onPress={ () => this.join() }
                    title="Join websocket"
                    color="#67C492"
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