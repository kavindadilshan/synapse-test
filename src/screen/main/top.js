import React from 'react'
import {PermissionsAndroid, NativeModules, NativeEventEmitter, Platform} from 'react-native';
import BleManager from 'react-native-ble-manager'

const eventEmitter = new NativeEventEmitter(NativeModules.BleManager)

async function getBluetoothScanPermission() {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
            title: 'Bluetooth Permission',
            message:
                'In the next dialogue, Android will ask for permission for this ' +
                'App to access your location. This is needed for being able to ' +
                'use Bluetooth to scan your environment for peripherals.',
            buttonPositive: 'OK'
        },
    )
    console.log("granted",granted)
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('BleManager.scan will *NOT* detect any peripherals!')
    }
}

export default class App extends React.Component {

    async componentDidMount() {
        console.log("Platform.Version",Platform.Version)
        eventEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            async (args) => {
                console.log("found: " + args.id)
            }
        )

        eventEmitter.addListener(
            'BleManagerStopScan',
            () => {
                console.log("done")
            }
        )

        console.log("started")
        await BleManager.start( { forceLegacy: true } )
        console.log("check location access permission")
        await getBluetoothScanPermission()
        console.log("scanning")
        await BleManager.scan([], 5)
    }

    render() {
        return null
    }
}
