/**
 * Configurations BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, {
    useState,
    useEffect,
} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    NativeModules,
    NativeEventEmitter,
    Button,
    Platform,
    PermissionsAndroid,
    FlatList,
    TouchableHighlight,
} from 'react-native';
import {stringToBytes} from 'convert-string';
import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';
import * as servicesList from '../../util/uuidServices';
import * as commonFunc from '../../util/commonFunc';
import BleManager from 'react-native-ble-manager';
import * as unitServiceList from '../../util/unitServiceFunction';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = ({navigation}) => {
    const [isScanning, setIsScanning] = useState(false);
    const peripherals = new Map();
    const [list, setList] = useState([]);

    const startScan = () => {
        console.log('isScanning', isScanning);
        if (!isScanning) {
            BleManager.scan([], 3, true).then((results) => {
                console.log('Scanning...');
                setIsScanning(true);
            }).catch(err => {
                console.error(err);
            });
        }
    };

    const handleStopScan = () => {
        console.log('Scan is stopped');
        setIsScanning(false);
    };

    const handleDisconnectedPeripheral = (data) => {
        let peripheral = peripherals.get(data.peripheral);
        console.log('disconnect: ', peripheral);

        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
        console.log('Disconnected from ' + data.peripheral);
    };

    const handleUpdateValueForCharacteristic = (data) => {
        let peripheral = data.peripheral;
        let serviceId = data.service.split('-')[0];
        let characteristic = data.characteristic.split('-')[0];

        let services = servicesList.services.find(obj => obj.serviceId === serviceId);
        let characteristicObj = services.servicesList.find(obj => obj.id === characteristic);

        let value = commonFunc.retreiveOptimizeData(characteristicObj.format, data.value);
        console.log('Received data from: ', characteristicObj.name, ' received value: ', data.value, ' -> ', value);
    };

    const retrieveConnected = () => {
        console.log('retrieveConnected...');
        BleManager.getConnectedPeripherals([]).then((results) => {
            if (results.length === 0) {
                console.log('No connected peripherals');
            }
            console.log('check details', results);
            for (var i = 0; i < results.length; i++) {
                var peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                setList(Array.from(peripherals.values()));
            }
        });
        console.log('peripherals:..', peripherals);
        BleManager
            .getDiscoveredPeripherals()
            .then(devices => {
                console.log('Discovered devices:', devices);
            })
            .catch(error => {
                console.log('error fail: ', error);
            });
    };

    const handleDiscoverPeripheral = (peripheral) => {
        console.log('handleDiscoverPeripheral: Got ble peripheral', peripheral);
        if (!peripheral.name) {
            peripheral.name = 'NO NAME';
        }

        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
    };

    const refreshHandler = () => {
        BleManager.refreshCache('C4:87:49:36:37:00')
            .then((peripheralInfo) => {
                // Success code
                console.log('cache refreshed!');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const activeHandler = (peripheral) => {
        console.log('peripherals:map', peripherals);
        console.log('peripherals:state', list);
        console.log('testPeripheral_id_', peripheral.id);

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
                setList(list);
            } else {
                console.log('__peripheral.connect_');
                BleManager.connect(peripheral.id)
                    .then(() => {


                        setTimeout(() => {
                            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                                // console.log("peripheralInfo",peripheralInfo);
                                //   console.log("advertising",peripheralInfo.advertising);
                                //   console.log("characteristics",peripheralInfo.characteristics);

                                if (peripheralInfo.characteristics.length !== 0) {
                                    peripheralInfo.characteristics.map((obj, i) => {
                                        // console.log("index: "+(i+1));
                                        // console.log("characteristic: ",obj.characteristic ? obj.characteristic : "");
                                        // console.log("properties: ",obj.properties ? obj.properties : "");
                                        // console.log("service: ",obj.service ? obj.service : "");
                                        // console.log("descriptors: ",obj.descriptors ? obj.descriptors : "");
                                        // console.log("\n");
                                    });
                                }


                                setTimeout(() => {
                                    let crustCharacteristic = 'a970fd39-a0e8-11e6-bdf4-0800200c9a66';
                                    let service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                    // let data = stringToBytesConvertor("0");
                                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then((res) => {
                                        let pDevice = list.find((obj) => obj.id === peripheral.id);
                                        if (pDevice) {
                                            pDevice.connected = true;
                                        }
                                        setList(list);
                                        // notificationHandler();
                                    }).catch((error) => {
                                        console.log('error: ', error);
                                    });
                                }, 200);
                            });
                        }, 900);
                    })
                    .catch((error) => {
                        console.log('Connection error', error);
                    })
                    .finally(() => {
                        console.log('finally///');
                    });
            }
        }

    };

    const checkState = () => {
        BleManager.checkState();
    };

    useEffect(() => {

        // const unsubscribe = Bluetooth.didChangeState(bluetoothState => {
        //     console.log("bluetoothState !",bluetoothState)
        //     // bluetoothState == 'enabled' | 'disabled'
        // });

        console.log('Platform.Version', Platform.Version);
        BleManager.start({forceLegacy: true});

        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        bleManagerEmitter.addListener('BleManagerDidUpdateState', checkState);

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                    console.log('Permission is OK');
                } else {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (result) {
                            console.log('User accept');
                        } else {
                            console.log('User refuse');
                        }
                    });
                }
            });
        }

        return (() => {
            console.log('unmount');
            bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
            bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
            bleManagerEmitter.removeListener('BleManagerDidUpdateState', checkState);
        });
    }, []);

    const readProperty = (peripheralId, serviceId, propId) => {
        let selectObj = servicesList.services.find(obj => obj.serviceId === serviceId);

        let property = selectObj.servicesList.find(obj => obj.id === propId);


        setTimeout(() => {
            let bakeCharacteristic = `${propId}-a0e8-11e6-bdf4-0800200c9a66`;
            let service = `${serviceId}-a0e8-11e6-bdf4-0800200c9a66`;

            BleManager.read(peripheralId, service, bakeCharacteristic).then((res) => {
                console.log(`${property.name}:response: `, res);
                if (property.format === servicesList.UINT_32) {
                    console.log(`${property.name}:${property.format}: `, commonFunc.stringAsUInt32BE(res));
                }
                if (property.format === servicesList.UINT_8) {
                    console.log(`${property.name}:${property.format}: `, commonFunc.stringAsUInt8BE(res));
                }
                if (property.format === servicesList.UINT_16) {
                    console.log(`${property.name}:${property.format}: `, commonFunc.stringAsUInt16BE(res));
                }
                if (property.format === servicesList.STRING) {
                    console.log(`${property.name}:${property.format}: `, commonFunc.binConvertString(res));
                }
                if (property.format === servicesList.FLOAT) {
                    console.log(`${property.name}:${property.format}: `, commonFunc.stringAsFloat32(res));
                }
                console.log('\n\n');
            }).catch((error) => {
                console.log(`${property.name}:error: `, error);
            });
        }, 500);
    };

    const notificationHandler = async () => {
        // let services = servicesList.services.find(obj => obj.serviceId === 'a9712440');
        // services.servicesList.map((obj, i) => {
        //     setTimeout(() => {
        //         BleManager.startNotification('C4:87:49:36:37:00', `a9712440-a0e8-11e6-bdf4-0800200c9a66`, `${obj.id}-a0e8-11e6-bdf4-0800200c9a66`).then((res) => {
        //             console.log(`${obj.id} -> `, res);
        //         }).catch((error) => {
        //             console.log('Notification error', error);
        //         });
        //     }, (i + 1) * 500);
        //     // let services = servicesList.services.find(obj => obj.serviceId === 'a9717266');
        //     // services.servicesList.map((obj, i) => {
        //     //     setTimeout(() => {
        //     //         BleManager.startNotification('C4:87:49:36:37:00', `a9717260-a0e8-11e6-bdf4-0800200c9a66`, `${obj.id}-a0e8-11e6-bdf4-0800200c9a66`).then((res) => {
        //     //             console.log(`${obj.id} -> `, res);
        //     //         }).catch((error) => {
        //     //             console.log('Notification error', error);
        //     //         });
        //     //     }, (i + 1) * 500);
        //     // });
        // });
        // let services = servicesList.services.find(obj => obj.serviceId === 'a9712440');
        // console.log(services)

        await BleManager.retrieveServices("DDA5E070-8A92-75EE-259F-3D48CF5321E4");
        await BleManager.startNotification('DDA5E070-8A92-75EE-259F-3D48CF5321E4', `a9712440-a0e8-11e6-bdf4-0800200c9a66`, `a9712442-a0e8-11e6-bdf4-0800200c9a66`);
        // To enable BleManagerDidUpdateValueForCharacteristic listener
        // await BleManager.startNotification('C4:87:49:36:37:00', `a9712440-a0e8-11e6-bdf4-0800200c9a66`, `a9712442-a0e8-11e6-bdf4-0800200c9a66`);
    };

    const writeData = () => {
        // const data=Number(commonFunc.DecodeHexStringToByteArray("41"));
        //
        // BleManager.write(
        //     'C4:87:49:36:37:00',
        //     'a9712440-a0e8-11e6-bdf4-0800200c9a66',
        //     'a9712443-a0e8-11e6-bdf4-0800200c9a66',
        //     [data],
        // )
        //     .then((res) => {
        //         // Success code
        //         console.log('Write Data Unit :::::::::::::::::::::::::::: '+data);
        //     })
        //     .catch((error) => {
        //         // Failure code
        //         console.log('Error::::::::::::::::::::::::::::::'+error);
        //     });
        let dataUnitRatio = unitServiceList.unitService.find(obj => obj.unit === 'pounds force');
        let calibrationUnitRatio = unitServiceList.unitService.find(obj => obj.unit === 'newtons');
        console.log(dataUnitRatio);
        console.log(calibrationUnitRatio)
    };

    const renderItem = (item) => {
        const color = item.connected ? 'green' : '#fff';
        return (
            <ScrollView
                // contentInsetAdjustmentBehavior="automatic"
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

                    <TouchableHighlight onPress={() => activeHandler(item)} style={{
                        backgroundColor: 'orange', fontSize: 8, textAlign: 'center', color: 'white', padding: 2,
                    }}>
                        <Text style={{color: 'white', padding: 10, textAlign: 'center'}}>Connect</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => navigation.navigate('Dashboard')} style={{
                        backgroundColor: 'red', fontSize: 8, textAlign: 'center', color: 'white', padding: 2,
                    }}>
                        <Text style={{color: 'white', padding: 10, textAlign: 'center'}}>Dashboard</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => writeData()} style={{
                        backgroundColor: 'pink', fontSize: 8, textAlign: 'center', color: 'white', padding: 2,
                    }}>
                        <Text style={{color: 'white', padding: 10, textAlign: 'center'}}>changed data value</Text>
                    </TouchableHighlight>
                </View>
                {
                    item.connected && servicesList.services.map((obj, index) => {
                        return <View style={styles.serviceContainer}>
                            <View style={styles.serviceContainer_}>
                                <Text style={styles.serviceName}>{`${obj.serviceName} - ${obj.serviceId}`}</Text>
                                <Text style={styles.serviceId}>{}</Text>
                            </View>
                            {
                                obj.servicesList.map((ser, index) => {
                                    return <TouchableHighlight style={styles.button}
                                                               onPress={() => readProperty(item.id, obj.serviceId, ser.id)}>
                                        <View>
                                            <Text style={styles.name}>{`${ser.name} - ${ser.id} (${ser.format})`}</Text>
                                            {/*<Text style={styles.id}>{ser.id}</Text>*/}
                                        </View>
                                    </TouchableHighlight>;
                                })
                            }
                        </View>;
                    })
                }
            </ScrollView>
        );
    };

    return (
        <>
            {/*<StatusBar barStyle="dark-content" />*/}
            <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}>
                    {global.HermesInternal == null ? null : (
                        <View style={styles.engine}>
                            <Text style={styles.footer}>Engine: Hermes</Text>
                        </View>
                    )}
                    <View style={styles.body}>

                        <View style={{margin: 10}}>
                            <Button
                                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                                onPress={() => startScan()}
                            />
                        </View>

                        <View style={{margin: 10}}>
                            <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()}/>
                        </View>
                        {/*<View style={{margin: 10}}>*/}
                        {/*<Button title="Check State" onPress={() => {*/}
                        {/*console.log('check:peripherals:map', peripherals);*/}
                        {/*console.log('check:peripherals:state', list);*/}
                        {/*}}/>*/}
                        {/*</View>*/}

                        <View style={{margin: 10}}>
                            <Button title="Refresh" onPress={() => notificationHandler()}/>
                        </View>

                        {(list.length === 0) &&
                        <View style={{flex: 1, margin: 20}}>
                            <Text style={{textAlign: 'center'}}>No peripherals</Text>
                        </View>
                        }

                    </View>
                </ScrollView>
                <FlatList
                    data={list}
                    renderItem={({item}) => renderItem(item)}
                    keyExtractor={item => item.id}
                />
            </SafeAreaView>
        </>
    );
};

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

export default App;
