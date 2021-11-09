import React, {useEffect} from "react";
import {View, NativeEventEmitter, NativeModules,TouchableOpacity,Text} from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';


const Adviser = () => {
    useEffect(() => {
        startScan();
    })

    const startScan = () => {
        console.log('Listener register')
        const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
        eventEmitter.addListener('onDeviceFound', (event) => {
            console.log('onDeviceFound', event);

            BLEAdvertiser.setCompanyId(0xC3); // Your Company's Code
            BLEAdvertiser.scanByService(['a970fd30-a0e8-11e6-bdf4-0800200c9a66', 'a9712440-a0e8-11e6-bdf4-0800200c9a66'], {})
                .then(success => console.log("Scan Successful", success))
                .catch(error => console.log("Scan Error", error));

        });
    }

    return (
        <View>

            <TouchableOpacity style={{width:100,height:100,backgroundColor:'red'}} onPress={()=>startScan()}>
                <Text>Scan</Text>
            </TouchableOpacity>

        </View>
    )
}

export default Adviser
