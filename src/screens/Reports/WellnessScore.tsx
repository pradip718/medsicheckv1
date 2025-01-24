import React from 'react';
import {View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import {getScoreKey} from '../../../utils/methods';
import DonutChart from '../../components/Graphs/DonutChart';
import CustomText from '../../components/Text';
import {Wellness_Score_Content} from './data';

const RenderWellScoreTextContent = ({score}: {score: number}) => {
  const scoreKey = getScoreKey(score);

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
  const {languages} = useLanguageStore();
  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-full h-28">
        <DonutChart score={score} textClassName="text-4xl" />
        <CustomText className="text-white text-sm font-isidoraSemiBold absolute -bottom-8 left-0 right-0 text-center">
          {languages?.single_report_scores_title}
        </CustomText>
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
        <RenderWellScoreTextContent score={0} />
      </View>
      <View className=" w-[40%] h-[200px] tablet:h-[300px]">
        <RenderWellScreGraphContent score={score} />
      </View>
    </View>
  );
};

export default WellnessScore;
