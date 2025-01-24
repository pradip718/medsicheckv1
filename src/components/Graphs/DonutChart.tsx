import React from 'react';
import {Image, View} from 'react-native';
import {twMerge} from 'tailwind-merge';
import {getImgBasedOnScore} from '../../../utils/methods';
import CustomText from '../Text';

interface DonutChartProps {
  score: number;
  textClassName?: string;
}

const DonutChart = ({score, textClassName}: DonutChartProps) => {
  return (
    <View className="flex-1 items-center justify-center w-full">
      <Image
        source={getImgBasedOnScore(score)}
        className="w-[80%]"
        resizeMode="contain"
      />

      <View className="absolute">
        <CustomText
          className={twMerge(
            'text-white font-isidoraBold text-xl text-center',
            textClassName,
          )}>
          {score}
        </CustomText>
      </View>
    </View>
  );
};

export default DonutChart;
