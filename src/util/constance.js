import {Linking} from "react-native";

export const StorageStrings = {
    PERIPHERAL_ID: 'PERIPHERAL_ID',
    WIDGET_ORDER: 'WIDGET_ORDER'
}
export const BATTERY_FULL_VOLTAGE = 3.00

export const AlertMessages = {
    BLUETOOTH_REQ_TILE: 'Bluetooth is not enabled',
    BLUETOOTH_REQ_DESC: 'You have to enable bluetooth to scan for device!.Please go to settings and enable bluetooth'
}

export const deviceConfigurations = {
    // BLE_IOS_SETTING: Linking.openURL('App-Prefs:Bluetooth'),
    // BLE_ANDROID_SETTING: Linking.openSettings()
}
