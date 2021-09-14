import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SignupScreen from '../screen/login/SignupScreen';
import LoginScreen from '../screen/login/LoginScreen';

const Stack = createStackNavigator();

const AuthStack=()=>{
    return(
        <Stack.Navigator>
            <Stack.Screen name={"Login"} component={LoginScreen}/>
            <Stack.Screen name={"SignUp"} component={SignupScreen}/>
        </Stack.Navigator>
    )
}

export default AuthStack;
