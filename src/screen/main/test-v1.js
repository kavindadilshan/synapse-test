/**
 * Sample BLE React Native App
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
    StatusBar,
    NativeModules,
    NativeEventEmitter,
    Button,
    Platform,
    PermissionsAndroid,
    FlatList,
    TouchableHighlight,
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';

// import Bluetooth from 'react-native-bluetooth-manager';

import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
    const [isScanning, setIsScanning] = useState(false);
    const peripherals = new Map();
    const [list, setList] = useState([]);
    const [date, setDate] = useState(new Date())


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
        console.log("disconnect: ",peripheral);

        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
        console.log('Disconnected from ' + data.peripheral);
    };

    const handleUpdateValueForCharacteristic = (data) => {
        console.log("data",data);
        console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    };

    const retrieveConnected = () => {
        console.log("retrieveConnected...")
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
        console.log("peripherals:..",peripherals)
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
        if (!peripheral.name) peripheral.name = 'NO NAME';

        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
    };

    const activeHandler = (peripheral) => {
        console.log("peripherals:map",peripherals)
        console.log("peripherals:state",list)

        console.log('testPeripheral_id_', peripheral.id);
        console.log('testPeripheral_connected_', peripheral.connected);

        if (peripheral) {
            if (peripheral.connected) {
                console.log('peripheral.connected', peripheral.connected);
                BleManager.disconnect(peripheral.id);
            } else {
                console.log('__peripheral.connect_');
                BleManager.connect(peripheral.id)
                    .then(() => {
                        let p = peripherals.get(peripheral.id);
                        if(p) {
                            p.connected = true;
                            p.set(peripheral.id, p);
                            setList(Array.from(peripherals.values()));
                        }
                        let preList = list;
                        let oureg = list.find((obj)=> obj.id === peripheral.id);
                        if(oureg) oureg.connected = true;
                        setList(preList);
                        setDate(new Date())
                        console.log(oureg)
                        setTimeout(() => {

                            /* Test read current RSSI value */
                            // BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
                            //     console.log('Retrieved peripheral services', peripheralData);
                            //
                            //     BleManager.readRSSI(peripheral.id).then((rssi) => {
                            //         console.log('Retrieved actual RSSI value', rssi);
                            //         let p = peripherals.get(peripheral.id);
                            //         if (p) {
                            //             p.rssi = rssi;
                            //             peripherals.set(peripheral.id, p);
                            //             setList(Array.from(peripherals.values()));
                            //         }
                            //     });
                            // });

                            // Test using bleno's pizza example
                            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza

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


                                let bakeCharacteristic = 'a970fd39-a0e8-11e6-bdf4-0800200c9a66';
                                let service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                let crustCharacteristic = '';

                                setTimeout(() => {
                                    // BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                                    //     console.log('Started notification on ' + peripheral.id);
                                    //     // setTimeout(() => {
                                    //     //   BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                                    //     //     console.log('Writed NORMAL crust');
                                    //     //     BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                                    //     //       console.log('Writed 351 temperature, the pizza should be BAKED');
                                    //     //
                                    //     //       //var PizzaBakeResult = {
                                    //     //       //  HALF_BAKED: 0,
                                    //     //       //  BAKED:      1,
                                    //     //       //  CRISPY:     2,
                                    //     //       //  BURNT:      3,
                                    //     //       //  ON_FIRE:    4
                                    //     //       //};
                                    //     //     });
                                    //     //   });
                                    //     // }, 500);
                                    // }).catch((error) => {
                                    //     console.log('Notification error', error);
                                    // });

                                    let crustCharacteristic = 'a970fd39-a0e8-11e6-bdf4-0800200c9a66';
                                    service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                    // BleManager.write(peripheral.id, service, crustCharacteristic, [1]).then((res) => {
                                    //     console.log('result: ' + res);

                                        // Configuration PIN
                                        BleManager.read(peripheral.id, service, crustCharacteristic).then((res) => {
                                            console.log('Configuration PIN:resp: ' , res);
                                            // console.log(' Status: ' , JSON.stringify(new Uint8Array(res)))
                                            console.log("Configuration PIN",String.fromCharCode.apply(null, new Uint8Array(res)))

                                        }).catch((error) => {console.log('Configuration PIN:error: ', error)});

                                        setTimeout(() => {
                                            // Model Name
                                            bakeCharacteristic = 'a970fd3a-a0e8-11e6-bdf4-0800200c9a66';
                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Model Name:resp: ' , res);
                                                console.log("Model Name",String.fromCharCode.apply(null, new Uint32Array(res)))

                                            }).catch((error) => {console.log('Model Name:error: ', error)});
                                        }, 500);

                                        setTimeout(() => {
                                            // Data Value
                                            bakeCharacteristic = 'a9712441-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a9712440-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Data Value:resp: ' , res);
                                                console.log("Data Value",String.fromCharCode.apply(null, new Uint8Array(res)))
                                            }).catch((error) => {console.log('Data Value:error: ', error)});
                                        }, 1000);

                                        setTimeout(() => {
                                            // Status
                                            bakeCharacteristic = 'a9712442-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a9712440-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Status:resp: ' , res);
                                                // console.log('Status: ' , JSON.stringify(new Uint8Array(res)))
                                                console.log("Status",String.fromCharCode.apply(null, new Uint8Array(res)))
                                            }).catch((error) => {console.log('Status:error: ', error)});
                                        }, 1500);

                                        setTimeout(() => {
                                            // Data Units
                                            bakeCharacteristic = 'a9712443-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a9712440-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Data Units:resp: ' , res);
                                                console.log("Data Units",String.fromCharCode.apply(null, new Uint8Array(res)))

                                            }).catch((error) => {console.log('Data Units:error: ', error)});
                                        }, 2000);

                                        setTimeout(() => {
                                            // Battery Threshold
                                            bakeCharacteristic = 'a970fd33-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Battery Threshold:resp: ' , res);
                                                console.log("Battery Threshold",String.fromCharCode.apply(null, new Uint8Array(res)))

                                            }).catch((error) => {console.log('Battery Threshold:error: ', error)});
                                        }, 2500);

                                        setTimeout(() => {
                                            // View PIN
                                            bakeCharacteristic = 'a970fd34-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('View PIN:resp: ' , res);
                                                console.log("View PIN",String.fromCharCode.apply(null, new Uint8Array(res)))

                                            }).catch((error) => {console.log('View PIN:error: ', error)});
                                        }, 3000);

                                        setTimeout(() => {
                                            // Battery Value
                                            bakeCharacteristic = 'a970fd37-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Battery Value:resp: ' , res);
                                                console.log("Battery Value",String.fromCharCode.apply(null, new Uint8Array(res)))

                                            }).catch((error) => {console.log('Battery Value:error: ', error)});
                                        }, 3500);

                                        setTimeout(() => {
                                            // Serial Number
                                            bakeCharacteristic = 'a970fd35-a0e8-11e6-bdf4-0800200c9a66';
                                            service = 'a970fd30-a0e8-11e6-bdf4-0800200c9a66';

                                            BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                                console.log('Serial Number:resp: ' , res);
                                                console.log("Serial Number",String.fromCharCode.apply(null, new Uint32Array(res)))

                                                console.log("_",Utf8ArrayToStr(res));

                                            }).catch((error) => {console.log('Serial Number:error: ', error)});
                                        }, 4000);

                                    setTimeout(() => {
                                        // Calibration PIN
                                        bakeCharacteristic = 'a971726a-a0e8-11e6-bdf4-0800200c9a66';
                                        service = 'a9717260-a0e8-11e6-bdf4-0800200c9a66';

                                        BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                            console.log('Calibration PIN:resp: ' , res);
                                            console.log("'Calibration PIN",String.fromCharCode.apply(null, new Uint32Array(res)))

                                        }).catch((error) => {console.log('Calibration PIN:error: ', error)});
                                    }, 4500);

                                        // setTimeout(() => {
                                        //     // Sensitivity Range
                                        //     bakeCharacteristic = 'a9717261-a0e8-11e6-bdf4-0800200c9a66';
                                        //     service = 'a9717260-a0e8-11e6-bdf4-0800200c9a66';
                                        //
                                        //     BleManager.read(peripheral.id, service, bakeCharacteristic).then((res) => {
                                        //         console.log('Sensitivity Range:resp: ' , res);
                                        //
                                        //     }).catch((error) => {console.log('Sensitivity Range:error: ', error)});
                                        // }, 3500);

                                    // }).catch((error) => {
                                    //     console.log('error: ', error);
                                    // });

                                    setTimeout(() => {

                                    }, 500)



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
    const Utf8ArrayToStr = async (array) => {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
            c = array[i++];
            switch(c >> 4)
            {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
                case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }
        console.log(">>>",out);
        return out;
    }
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
        });
    }, []);

    const renderItem = (item) => {
        const color = item.localConnect ? 'green' : '#fff';
        return (
            <TouchableHighlight onPress={() => activeHandler(item)}>
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
                </View>
            </TouchableHighlight>
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
                        <View style={{margin: 10}}>
                            <Button title="Check State" onPress={() => {
                                console.log("check:peripherals:map",peripherals)
                                console.log("check:peripherals:state",list)
                            }}/>
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
});

export default App;
