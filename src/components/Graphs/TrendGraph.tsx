import React from 'react';
import {StyleSheet, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {LinearGradient, Stop} from 'react-native-svg';
import {Stats} from '../../../types/jsons';
import {BOLD} from '../../constants/Fonts';
import CustomText from '../Text';

type TrendGraphProps = {
  data: {value: number; label: string}[];
  stats: Stats;
};

const TrendGraph = ({data = [], stats}: TrendGraphProps) => {
  const renderText = (label: string) => {
    return (
      <CustomText className="text-white text-xs text-center">
        {label}
      </CustomText>
    );
  };
  const modifiedData = data
    .map(item => {
      return {
        value: item.value ? item.value : 0,
        labelComponent: () => renderText(item.label),
      };
    })
    ?.slice(0, stats?.count)
    ?.reverse();

  const renderLinearGradientLine = () => {
    return (
      <LinearGradient id="ggrd" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={'rgba(0, 163, 94, 1)'} />
        <Stop offset="0.5" stopColor={'rgba(230, 233, 57, 1)'} />
        <Stop offset="1" stopColor={'rgba(255, 0, 0, 1)'} />
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <LineChart
        isAnimated
        showVerticalLines
        hideRules
        thickness={3}
        lineGradient
        lineGradientId="ggrd" // same as the id passed in <LinearGradient> below
        lineGradientComponent={renderLinearGradientLine}
        dataPointsColor={'white'}
        verticalLinesColor="rgba(34, 45, 75, 1)"
        areaChart
        data={modifiedData}
        startFillColor="rgba(0, 163, 94, 0.19)"
        startOpacity={0.8}
        endFillColor="rgba(255, 107, 107, 0.19)"
        endOpacity={0.3}
        height={128}
        adjustToWidth
        yAxisTextStyle={styles.yAxisTextStyle}
        xAxisColor="white"
        yAxisColor="white"
        yAxisOffset={stats?.min}
        maxValue={Math.min(stats?.max - stats?.min, 100 - stats?.min)}
        scrollToEnd={modifiedData?.length > 2}
        // scrollToIndex={stats?.count}
      />
    </View>
  );
};

export default TrendGraph;

const styles = StyleSheet.create({
  container: {
    maxHeight: 128,
  },
  yAxisTextStyle: {
    color: 'white',
    fontSize: 10,
    fontFamily: BOLD,
  },
});
