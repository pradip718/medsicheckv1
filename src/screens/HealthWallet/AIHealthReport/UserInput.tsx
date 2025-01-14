import {NavigationProp, useNavigation} from '@react-navigation/native';
import _ from 'lodash';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import EmptyScreen from '../../../components/EmptyScreen';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import {useGetAIReportDetails} from '../../../hooks/api/report';
import customColor from '../../../theme/customColor';

const UserInput = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {data: aiReportDetails} = useGetAIReportDetails({
    enabled: false,
  });

  const questionnaire = aiReportDetails?.[0]?.payload?.questionnaire || [];
  const scanData = aiReportDetails?.[0]?.payload?.scan_data || '';

  const navigateToAIQuestionnaire = () => {
    navigation.navigate('AIQuestionnaireDetails', {
      questionnaire: aiReportDetails?.[0]?.payload?.questionnaire || [],
    });
  };
  const navigateToAIScanDetails = () => {
    navigation.navigate('AIScanDetails', {
      report: aiReportDetails?.[0]?.payload?.scan_data,
    });
  };

  if (_.isEmpty(questionnaire) && _.isEmpty(scanData)) {
    return <EmptyScreen hideNavbar />;
  }

  return (
    <View className="p-4 bg-white flex-grow">
      <CustomText className="text-base font-isidoraBold text-black">
        {languages?.user_inputs}
      </CustomText>

      {!_.isEmpty(questionnaire) && (
        <TouchableOpacity
          className="border rounded-full w-full px-4 py-2 flex-row justify-between items-center mt-4"
          onPress={navigateToAIQuestionnaire}>
          <CustomText className="text-base font-isidoraMedium text-black">
            {languages?.input_questionnaire_details}
          </CustomText>
          <Icon name="chevron-right" size={20} color={customColor.black} />
        </TouchableOpacity>
      )}
      {!_.isEmpty(scanData) && (
        <TouchableOpacity
          className="border rounded-full w-full px-4 py-2 flex-row justify-between items-center mt-4"
          onPress={navigateToAIScanDetails}>
          <CustomText className="text-base font-isidoraMedium text-black">
            {languages?.input_scan_details}
          </CustomText>
          <Icon name="chevron-right" size={20} color={customColor.black} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserInput;
