import React from 'react';
import {Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';




const Chart=(props)=>{
    const minValue = 80;

    function* yLabel() {
        yield* [minValue, 90, 100];
    }

    const datapoints = props.data.map(
        (datapoint) => datapoint - minValue - 1,
    );

    const yLabelIterator = yLabel();

    return(
        <LineChart
            data={{
                datasets: [
                    {
                        data: props.data,
                    },
                ],
            }}
            width={Dimensions.get('window').width/100*95} // from react-native
            height={220}
            segments={1}
            yAxisLabel="MWL"
            yLabelsOffset={1}
            yAxisInterval={1} // optional, defaults to 1
            verticalLabelRotation={0}
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
            bezier
            style={{
                marginVertical: 8,
                borderRadius: 16,
            }}
            withDots={false}
            hideLegend={false}
            withHorizontalLabels={true}
            fromZero={true}
            withInnerLines={true}
            withOuterLines={true}
            withHorizontalLines={false}
            withVerticalLabels={true}
        />
    )
}

export default Chart;
