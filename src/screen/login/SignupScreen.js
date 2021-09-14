import React, {useContext, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    ScrollView, TextInput, Button,
} from 'react-native';
import {AuthContext} from '../../navigation/AuthProvider';

const SignupScreen = ({navigation}) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const {register} = useContext(AuthContext);

    return (
        <View>
            <Text>user Name</Text>
            <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={event => setUserName(event)}
            />
            <Text>Password</Text>
            <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={event => setPassword(event)}
            />
            <Button style={styles} title={'Register'} onPress={() => register(userName, password,navigation)}/>
        </View>
    );
};
const styles = StyleSheet.create({
    textInput: {
        width: 400,
        height: 50,
        backgroundColor: 'gray',
    },
    button: {
        backgroundColor: 'green',
        width: 200,
        height: 50,
        justifyContent: 'center',
    },
});

export default SignupScreen;
