import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';

const ReportWellnessScore = ({score}: {score: number}) => {
  const {languages} = useLanguageStore();
  return (
    <LinearGradient
      colors={['rgba(30, 49, 128, 1)', 'rgba(30, 49, 128, 0.86)']}
      className="py-6 px-8 justify-between flex-row">
      <CustomText className="text-white text-2xl font-isidoraBold">
        {languages?.wellness_score_heading}
      </CustomText>

      <CustomText className="text-white text-2xl font-isidoraBold">
        {score}/100
      </CustomText>
    </LinearGradient>
  );
};

export default ReportWellnessScore;
