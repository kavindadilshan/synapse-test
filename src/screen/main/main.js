import React, { Component } from 'react';
import {
    AppRegistry,
    ListView,
    NativeAppEventEmitter,
    View,
    Text,
    Button } from 'react-native';
import BleManager from 'react-native-ble-manager';

// I changed this to export default App
class BluetoothScanner extends Component {
    constructor(props){
        super(props);

        // const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.devices = [];
        this.state = {
            // dataSource: dataSource.cloneWithRows(this.devices)
            dataSource: this.devices
        };
    }

    componentDidMount() {
        console.log('bluetooth scanner mounted');
        console.log("state: ",BleManager.checkState());

        BleManager.enableBluetooth()
            .then(() => {
                // Success code
                console.log("The bluetooth is already enabled or the user confirm");
            })
            .catch((error) => {
                // Failure code
                console.log("The user refuse to enable bluetooth");
            });

        NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral',(data) =>
        {
            console.log("data",data)
            let device = 'device found: ' + data.name + '(' + data.id + ')';
            console.log("deives",device)
            if(this.devices.indexOf(device) === -1) {
                this.devices.push(device);
            }

            let newState = this.state;
            newState.dataSource = newState.dataSource.cloneWithRows(this.devices);
            this.setState(newState);
        });

        BleManager.start({showAlert: false,forceLegacy: true})
            .then(() => {
                // Success code
                console.log('Module initialized');
            });
    }

    startScanning = () => {
        console.log('start scanning!!!');
        BleManager.scan([], 3, true).then((results) => {
            console.log('Scanning...',results);
        }).catch(err => {
            console.error(err);
        });
        console.log('start end');
    }

    render() {
        console.log("dataSource",this.state.dataSource)
        return (
            <View style={{padding: 50 }}>
                <Text>Bluetooth scanner</Text>
                <Button onPress={this.startScanning} title="Start scanning"/>

                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) => <Text>{rowData}</Text>}
                />
            </View>
        );
    }
}
export default BluetoothScanner;
