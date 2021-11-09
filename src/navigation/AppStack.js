import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import MainScreen from '../screen/main/test';
import Dashboard from '../screen/dashboard/DashboardScreen';
import Home from "../screen/home/Home";
import Configurations from "../screen/main/Configurations";
import Adviser from "../screen/home/Adviser";
import Plx from "../screen/home/Plx";

const Stack = createStackNavigator();

const AppStack = ({navigation}) => (
    <Stack.Navigator>
        <Stack.Screen name={'Plx'} component={Plx}/>
        <Stack.Screen name={'Adviser'} component={Adviser}/>
        <Stack.Screen name={'Home'} component={Home}/>
        <Stack.Screen name={'Configurations'} component={Configurations}/>
        <Stack.Screen name={'MainScreen'} component={MainScreen}/>
        <Stack.Screen name={'Dashboard'} component={Dashboard} navigationOptions={{gesturesEnabled: true}}/>
    </Stack.Navigator>
);

export default AppStack;
