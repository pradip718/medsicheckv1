import React from 'react';
import {View} from 'react-native';
import {
  // PieChart,
  pieDataItem,
} from 'react-native-gifted-charts';
import DonutChart from '../../components/Graphs/DonutChart';
import CustomText from '../../components/Text';
import {WellnessScoreKey, Wellness_Score_Content} from './data';

const RenderWellScoreTextContent = ({score}: {score: number}) => {
  const scoreKey = Object.keys(Wellness_Score_Content).find(key =>
    key.includes('' + score),
  ) as WellnessScoreKey;

  return (
    <View>
      <CustomText className="text-white text-lg font-isidoraBold mt-10">
        {scoreKey ? Wellness_Score_Content[scoreKey].title : ''}
      </CustomText>
      <CustomText className="text-white text-base font-isidoraBold mt-2">
        {scoreKey ? Wellness_Score_Content[scoreKey].subTitle : ''}
      </CustomText>
      <CustomText className="text-white text-sm">
        {scoreKey ? Wellness_Score_Content[scoreKey].content : ''}
      </CustomText>
    </View>
  );
};

const RenderWellScreGraphContent = ({score}: {score: number}) => {
  let pieData: pieDataItem[] = [];
  let accumulatedValue = 0;

  [
    {value: 2, color: 'red'},
    {value: 2, color: 'orange'},
    {value: 2, color: 'yellow'},
    {value: 2, color: 'lightgreen'},
    {value: 2, color: 'green'},
  ].forEach(eachPieData => {
    accumulatedValue += eachPieData.value;
    if (accumulatedValue <= score) {
      pieData.push(eachPieData);
    } else {
      pieData.push({value: 2, color: 'rgba(50, 71, 161, 1)'});
    }
  });

  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-full">
        <DonutChart score={score} />
      </View>
    </View>
  );
};

type WellnessScoreProps = {
  score: number;
};

const WellnessScore = ({score}: WellnessScoreProps) => {
  return (
    <View className=" w-full pl-4 flex-row bg-[#0E253A] pb-10">
      <View className="flex-1">
        <RenderWellScoreTextContent score={score} />
      </View>
      <View className=" w-[40%] h-[200px] tablet:h-[300px]">
        <RenderWellScreGraphContent score={score} />
      </View>
    </View>
  );
};

export default WellnessScore;
