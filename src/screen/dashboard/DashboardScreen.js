import React, {useState, useCallback, useEffect} from 'react';
import {View, TouchableOpacity, Text, Dimensions, NativeModules, NativeEventEmitter} from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
} from 'react-native-draggable-flatlist';
import BleManager from 'react-native-ble-manager';
import * as commonFunc from '../../util/commonFunc';
import Chart from '../../component/Chart';
import * as unitServiceList from '../../util/unitServiceFunction';
import * as servicesList from '../../util/uuidServices';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {StorageStrings} from "../../util/constance";


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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
                widget: 'sample',
            },
        ];
    }
}



type Item = {
    key: string;
    label: string;
};

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([0]);
    const [change, setChange] = useState(false);
    const [value, setValue] = useState(0);

    useEffect(async () => {
        // await getWidgetOrder();
        const dat= await dataOrder().then((res)=>{return res});
        setData(dat)
        const peripheralId = await AsyncStorage.getItem(StorageStrings.PERIPHERAL_ID);
        await BleManager.startNotification(peripheralId, `a9712440-a0e8-11e6-bdf4-0800200c9a66`, `a9712442-a0e8-11e6-bdf4-0800200c9a66`);

        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({value}) => notify(value));

        return function cleanup() {
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', ({value}) => notify(value));
        }

        // await notificationHandler();
    }, []);

    const notify = (value) => {
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

    const notificationHandler = async () => {
        setInterval(() => {
            BleManager.read(
                'C4:87:49:36:37:00',
                `a9712440-a0e8-11e6-bdf4-0800200c9a66`,
                `a9712442-a0e8-11e6-bdf4-0800200c9a66`,
            ).then(res => {
                let dataValue = Number(commonFunc.stringAsFloat32(res));

                // console.log('newtons:::::::::::::::::::::::::::::::::::::::::::::::::::'+commonFunc.stringAsFloat32(res));

                let convertedVal = commonFunc.unitConversion(dataUnit.ratio, calibrationUnit.ratio, dataValue);

                // console.log('pounds force::::::::::::::::::::::::::::::::::::::::::'+convertedVal)

                let list = data2;
                setChange(true);
                let index = convertedVal;
                list.push(index / 1000);
                setData2(list.slice(Math.max(list.length - 20, 0)));
                setValue(index);
                setChange(false);
            })
                .catch(err => console.log(err));
        }, 1000);

    };

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
                    <View style={{width: '95%', backgroundColor: '#C7C7C9C7', paddingVertical: 30}}>
                        <Text style={{
                            color: 'black',
                            fontSize: 55,
                            textAlign: 'center',
                        }}>{`${value} ${dataUnit.symbol}`}</Text>
                    </View>
                );
            case 'sample':
                return (
                    <View style={{width: '95%', backgroundColor: '#C7C7C9C7', paddingVertical: 30}}>
                        <Text style={{color: 'black', fontSize: 55, textAlign: 'center'}}>Sample Widget</Text>
                    </View>
                );
        }
    };

    return (
        <View style={{flex: 1}}>
            <DraggableFlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => `draggable-item-${item.key}`}
                onDragEnd={({data}) => {
                    setData(data);
                    setWidgetOrder(data);
                }}
            />

        </View>
    );
};

export default Dashboard;
