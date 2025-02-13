import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import ToolTipWalkthrough from '../../../components/CustomCopilot/ToolTipWalkthrough';
import CustomText from '../../../components/Text';

const SmartReports = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const navigateToSmartReports = async () => {
    navigation.navigate('SmartReport');
  };

  const navigateToHealthRisks = async () => {
    navigation.navigate('HealthRisks');
  };

  return (
    <View className="flex-row">
      <View className="w-[48%] h-[160px] ">
        <TouchableOpacity
          className="bg-[#A1AAFF] rounded-2xl flex-grow justify-end items-center h-full"
          activeOpacity={0.4}
          onPress={navigateToSmartReports}>
          <ToolTipWalkthrough walkthroughName={'dashboard_personalised_report'}>
            <Image
              source={require('../../../../assets/images/analyse_scan.png')}
              className="h-[140]"
              resizeMode="contain"
            />
          </ToolTipWalkthrough>
        </TouchableOpacity>
        <CustomText className="text-base text-yankeesBlue font-isidoraMedium text-center py-2">
          {languages?.smart_report_title}
        </CustomText>
      </View>

      <View className="w-[48%] ml-[4%] h-[160px]">
        <TouchableOpacity
          className="rounded-2xl flex-grow items-center h-full"
          activeOpacity={0.4}
          onPress={navigateToHealthRisks}>
          <Image
            source={require('../../../../assets/images/interpret_report.png')}
            className="h-[140] w-full grow"
            resizeMode="stretch"
          />
        </TouchableOpacity>
        <CustomText className="text-base text-yankeesBlue font-isidoraMedium text-center py-2">
          {languages?.health_risk}
        </CustomText>
      </View>
    </View>
  );
};

export default SmartReports;
