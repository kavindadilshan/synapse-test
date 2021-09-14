import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import MainScreen from '../screen/main/test';
import Dashboard from '../screen/dashboard/DashboardScreen';

const Stack = createStackNavigator();

const AppStack = ({navigation}) => (
    <Stack.Navigator>
        <Stack.Screen name={'MainScreen'} component={MainScreen}/>
        <Stack.Screen name={'Dashboard'} component={Dashboard} navigationOptions={{gesturesEnabled: true}}/>
    </Stack.Navigator>
);

export default AppStack;
