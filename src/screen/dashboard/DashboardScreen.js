import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
    View,
    TouchableOpacity,
    Dimensions,
    NativeModules,
    NativeEventEmitter,
    Animated,
    Image,
    Text, SafeAreaView, FlatList, StyleSheet
} from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
} from 'react-native-draggable-flatlist';
import BleManager from 'react-native-ble-manager';
import * as commonFunc from '../../util/commonFunc';
import Chart from '../../component/Chart';
import * as unitServiceList from '../../util/unitServiceFunction';
import * as bleMethodFunc from '../../util/bleMethodFunc';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BATTERY_FULL_VOLTAGE, StorageStrings} from "../../util/constance";
import {ScrollView} from "react-native-gesture-handler";
import * as servicesList from "../../util/uuidServices";
import {connect} from "react-redux";


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const H_MAX_HEIGHT = 150;
const H_MIN_HEIGHT = 52;
const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;

const NUM_ITEMS = 10;
let dataUnit = unitServiceList.unitService.find(obj => obj.unit === 'pounds force');
let calibrationUnit = unitServiceList.unitService.find(obj => obj.unit === 'newtons');


async function dataOrder() {
    const widgetOrder = await AsyncStorage.getItem(StorageStrings.WIDGET_ORDER)
    if (widgetOrder) {
        return JSON.parse(widgetOrder)
    } else {
        return [
            {
                key: `item-1`,
                label: '1',
                widget: 'chart',
            },
            {
                key: `item-2`,
                label: '2',
                widget: 'data value',
            },
            {
                key: `item-3`,
                label: '3',
                widget: 'battery',
            },
            {
                key: `item-4`,
                label: '4',
                widget: 'data rate',
            },
        ];
    }
}


type Item = {
    key: string;
    label: string;
};

let offSet = 0;

const Dashboard = ({navigation, loading}) => {
    const isMountedRef = useRef(null);
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([0]);
    const [change, setChange] = useState(false);
    const [value, setValue] = useState(0);
    const [activationDistance, setActivationDistance] = useState(50);
    const [editMode, setEditMode] = useState(true);
    const [batteryCapacity, setBatteryCapacity] = useState(0);
    const [dataArray,setDataArray]=useState();


    const scrollOffsetY = useRef(new Animated.Value(0)).current;
    // console.log('scrollOffsetY:::::::::'+JSON.stringify(scrollOffsetY))
    const headerScrollHeight = scrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
        extrapolate: "clamp"
    });

    useEffect(async () => {
        const dat = await dataOrder().then((res) => {
            return res
        });
        setData(dat)

        isMountedRef.current = true;

        if (isMountedRef.current) {
            console.log(':::::::::::::::::::::::::::::::::::::::::::::::::mount')
        }

        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        const UUID = commonFunc.findDeviceServices('Data Profile', 'Data Value')
        await bleMethodFunc.startNotification(peripheralId, UUID.service.serviceId, UUID.characteristic.id);
        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({value}) => notify(value));

        const BatteryThreshold = commonFunc.findDeviceServices('Configuration Profile', 'Battery Value')
        await readProperty(peripheralId, BatteryThreshold);

        // return async function cleanup() {
        //     isMountedRef.current = false
        //     bleMethodFunc.bleManagerEmitters.removeListener('BleManagerDidUpdateValueForCharacteristic');
        //
        //     const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        //     const UUID = commonFunc.findDeviceServices('Data Profile', 'Data Value');
        //     await bleMethodFunc.startNotification(peripheralId, UUID.service.serviceId, UUID.characteristic.id);
        // }

        return (async () => {
            isMountedRef.current = false
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', ({value}) => notify(value));

            const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
            const UUID = commonFunc.findDeviceServices('Data Profile', 'Data Value');
            await bleMethodFunc.stopNotification(peripheralId, UUID.service.serviceId, UUID.characteristic.id);
        })

    }, []);

    const notify = (value) => {
        setDataArray(value);
        let dataValue = Number(commonFunc.stringAsFloat32(value));
        let convertedVal = commonFunc.unitConversion(dataUnit.ratio, calibrationUnit.ratio, dataValue);
        let list = data2;
        setChange(true);
        let index = convertedVal;
        list.push(index / 1000);
        setData2(list.slice(Math.max(list.length - 20, 0)));
        setValue(index);
        setChange(false);
    };

    const readProperty = async (peripheralId, UUID) => {
        let batteryCapacity;
        await bleMethodFunc.readProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id)
            .then((res) => {
                switch (UUID.characteristic.format) {
                    case "Float":
                        batteryCapacity = commonFunc.stringAsFloat32(res).toFixed(2);
                        break;
                    default:
                        break;
                }
                setBatteryCapacity(batteryCapacity)
            })
    }

    const writeProperty = async () => {
        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        const UUID = commonFunc.findDeviceServices('Configuration Profile', 'System Zero')

        await bleMethodFunc.writeProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id,dataArray)
            .then((res) => {
                console.log('saved')
            })
            .catch(err => console.log(err))

        await bleMethodFunc.readProperty(peripheralId, UUID.service.serviceId, UUID.characteristic.id)
            .then((res) => {console.log('string val::::::'+commonFunc.stringAsUInt32BE(res))})
    }


    const renderItem = useCallback(
        ({item, index, drag, isActive}: RenderItemParams<Item>) => {
            return (
                <TouchableOpacity
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginVertical: 10,
                    }}
                    onLongPress={drag}
                    onPress={() => writeProperty()}
                >
                    {componentType(item.widget)}
                </TouchableOpacity>
            );
        },
    );

    const setWidgetOrder = async (order) => {
        console.log('set.................')
        console.log(order)
        await AsyncStorage.setItem(StorageStrings.WIDGET_ORDER, JSON.stringify(order))
    }

    const componentType = (type) => {
        switch (type) {
            case 'chart':
                return (
                    <Chart data={data2}/>
                );
            case 'data value':
                return (
                    <View style={styles.flatListContainer}>
                        <Text style={styles.mainTitle}>{`${value} ${dataUnit.symbol}`}</Text>
                    </View>
                );
            case 'battery':
                return (
                    <View style={styles.flatListContainer}>
                        <Text
                            style={styles.mainTitle}>{`${((batteryCapacity / BATTERY_FULL_VOLTAGE) * 100).toFixed(0)} %`}</Text>
                        <Text>{`battery voltage : ${batteryCapacity}V`}</Text>
                    </View>
                );
            case 'data rate':
                return (
                    <View style={styles.flatListContainer}>
                        <Text style={styles.mainTitle}>data rate</Text>
                    </View>
                )
        }
    };

    return (
        <SafeAreaView style={{flex: 1}} nestedScrollEnabled={true}>
            <View style={{flex: 1, alignItems: 'center'}}>
                {editMode ? (
                    <DraggableFlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `draggable-item-${item.key}`}
                        onDragEnd={({data}) => {
                            setData(data);
                            setWidgetOrder(data);
                        }}
                        autoscrollThreshold={16}
                        containerStyle={{width: '95%'}}
                        // onScrollOffsetChange={(offsetY) => console.log(offsetY)}
                        activationDistance={10}
                        dragItemOverflow={true}
                    />
                ) : (
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `draggable-item-${item.key}`}
                    />
                )}

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainTitle: {
        color: 'black',
        fontSize: 55
    },
    flatListContainer: {
        width: '95%',
        backgroundColor: '#C7C7C9C7',
        paddingVertical: 30,
        alignItems: 'center'
    }
})

const mapStateToProps = (state) => ({
    loading: state.user.loading,
});

const mapDispatchToProps = dispatch => {
    return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
