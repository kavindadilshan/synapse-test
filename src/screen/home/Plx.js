import React, {useEffect} from "react";
import {PermissionsAndroid, View, Platform} from 'react-native';
import {BleError, BleManager, Device, ScanMode, ScanOptions} from 'react-native-ble-plx';
import RNFetchBlob from 'rn-fetch-blob'; // You can also take another lib like react-native-base64
import {stringToBytes} from 'convert-string';

let bleManager = new BleManager();
let uuids = ["00002A05-0000-1000-8000-00805F9B34FB"];
const Plx = () => {

    const options: ScanOptions = {
        allowDuplicates: false,
        scanMode: ScanMode.Balanced
    }

    useEffect(async () => {
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                    // this.retrieveConnected()
                } else {
                    PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }

        const subscription = await bleManager.onStateChange(async (state) => {
            console.log('state::::::::', JSON.stringify(state))
            await startScan();
        })

    }, []);

    const startScan = async () => {
        await bleManager.startDeviceScan(null, options,
            async (error: BleError | null, scannedDevice: Device | null) => {
                if (error || !scannedDevice) {
                    // Error handling omitted
                    console.log('Error handling omitted')
                    return;
                }

                if (scannedDevice && scannedDevice.serviceUUIDs) {
                    // Device handling omitted
                    console.log('Device handling omitted')
                }

                // console.log(scannedDevice);

                const base64 = RNFetchBlob.base64;
                const advertisingData = stringToBytes(base64.decode(scannedDevice.manufacturerData));
                console.log('advertising data:::::::::::',advertisingData)


            }
        )

        // scannedDevice.connect()
        //     .then((device) => {
        //         return device.discoverAllServicesAndCharacteristics()
        //     })
        //     .then((device) => {
        //         console.log('connected device::::::::::::::',device)
        //     })
        //     .catch((error) => {
        //         // Handle errors
        //     });
    }

    return (
        <View>

        </View>
    )
}

export default Plx;
