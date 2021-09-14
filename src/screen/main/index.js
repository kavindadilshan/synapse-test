import React,{Component} from 'react';
import {
    SafeAreaView,
    Button,
    ActivityIndicator,
    StyleSheet,
    Text,
    NativeAppEventEmitter,
    View,
} from 'react-native';
import Colors from 'react-native/Libraries/NewAppScreen/components/Colors';

import BluetoothState_ from 'react-native-bluetooth-state';
import BluetoothStateManager,{BluetoothState} from 'react-native-bluetooth-state-manager';

class App extends Component{
    componentDidMount() {
        BluetoothStateManager.enable().then((result) => {
           console.log("enable...",result)
        });

        BluetoothStateManager.onStateChange((bluetoothState) => {
            // do something...
            console.log("onStateChange...",bluetoothState)
        }, true /*=emitCurrentState*/);

        BluetoothStateManager.requestToEnable().then((result) => {
            console.log("requestToEnable...",result)
            // result === true -> user accepted to enable bluetooth
            // result === false -> user denied to enable bluetooth
        });
        NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral',(data) =>
        {
            console.log("Tech",data) // Name of peripheral device
        });
    }
    render() {
        // const abc = useColorScheme();
        return (
            <View>
                {/*<Text style={[*/}
                    {/*{*/}
                        {/*backgroundColor: Colors.darker,*/}
                        {/*color: Colors.white,*/}
                    {/*},*/}
                {/*]}>*/}
                {/*</Text>*/}

                <BluetoothState>
                    <BluetoothState.PoweredOn>
                        <Text style={styles.textStyle}>This will rendered only when bluetooth is turned on.</Text>
                    </BluetoothState.PoweredOn>
                    <BluetoothState.PoweredOff>
                        {({ requestToEnable, openSettings }) => (
                            <View>
                                <Text style={styles.textStyle}>This will rendered only when bluetooth is turned off.</Text>
                                <Button
                                    title="This will rendered only when bluetooth is turned off."
                                    onPress={Platform.OS === 'android' ? requestToEnable : openSettings}
                                />
                            </View>
                        )}
                    </BluetoothState.PoweredOff>
                    <BluetoothState.Resetting>
                        <ActivityIndicator />
                    </BluetoothState.Resetting>
                    <BluetoothState.Unauthorized>
                        <Text style={styles.textStyle}>This will rendered only when bluetooth permission is not granted.</Text>
                    </BluetoothState.Unauthorized>
                    <BluetoothState.Unsupported>
                        <Text style={styles.textStyle}>This will rendered only when bluetooth is not supported.</Text>
                    </BluetoothState.Unsupported>
                    <BluetoothState.Unknown>
                        <Text style={styles.textStyle}>You have a really strange phone.</Text>
                    </BluetoothState.Unknown>
                </BluetoothState>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    textStyle: {
        color: Colors.white,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});
export default App;
