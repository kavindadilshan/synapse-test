import * as servicesList from './uuidServices';
import {toBytes, toHex} from 'hex-my-bytes';
import {stringToBytes} from "convert-string";
import {Alert} from "react-native";
import {deviceConfigurations} from "./constance";

export const binConvertString = (binArr) => {
    return String.fromCharCode.apply(null, new Uint32Array(binArr));
};
export const string2Bin = (array) => {
    return String.fromCharCode.apply(String, array).replace(/\0/g, '');
};

/**
 * String Convertor
 * @param binArr
 * @returns {*}
 */
export const stringAsUInt32BE = (binArr) => {
    return binArr[0] * 16777216 + binArr[1] * 65536 + binArr[2] * 256 + binArr[3];
    // return String.fromCharCode.apply(null, new Uint32Array(binArr));
};
export const stringAsUInt32BE_ = (binArr) => {
    let buffer = new ArrayBuffer(4);
    let uint8View = new Uint8Array(buffer);
    uint8View[0] = binArr[0];
    uint8View[1] = binArr[1];
    uint8View[2] = binArr[2];
    uint8View[3] = binArr[3];
    return new DataView(buffer).getUint32(0, false);
};
export const stringAsUInt16BE = (binArr) => {
    let buffer = new ArrayBuffer(2);
    let uint8View = new Uint8Array(buffer);
    uint8View[0] = binArr[0];
    uint8View[1] = binArr[1];
    return new DataView(buffer).getUint16(0, false);
};
export const stringAsUInt8BE = (binArr) => {
    let buffer = new ArrayBuffer(1);
    let uint8View = new Uint8Array(buffer);
    uint8View[0] = binArr[0];
    return new DataView(buffer).getUint8(0, false);
};
export const stringAsFloat64 = (binArr) => {
    let buffer = new ArrayBuffer(4);
    let uint8View = new Uint8Array(buffer);
    uint8View[0] = binArr[0];
    uint8View[1] = binArr[1];
    uint8View[2] = binArr[2];
    uint8View[3] = binArr[3];
    return new DataView(buffer).getFloat64(0, false);
};

export const stringAsFloat32 = (binArr) => {
    let buffer = new ArrayBuffer(4);
    let uint8View = new Uint8Array(buffer);
    uint8View[0] = binArr[0];
    uint8View[1] = binArr[1];
    uint8View[2] = binArr[2];
    uint8View[3] = binArr[3];
    return new DataView(buffer).getFloat32(0, false);
};

/**
 * Byte Array Convertor
 * @param value
 * @returns {Uint8Array}
 */
export const byteAsFloat32 = (value) => {
    let buffer=new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setFloat32(0, value);
    return new Uint8Array(buffer);
};

export const byteAsFloat64 = (value) => {
    let buffer=new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setFloat64(0, value);
    return new Uint8Array(buffer);
};

export const byteAsUInt8BE = (value) => {
    let buffer=new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setUint8(0, value);
    return new Uint8Array(buffer);
};

export const byteAsUInt16BE = (value) => {
    let buffer=new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setUint16(0, value);
    return new Uint8Array(buffer);
};

export const byteAsUInt32BE_ = (value) => {
    let buffer=new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setUint32(0, value);
    return new Uint8Array(buffer);
};

export const retreiveOptimizeData = (format, result) => {
    if (format === servicesList.UINT_32) {
        return stringAsUInt32BE(result);
    }
    if (format === servicesList.UINT_8) {
        return stringAsUInt8BE(result);
    }
    if (format === servicesList.UINT_16) {
        return stringAsUInt16BE(result);
    }
    if (format === servicesList.STRING) {
        return binConvertString(result);
    }
    if (format === servicesList.FLOAT) {
        return stringAsFloat32(result);
    }
};

export const hexDecimalToByteArray = function (hex) {
    return toBytes(hex);
};

export const ByteArrayToHexDecimal = function (value) {
    return toHex(value)
}

export const decimalToBytesArray = function (long) {
    var byteArray = [0, 0, 0, 0];

    for (var index = 0; index < byteArray.length; index++) {
        var byte = long & 0xff;
        byteArray [index] = byte;
        long = (long - byte) / 256;
    }

    return byteArray;
}

export const unitConversion = (dataUnitRatio, calibrationUnitRation, dataValue) => {
    return Math.trunc((dataUnitRatio / calibrationUnitRation) * dataValue);
};

export const findDeviceServices = (serviceName, characteristicName) => {
    let selectObj = servicesList.services.find(obj => obj.serviceName === serviceName);
    let characteristicObj = selectObj.servicesList.find(obj => obj.name === characteristicName);

    return {service: selectObj, characteristic: characteristicObj}
}
