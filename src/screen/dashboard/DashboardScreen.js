import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
    View,
    TouchableOpacity,
    Dimensions,
    NativeModules,
    NativeEventEmitter,
    Animated,
    Image,
    Text, SafeAreaView,FlatList
} from 'react-native';
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
import {ScrollView} from "react-native-gesture-handler";


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
                widget: 'sample',
            },
        ];
    }
}


type Item = {
    key: string;
    label: string;
};

let offSet = 0;

const Dashboard = () => {

    const [data, setData] = useState([]);
    const [data2, setData2] = useState([0]);
    const [change, setChange] = useState(false);
    const [value, setValue] = useState(0);
    const [activationDistance, setActivationDistance] = useState(50);
    const [editMode,setEditMode]=useState(true);


    const scrollOffsetY = useRef(new Animated.Value(0)).current;
    // console.log('scrollOffsetY:::::::::'+JSON.stringify(scrollOffsetY))
    const headerScrollHeight = scrollOffsetY.interpolate({
        inputRange: [0, H_SCROLL_DISTANCE],
        outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
        extrapolate: "clamp"
    });

    useEffect(async () => {
        // await getWidgetOrder();
        const dat = await dataOrder().then((res) => {
            return res
        });
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
        <SafeAreaView style={{flex: 1}} nestedScrollEnabled={true}>

            {/*<Animated.View*/}
            {/*    style={{*/}
            {/*        position: "absolute",*/}
            {/*        left: 0,*/}
            {/*        right: 0,*/}
            {/*        top: 0,*/}
            {/*        height: headerScrollHeight,*/}
            {/*        width: "100%",*/}
            {/*        overflow: "hidden",*/}
            {/*        zIndex: 999,*/}
            {/*        // STYLE*/}
            {/*        borderBottomColor: "#EFEFF4",*/}
            {/*        borderBottomWidth: 2,*/}
            {/*        padding: 10,*/}
            {/*        backgroundColor: "blue",*/}
            {/*        alignItems:'center',justifyContent:'center'*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Text style={{flex:1,textAlign:'center'}} adjustsFontSizeToFit={true}>Hi ! All</Text>*/}
            {/*</Animated.View>*/}

            {/*<ScrollView*/}
            {/*    onScroll={Animated.event([*/}
            {/*        {nativeEvent: {contentOffset: {y: scrollOffsetY}}}*/}
            {/*    ],{useNativeDriver: false})}*/}
            {/*    scrollEventThrottle={16}*/}
            {/*    scrollEnabled={true}*/}
            {/*>*/}
                <View style={{ flex: 1, alignItems: 'center'}}>

                    {editMode?(
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
                    ):(
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => `draggable-item-${item.key}`}
                        />
                    )}

                </View>
            {/*</ScrollView>*/}
        </SafeAreaView>
    );
};

export default Dashboard;


// import React, { useRef } from "react";
// import { View, Animated, Image, ScrollView, Text } from "react-native";
//
// const H_MAX_HEIGHT = 150;
// const H_MIN_HEIGHT = 52;
// const H_SCROLL_DISTANCE = H_MAX_HEIGHT - H_MIN_HEIGHT;
//
// const CollapsibleHeader = () => {
//     const scrollOffsetY = useRef(new Animated.Value(0)).current;
//     const headerScrollHeight = scrollOffsetY.interpolate({
//         inputRange: [0, H_SCROLL_DISTANCE],
//         outputRange: [H_MAX_HEIGHT, H_MIN_HEIGHT],
//         extrapolate: "clamp"
//     });
//
//     return (
//         <View style={{ flex: 1 }}>
//             <ScrollView
//                 onScroll={Animated.event([
//                     { nativeEvent: { contentOffset: { y: scrollOffsetY } } }
//                 ])}
//                 scrollEventThrottle={16}
//             >
//                 <View style={{ paddingTop: H_MAX_HEIGHT,flex:1 }}>
//                     {/** Page contant goes here **/}
//
//                     <View style={{ padding: 20 }}>
//                         <Text>React Native Collapsible Header</Text>
//                     </View>
//
//                     <View style={{ padding: 20, height: 200, backgroundColor: "red" }}>
//                         <Text>View 1</Text>
//                     </View>
//
//                     <View style={{ padding: 20, height: 200, backgroundColor: "yellow" }}>
//                         <Text>View 1</Text>
//                     </View>
//
//                     <View style={{ padding: 20, height: 200, backgroundColor: "green" }}>
//                         <Text>View 1</Text>
//                     </View>
//                 </View>
//             </ScrollView>
//
//             {
//                 /**
//                  * We put the header at the bottom of
//                  * our JSX or it will not take priority
//                  * on Android (for some reason, simply
//                  * setting zIndex does not work)
//                  **/
//             }
//             <Animated.View
//                 style={{
//                     position: "absolute",
//                     left: 0,
//                     right: 0,
//                     top: 0,
//                     height: headerScrollHeight,
//                     width: "100%",
//                     overflow: "hidden",
//                     zIndex: 999,
//                     // STYLE
//                     borderBottomColor: "#EFEFF4",
//                     borderBottomWidth: 2,
//                     padding: 10,
//                     backgroundColor: "blue"
//                 }}
//             >
//                 <Image
//                     source={{ uri: "https://via.placeholder.com/300" }}
//                     style={{ flex: 1 }}
//                     resizeMode={"contain"}
//                 />
//             </Animated.View>
//         </View>
//     )
// }
//
// export default CollapsibleHeader;
