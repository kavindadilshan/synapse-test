import * as servicesList from './uuidServices';
import {toBytes} from 'hex-my-bytes';

export const binConvertString = (binArr) => {
    return String.fromCharCode.apply(null, new Uint32Array(binArr));
};
export const string2Bin = (array) => {
    return String.fromCharCode.apply(String, array).replace(/\0/g, '');
};
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

export const DecodeHexStringToByteArray = function (hex) {
    return toBytes(hex);
};

export const unitConversion = (dataUnitRatio, calibrationUnitRation, dataValue) => {
    return Math.trunc((dataUnitRatio / calibrationUnitRation) * dataValue);
};