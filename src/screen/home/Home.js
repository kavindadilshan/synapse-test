import React, {Component, useEffect, useState} from 'react';
import {
    View,
    NativeModules,
    NativeEventEmitter,
    Text,
    FlatList,
    ScrollView,
    TouchableHighlight,
    Platform, StyleSheet, Alert, Linking
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import * as servicesList from "../../util/uuidServices";
import * as commonFunc from "../../util/commonFunc";
import {Colors} from "react-native/Libraries/NewAppScreen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AlertMessages, deviceConfigurations, StorageStrings} from '../../util/constance';
import {connect} from 'react-redux';
import * as actionTypes from '../../store/actions';
import * as bleMethodFunc from "../../util/bleMethodFunc";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let peripherals = new Map();

export const Home = ({navigation}) => {
    const [isConnect, setIsConnect] = useState(false);
    const [list, setList] = useState([])

    useEffect(async () => {
        console.log('Platform.Version', Platform.Version);
        {
            Platform.OS !== 'ios' && checkBluetoothEnabled()
        }
        bleMethodFunc.configBLE().then(() => console.log('module initialized'))
        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        bleManagerEmitter.addListener('BleManagerDidUpdateState', checkState);
        setTimeout(()=>{
            startScan();
        },2000)

        return (async () => {
            bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
            bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
            bleManagerEmitter.removeListener('BleManagerDidUpdateState', checkState);
        })
    }, [])

    const checkBluetoothEnabled = () => {
        bleMethodFunc.enableBluetooth()
            .then(() => {
                console.log('The bluetooth is already enabled or the user confirm');
            })
            .catch((error) => {
                Alert.alert(AlertMessages.BLUETOOTH_REQ_TILE, AlertMessages.BLUETOOTH_REQ_DESC,
                    [
                        {
                            text: 'Cancel', onPress: () => checkBluetoothEnabled(), style: 'cancel'
                        },
                        {
                            text: 'Settings', onPress: () => Linking.openSettings()
                        },
                    ])
            });
    }

    const startScan = () => {
        console.log('isScanning', isConnect);
        if (!isConnect) {
            BleManager.scan([], 1, true).then((results) => {
                console.log('Scanning...');
            }).catch(err => {
                console.error(err);
            });
        }
    };

    const handleDiscoverPeripheral = (peripheral) => {
        console.log('handleDiscoverPeripheral: Got ble peripheral', peripheral);
        if (peripheral.name) {
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()))
        }
    };

    const handleStopScan = async () => {
        console.log('Scan is stopped');

        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        if (peripheralId) {
            console.log('connecting...')
            console.log(peripheralId)
            // connectDevice(peripheralId);
        }
    };

    const handleDisconnectedPeripheral = (data) => {
        let peripheral = peripherals.get(data.peripheral);
        console.log('disconnect: ', peripheral);

        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()))
        }
        console.log('Disconnected from ' + data.peripheral);
    };

    const handleUpdateValueForCharacteristic = (data) => {
        console.log(data.value)
    };

    const checkState = () => {
        BleManager.checkState();
        // console.log('status::::::::::::::::::::::')
    };

    const activeHandler = async (peripheral) => {
        if (peripheral) {
            if (peripheral.connected) {
                console.log('peripheral.connected', peripheral.connected);
                BleManager.disconnect(peripheral.id, true)
                    .then(res => console.log('res', res))
                    .catch(err => console.error('err', err));

                let pDevice = list.find((obj) => obj.id === peripheral.id);
                if (pDevice) {
                    console.log('try to disconnect');
                    pDevice.connected = false;
                }
                setList(list)
                await AsyncStorage.removeItem(StorageStrings.PERIPHERAL_ID);
            } else {
                connectDevice(peripheral.id)
            }
        }

    };

    const connectDevice = (peripheralId) => {

        BleManager.connect(peripheralId)
            .then(() => {
                console.log('Connecting...........')
                BleManager.retrieveServices(peripheralId).then((peripheralInfo) => {
                    let crustCharacteristic = 'a970fd39-a0e8-11e6-bdf4-0800200c9a66';
                    let service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';
                    BleManager.write(peripheralId, service, crustCharacteristic, [0]).then(async (res) => {
                        let pDevice = list.find((obj) => obj.id === peripheralId);
                        if (pDevice) {
                            pDevice.connected = true;
                        }
                        setList(list);
                        setIsConnect(true)
                        await AsyncStorage.setItem(StorageStrings.PERIPHERAL_ID, peripheralId);
                        // notificationHandler(peripheral);
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

    const writeProperty = async () => {
        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        const UUID = commonFunc.findDeviceServices('Configuration Profile', 'Data Rate')
        const data = commonFunc.decimalToBytesArray(1000);
        console.log(data)
        await bleMethodFunc.writeProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id, [3, 232])
            .then((res) => {
                console.log('saved')
            })
            .catch(err => console.log(err))

        await bleMethodFunc.readProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id)
            .then((res) => {
                console.log(commonFunc.stringAsUInt32BE(res))
            })
    }


    const renderItem = (item) => {
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
                    }} onPress={() => activeHandler(item)}>
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


    return (
        <View style={{flex: 1}}>
            <FlatList
                data={list}
                renderItem={({item}) => renderItem(item)}
                keyExtractor={item => item.id}
            />
            {isConnect && (
                <View>
                    <TouchableHighlight style={{...styles.button2,backgroundColor:'blue'}} onPress={() =>navigation.navigate('Configurations')}>
                        <Text style={{
                            color: 'white',
                            padding: 10,
                            textAlign: 'center'
                        }}>Configure</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.button2} onPress={() => navigation.navigate('Dashboard')}>
                        <Text style={{
                            color: 'white',
                            padding: 10,
                            textAlign: 'center'
                        }}>Dashboard</Text>
                    </TouchableHighlight>
                </View>

            )}

        </View>
    );

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
    button2: {
        backgroundColor: 'red',
        fontSize: 8,
        textAlign: 'center',
        color: 'white',
        padding: 2,
    }
});

const mapStateToProps = (state) => ({
    loading: state.user.loading,
});

const mapDispatchToProps = dispatch => {
    return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
