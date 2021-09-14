import React, {useContext, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    ScrollView,TextInput,Button
} from 'react-native';
import {AuthContext} from '../../navigation/AuthProvider';

const LoginScreen=({navigation})=>{
    const [userName,setUserName]=useState('');
    const [password,setPassword]=useState('');

    const {login} = useContext(AuthContext);

    return(
        <View>
            <Text>user Name</Text>
            <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={event=>setUserName(event)}
            />
            <Text>Password</Text>
            <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={event=>setPassword(event)}
            />
            <Button style={styles} title={'Login'} onPress={()=>login(userName,password,navigation)}/>
            <Button style={styles} title={'SignUp'} onPress={()=>navigation.navigate('SignUp')}/>
        </View>
    )
}

const styles=StyleSheet.create({
    textInput:{
        width:400,
        height:50,
        backgroundColor:'gray'
    },
    button:{
        backgroundColor: 'green',
        width: 200,
        height: 50,
        justifyContent:'center',
    }
})

export default LoginScreen;
