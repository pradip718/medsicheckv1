import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Config} from '../../../types/jsons';
import Icon from '../Icon';
import CustomText from '../Text';

interface ReportScaleProps {
  min: number;
  max: number;
  value: number;
  total: number;
  scaleCriteria: {
    scale: Pick<Config, 'scale'>;
    measuredValue: number;
  };
}

const ReportScale = ({scaleCriteria}: ReportScaleProps) => {
  if (!scaleCriteria) {
    return;
  }
  const {scale, measuredValue: value} = scaleCriteria;
  const {range: overall, min, max} = scale || {};

  if (!overall || min === undefined || max === undefined) {
    return;
  }

  const percentage = ((value - overall[0]) / (overall[1] - overall[0])) * 100;

  const minPercentage = ((min - overall[0]) / (overall[1] - overall[0])) * 100;
  const maxPercentage = ((max - overall[0]) / (overall[1] - overall[0])) * 100;

  const lowerBound = ((min - overall[0]) / (overall[1] - overall[0])) * 100;
  const upperBound = ((max - overall[0]) / (overall[1] - overall[0])) * 100;

  const greenStart = lowerBound / 100;
  const greenEnd = upperBound / 100;

  let locations = [
    0,
    lowerBound / 100,
    lowerBound / 100,
    lowerBound / 100,
    greenStart,
    greenEnd,
    upperBound / 100,
    upperBound / 100,
    upperBound / 100,
    1,
  ];

  if (!max) {
    locations = [0, 0.005, 1, 0, 0, 0];
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          marginLeft: `${percentage}%`,
        }}
        className="w-4">
        <View className="-ml-[8]">
          <Icon name="marker" size={14} color="#3652CD" />
        </View>
      </View>
      <LinearGradient
        colors={[
          'rgba(255, 126, 121, 1)',
          'rgba(255, 147, 0, 1)',
          'rgba(255, 208, 2, 1)',
          'rgba(24, 195, 169, 1)',
          'rgba(4, 162, 127, 1)',
          'rgba(4, 162, 127, 1)',
          'rgba(24, 195, 169, 1)',
          'rgba(255, 208, 2, 1)',
          'rgba(255, 147, 0, 1)',
          'rgba(255, 126, 121, 1)',
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        locations={locations}
        className=" relative h-[8] rounded-md overflow-visible">
        <View
          className="absolute"
          style={{
            left: `${minPercentage}%`,
          }}>
          <View className="w-1 h-3 rounded-md bg-black top-[-2]" />
          <CustomText className=" text-xs font-isidoraMedium">{min}</CustomText>
        </View>
        <View
          className="absolute"
          style={{
            left: `${maxPercentage}%`,
          }}>
          <View className="w-1 h-3 rounded-md bg-black top-[-2]" />
          <CustomText className=" text-xs font-isidoraMedium">{max}</CustomText>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ReportScale;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
});
