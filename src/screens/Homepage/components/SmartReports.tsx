import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import ToolTipWalkthrough from '../../../components/CustomCopilot/ToolTipWalkthrough';
import CustomText from '../../../components/Text';
import {useGetLabReportQuestionnaire} from '../../../hooks/api/report';
import useGetAIQuestionnaire from '../../../hooks/api/useGetAIQuestionnaire';
import useFullPageLoader from '../../../hooks/useFullPageLoader';

const SmartReports = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {showLoader, hideLoader} = useFullPageLoader();

  const {refetch: getAIQuestions} = useGetAIQuestionnaire({
    type: 'latest',
    gcTime: 0,
    staleTime: 0,
    enabled: false,
  });

  const {refetch: getLabReportQuestions} = useGetLabReportQuestionnaire({
    type: 'latest',
    gcTime: 0,
    staleTime: 0,
    enabled: false,
  });

  const navigateToPersonalizedAI = async () => {
    showLoader();
    await getAIQuestions();
    navigation.navigate('PersonalisedAI');
    hideLoader();
  };
  const navigateToInterpretReport = async () => {
    showLoader();
    await getLabReportQuestions();
    navigation.navigate('LabReport');
    hideLoader();
  };

  return (
    <View className="flex-row">
      <View className="w-[48%] h-[160px] ">
        <TouchableOpacity
          className="bg-[#A1AAFF] rounded-2xl flex-grow justify-end items-center h-full"
          activeOpacity={0.4}
          onPress={navigateToPersonalizedAI}>
          <ToolTipWalkthrough walkthroughName={'dashboard_personalised_report'}>
            <Image
              source={require('../../../../assets/images/analyse_scan.png')}
              className="h-[140]"
              resizeMode="contain"
            />
          </ToolTipWalkthrough>
        </TouchableOpacity>
        <CustomText className="text-base text-yankeesBlue font-isidoraMedium text-center py-2">
          {languages?.analysis_scan_report}
        </CustomText>
      </View>
      <View className="w-[48%] ml-[4%] h-[160px]">
        <TouchableOpacity
          className=" bg-[#FFCD86] rounded-2xl flex-grow justify-center items-center h-full"
          activeOpacity={0.4}
          onPress={navigateToInterpretReport}>
          <Image
            source={require('../../../../assets/images/interpret_report.png')}
            className="w-[131]"
            resizeMode="contain"
          />
        </TouchableOpacity>
        <CustomText className="text-base text-yankeesBlue font-isidoraMedium text-center py-2">
          {languages?.interpret_lab_reports}
        </CustomText>
      </View>
    </View>
  );
};

export default SmartReports;
