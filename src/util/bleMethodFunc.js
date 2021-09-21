import BleManager from "react-native-ble-manager";
import {NativeEventEmitter, NativeModules} from "react-native";

let commonUUIDRef = `-a0e8-11e6-bdf4-0800200c9a66`

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const startNotification = async (peripheralId, serviceUUID, characteristicUUID) => {
    return await BleManager.startNotification(peripheralId, serviceUUID + commonUUIDRef, characteristicUUID + commonUUIDRef);
}

export const stopNotification = async (peripheralId, serviceUUID, characteristicUUID) => {
    return await BleManager.stopNotification(peripheralId, serviceUUID+ commonUUIDRef, characteristicUUID+ commonUUIDRef);
}

export const deviceScan = async () => {
    return await BleManager.scan([], 3, true)
}

export const retrieveConnections = async () => {
    return await BleManager.getConnectedPeripherals([])
}

export const getDiscoveredPeripherals = async () => {
    return await BleManager.getDiscoveredPeripherals()
}

export const disconnectDevice = async (peripheralId) => {
    return await BleManager.disconnect(peripheralId, true)
}

export const connectDevice = async (peripheralId) => {
    return await BleManager.connect(peripheralId)
}

export const retrieveServices = async (peripheralId) => {
    return await BleManager.retrieveServices(peripheralId)
}

export const writeProperty = async (peripheralId, serviceUUID, characteristicUUID,data) => {
    return await BleManager.write(peripheralId, serviceUUID+ commonUUIDRef, characteristicUUID+ commonUUIDRef, data)
}

export const checkState = () => {
    return BleManager.checkState();
}

export const configBLE = () => {
    return BleManager.start({forceLegacy: true});
}

export const readProperty = async (peripheralId, serviceUUID, characteristicUUID) => {
    return await BleManager.read(peripheralId, serviceUUID+ commonUUIDRef, characteristicUUID+ commonUUIDRef)
}


export class bleManagerEmitters {
    static addListener(event) {
        return bleManagerEmitter.addListener(event);
    }

    static removeListener(event) {
        return bleManagerEmitter.removeListener(event);
    }
}
