import React, {Component} from 'react';
import {
    View,
    NativeModules,
    NativeEventEmitter,
    Text,
    FlatList,
    ScrollView,
    TouchableHighlight,
    Platform, StyleSheet
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import * as servicesList from "../../util/uuidServices";
import * as commonFunc from "../../util/commonFunc";
import {Colors} from "react-native/Libraries/NewAppScreen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageStrings} from '../../util/constance';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let peripherals = new Map();

class Home extends Component {
    state = {
        isConnect: false,
        list: []
    }

    async componentDidMount() {
        console.log('Platform.Version', Platform.Version);
        BleManager.start({forceLegacy: true});
        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
        bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
        bleManagerEmitter.addListener('BleManagerDidUpdateState', this.checkState);
        setTimeout(() => {
            this.startScan();
        }, 2500)
    }

    componentWillUnmount() {
        bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
        bleManagerEmitter.removeListener('BleManagerStopScan', this.handleStopScan);
        bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
        bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
        bleManagerEmitter.removeListener('BleManagerDidUpdateState', this.checkState);
    }

    startScan = () => {
        console.log('isScanning', this.state.isConnect);
        if (!this.state.isConnect) {
            BleManager.scan([], 1, true).then((results) => {
                console.log('Scanning...');
                this.setState({isConnect: true});
            }).catch(err => {
                console.error(err);
            });
        }
    };

    handleDiscoverPeripheral = (peripheral) => {
        console.log('handleDiscoverPeripheral: Got ble peripheral', peripheral);
        if (peripheral.name) {
            peripherals.set(peripheral.id, peripheral);
            this.setState({list: Array.from(peripherals.values())});
        }
    };

    handleStopScan = async () => {
        console.log('Scan is stopped');
        this.setState({isConnect: false});

        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        if (peripheralId) {
            console.log('connecting...')
            console.log(peripheralId)
            this.connectDevice(peripheralId);
        }
    };

    handleDisconnectedPeripheral = (data) => {
        let peripheral = peripherals.get(data.peripheral);
        console.log('disconnect: ', peripheral);

        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            this.setState({list: Array.from(peripherals.values())});
        }
        console.log('Disconnected from ' + data.peripheral);
    };

    handleUpdateValueForCharacteristic = (data) => {
        console.log(data.value)
    };

    checkState = () => {
        BleManager.checkState();
    };

    activeHandler = async (peripheral) => {
        if (peripheral) {
            if (peripheral.connected) {
                console.log('peripheral.connected', peripheral.connected);
                BleManager.disconnect(peripheral.id, true)
                    .then(res => console.log('res', res))
                    .catch(err => console.error('err', err));

                let pDevice = this.state.list.find((obj) => obj.id === peripheral.id);
                if (pDevice) {
                    console.log('try to disconnect');
                    pDevice.connected = false;
                }
                this.setState({list: this.state.list});
                await AsyncStorage.removeItem(StorageStrings.PERIPHERAL_ID);
            } else {
                this.connectDevice(peripheral.id)
            }
        }

    };

    connectDevice = (peripheralId) => {

        BleManager.connect(peripheralId)
            .then(() => {
                console.log('Connecting...')
                BleManager.retrieveServices(peripheralId).then((peripheralInfo) => {
                    let crustCharacteristic = 'a970fd39-a0e8-11e6-bdf4-0800200c9a66';
                    let service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';
                    BleManager.write(peripheralId, service, crustCharacteristic, [0]).then(async (res) => {
                        let pDevice = this.state.list.find((obj) => obj.id === peripheralId);
                        if (pDevice) {
                            pDevice.connected = true;
                        }
                        this.setState({list: this.state.list});
                        await AsyncStorage.setItem(StorageStrings.PERIPHERAL_ID, peripheralId);
                        // this.notificationHandler(peripheral);
                    }).catch((error) => {
                        console.log('error: ', error);
                    });
                });
            })
            .catch((error) => {
                console.log('Connection error', error);
            })
            .finally(() => {
                console.log('Connected::::::::::::::::::::::::::::::::::');
            });
    }

    notificationHandler = async (peripheral) => {
        await BleManager.startNotification(peripheral.id, `a9712440-a0e8-11e6-bdf4-0800200c9a66`, `a9712442-a0e8-11e6-bdf4-0800200c9a66`);
    };

    renderItem = (item) => {
        const color = item.connected ? 'green' : '#fff';
        return (
            <ScrollView
                style={{marginBottom: 100}}
            >
                <View style={[styles.row, {backgroundColor: color}]}>
                    <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
                    <Text style={{
                        fontSize: 10,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 2,
                    }}>RSSI: {item.rssi}</Text>
                    <Text style={{
                        fontSize: 8,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 2,
                        paddingBottom: 20,
                    }}>{item.id}</Text>

                    <TouchableHighlight style={{
                        backgroundColor: item.connected ? 'gray' : 'orange',
                        fontSize: 8,
                        textAlign: 'center',
                        color: 'white',
                        padding: 2,
                    }} onPress={() => this.activeHandler(item)}>
                        <Text style={{
                            color: 'white',
                            padding: 10,
                            textAlign: 'center'
                        }}>{`${item.connected ? 'Disconnect' : 'Connect'}`}</Text>
                    </TouchableHighlight>
                </View>
            </ScrollView>
        );
    };

    render() {
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data={this.state.list}
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={item => item.id}
                />
                <TouchableHighlight style={{
                    backgroundColor: 'red',
                    fontSize: 8,
                    textAlign: 'center',
                    color: 'white',
                    padding: 2,
                }} onPress={() => this.props.navigation.navigate('Dashboard')}>
                    <Text style={{
                        color: 'white',
                        padding: 10,
                        textAlign: 'center'
                    }}>Main Screen</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
    serviceContainer: {
        padding: 10,
        backgroundColor: Colors.lighter,
    },
    serviceName: {fontSize: 15, fontWeight: 'bold'},
    serviceId: {},
    name: {
        fontWeight: 'bold',
        color: 'white',
    },
    id: {},
    serviceContainer_: {},
    button: {
        backgroundColor: 'black',
        padding: 15,
        marginBottom: 5,
    },
});

export default Home;
