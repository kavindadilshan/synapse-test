import React, {Component, useEffect, useState} from 'react';
import {Text, TouchableHighlight, View, StyleSheet, NativeModules, NativeEventEmitter, Picker} from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {StorageStrings} from "../../util/constance";
import * as commonFunc from "../../util/commonFunc";
import * as bleMethodFunc from "../../util/bleMethodFunc";
import DropDownPicker from 'react-native-dropdown-picker';
import {unitConversion} from "../../util/commonFunc";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const Configurations = () => {
    const [value, setValue] = useState();
    const [stringVal, setStringVal] = useState();
    const [tareVal, setTareVal] = useState();
    const [frequency, setFrequency] = useState();
    const [open, setOpen] = useState(false);
    const [dropDownValue, setDropDownValue] = useState(null);
    const [items, setItems] = useState([
        {label: '10Hz', value: 10},
        {label: '100Hz', value: 100},
        {label: '500Hz', value: 500},
        {label: '1000Hz', value: 1000},
        {label: '2000Hz', value: 2000}
    ]);

    useEffect(async () => {
        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);

        const UUID = commonFunc.findDeviceServices('Data Profile', 'Data Value');
        await bleMethodFunc.startNotification(peripheralId, UUID.service.serviceId, UUID.characteristic.id);

        await readProperty('Configuration Profile', 'System Zero');

        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({value}) => notify(value));
        return (() => {
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', ({value}) => notify(value));
        })
    })

    const notify = (value) => {
        setValue(value);
        console.log(value)
        setStringVal(commonFunc.stringAsFloat32(value))

    }

    const readProperty = async (serviceName, characteristicName) => {
        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        const UUID = commonFunc.findDeviceServices(serviceName, characteristicName)
        await bleMethodFunc.readProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id)
            .then((res) => {

                switch (characteristicName) {
                    case 'System Zero':
                        console.log('system zero read property::::::' + commonFunc.stringAsFloat32(res));
                        setTareVal(commonFunc.stringAsFloat32(res))
                        break;
                    case 'Data Rate':
                        console.log('data rate read property::::::' + commonFunc.stringAsUInt32BE_(res));
                        break;
                    default:
                        break;
                }

            })
    }

    const writeProperty = async (byteArray, serviceName, characteristicName) => {
        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        const UUID = commonFunc.findDeviceServices(serviceName, characteristicName)

        console.log('byte:::::::' + byteArray)

        await bleMethodFunc.writeProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id, [byteArray[0], byteArray[1], byteArray[2], byteArray[3]])
            .then((res) => {
                console.log('saved')
            })
            .catch(err => console.log(err))
        await readProperty(serviceName, characteristicName);
    }


    const setOpenDropDown = (open) => {
        setOpen(open)
    }

    const setValueDropDown = (callback) => {
        setDropDownValue(callback(value));
        const byteValue = commonFunc.byteAsUInt32BE_(callback(value));
        // console.log(commonFunc.byteAsUInt32BE_(callback(value)))
        writeProperty(byteValue, 'Configuration Profile', 'Data Rate')
    }

    const setItemsDropDown = (callback) => {
        setItems(callback(items))
    }

    return (
        <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={styles.text}>{`Data Value: ${stringVal}`}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                <Text style={styles.text}>{`Tare Value: ${tareVal}`}</Text>
                <TouchableHighlight style={{...styles.button2, backgroundColor: 'blue', marginLeft: 10}}
                                    onPress={() => writeProperty(value, 'Configuration Profile', 'System Zero')}
                >
                    <Text style={{
                        color: 'white',
                        padding: 10,
                        textAlign: 'center'
                    }}>Tare</Text>
                </TouchableHighlight>
                <TouchableHighlight style={{...styles.button2, backgroundColor: 'blue', marginLeft: 10}}
                                    onPress={() => writeProperty([0, 0, 0, 0], 'Configuration Profile', 'System Zero')}
                >
                    <Text style={{
                        color: 'white',
                        padding: 10,
                        textAlign: 'center'
                    }}>Tare 0</Text>
                </TouchableHighlight>
            </View>
            <View style={{flexDirection: 'row', marginVertical: '10%', alignItems: 'center'}}>
                <Text>Set frequency</Text>
                <DropDownPicker
                    open={open}
                    value={dropDownValue}
                    items={items}
                    setOpen={setOpenDropDown}
                    setValue={setValueDropDown}
                    setItems={setItemsDropDown}
                    containerStyle={{width: '50%', marginHorizontal: 10}}
                />
            </View>
        </View>
    )
}

export const styles = StyleSheet.create({
    button2: {
        backgroundColor: 'red',
        fontSize: 8,
        textAlign: 'center',
        color: 'white',
        padding: 2,
    },
    text: {
        color: 'black',
        fontSize: 20
    }
})

export default Configurations;
