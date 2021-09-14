import React from 'react';
import {Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const minValue = '';
const maxValue = 'MWL'

function* yLabel() {
    yield* [minValue, '', maxValue];
}




const Chart=(props)=>{

    const d = props.data;
    const datapoints = d.map((datapoint) => datapoint - minValue - 1);

    const data = {
        datasets: [
            {
                data: datapoints,
            },
        ],
    };

    const screenWidth = Dimensions.get('window').width;
    const yLabelIterator = yLabel();

    return (

            <LineChart
                data={data}
                segments={2}
                width={Dimensions.get('window').width/100*95} // from react-native
                height={220}
                // yAxisLabel="(MWL)"
                // yLabelsOffset={1}
                // yAxisInterval={1} // optional, defaults to 1
                // verticalLabelRotation={0}
                chartConfig={{
                    backgroundColor: '#FCFCFC',
                    backgroundGradientFrom: '#003B5C',
                    backgroundGradientTo: '#003B5C',
                    decimalPlaces: 1, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 16,

                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#ffa726',
                    },
                    barPercentage: 0.001,
                    barRadius: 10000000,
                    useShadowColorFromDataset:true,
                    formatYLabel: () => yLabelIterator.next().value,
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                bezier
                formatYLabel={() => yLabelIterator.next().value}
                withDots={false}
                hideLegend={false}
                withHorizontalLabels={true}
                fromZero={true}
                withInnerLines={true}
                withOuterLines={true}
                withHorizontalLines={true}
                withVerticalLabels={true}
            />

    );
}

export default Chart;
