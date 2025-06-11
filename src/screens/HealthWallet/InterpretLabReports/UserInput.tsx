import {NavigationProp, useNavigation} from '@react-navigation/native';
import _ from 'lodash';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {downloadFile, onShareFile} from '../../../../utils/methods';
import EmptyScreen from '../../../components/EmptyScreen';
import Icon from '../../../components/Icon';
import CustomText from '../../../components/Text';
import {useGetLabReportDetails} from '../../../hooks/api/report';
import customColor from '../../../theme/customColor';

const UserInput = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {data: labReportDetails} = useGetLabReportDetails({
    enabled: false,
  });

  const questionnaire = labReportDetails?.[0]?.payload?.questionnaire || [];
  const scanData = labReportDetails?.[0]?.payload?.scan_data ?? '';
  const fileLink = labReportDetails?.[0]?.file_link ?? '';
  const isValidUrl = !!fileLink;

  const navigateToAIQuestionnaire = () => {
    navigation.navigate('LabQuestionnaireDetails', {
      questionnaire: questionnaire,
    });
  };
  const navigateToAIScanDetails = () => {
    navigation.navigate('LabScanDetails', {
      report: labReportDetails?.[0]?.payload?.scan_data,
    });
  };
  const navigateToViewReport = () => {
    navigation.navigate('ViewReport', {
      uri: fileLink,
    });
  };

  if (_.isEmpty(questionnaire) && _.isEmpty(scanData) && _.isEmpty(fileLink)) {
    return <EmptyScreen hideNavbar />;
  }

  return (
    <View className="p-4 bg-white h-full">
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
      {!_.isEmpty(fileLink) && (
        <TouchableOpacity
          className="flex-row justify-between items-center space-x-2 border rounded-full w-full px-4  mt-4"
          onPress={navigateToViewReport}>
          <CustomText className="text-base font-isidoraMedium text-black">
            {languages?.lab_file_download}
          </CustomText>
          <View className="flex-row">
            <TouchableOpacity
              className="p-4 items-center justify-center"
              disabled={!isValidUrl}
              onPress={() =>
                downloadFile(
                  fileLink,
                  'Miscellaneous Files',
                  'lr_report_download',
                )
              }>
              <Icon
                name="download"
                size={18}
                color={
                  !isValidUrl
                    ? customColor.lightGrey
                    : customColor.ultramarineBlue
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-4 items-center justify-center"
              disabled={!isValidUrl}
              onPress={() =>
                onShareFile(fileLink, 'lab_report', 'lr_report_share')
              }>
              <Icon
                name="share"
                size={16}
                color={
                  !isValidUrl
                    ? customColor.lightGrey
                    : customColor.ultramarineBlue
                }
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserInput;
