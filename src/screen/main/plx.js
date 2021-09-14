import React,{Component} from 'react';
import { BleManager } from 'react-native-ble-plx';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text, Button,
} from 'react-native';

const manager = new BleManager();

class App extends Component{

    componentDidMount() {
        manager.onStateChange((state) => {
            const subscription = manager.onStateChange((state) => {
                console.log("state!@",state)
                if (state === 'PoweredOn') {
                    this.scanAndConnect();
                    subscription.remove();
                }
            }, true);
            return () => subscription.remove();
        });
    }
    scanAndConnect = () => {
        console.log("checking....");
        manager.startDeviceScan(null, null, (error, device) => {
            console.log("error",error);
            console.log("device",device);

            console.log(JSON.stringify(error));
            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }

            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            if (device.name === 'TI BLE Sensor Tag' ||
                device.name === 'SensorTag') {

                // Stop scanning as it's not necessary if you are scanning for one device.
                manager.stopDeviceScan();

                // Proceed with connection.
            }
        });
    }
    render() {
        return (
            <View>
                <View style={styles.body}>

                    <View style={{margin: 10}}>
                        {/*<Button*/}
                            {/*title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}*/}
                            {/*onPress={() => startScan() }*/}
                        {/*/>*/}
                    </View>

                    <View style={{margin: 10}}>
                        <Button title="Scan and connect" onPress={this.scanAndConnect} />
                    </View>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
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

