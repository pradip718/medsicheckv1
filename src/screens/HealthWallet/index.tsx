import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MotiTransitionProp, StyleValueWithReplacedTransforms, View} from 'moti';
import React from 'react';
import {Image, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {Easing} from 'react-native-reanimated';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import useVoiceScanStore from '../../../store/voiceScanStore';
import {isVoiceScanReport} from '../../../types/api_response';
import {MainStackParamList} from '../../../types/navigation';
import {shouldGoToVoiceScan} from '../../../utils/navigation';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {
  useGetAIReport,
  useGetLabReportList,
  useGetLabReportQuestionnaire,
  useGetMiscellanouseFileDetails,
} from '../../hooks/api/report';
import useGetAIQuestionnaire from '../../hooks/api/useGetAIQuestionnaire';
import useGetUserReading from '../../hooks/api/useGetUserReading';
import {
  useGetUserVoiceReportList,
  useVoiceReportDetailMutation,
} from '../../hooks/api/voiceScan';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';
import customColor from '../../theme/customColor';
import {HEALTH_WALLET_CATEGORY_LIST} from './data';
import {HealthWalletCategory} from './type';

const HealthWallet = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {setReportDetail} = useVoiceScanStore();

  const {startScan} = usePrepareFacescan();

  const {data: reportData, isFetching: isUserReadingFetching} =
    useGetUserReading();
  const {data: voiceScanReportData, isFetching: isUserVoiceReportFetching} =
    useGetUserVoiceReportList();
  const {data: aiReportData, isFetching: isAiReportListFetching} =
    useGetAIReport();
  const {data: healthWalletReportList, isFetching: isHealthReportListFetching} =
    useGetLabReportList();
  const {data: miscellaneousFiles, isFetching: isMiscellaneousFilesFetching} =
    useGetMiscellanouseFileDetails();

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

  const {mutateAsync: getVoiceReportDetail} = useVoiceReportDetailMutation({
    onMutate: showLoader,
    onSettled: hideLoader,
    onSuccess: reportDetail => {
      if (isVoiceScanReport(reportDetail)) {
        setReportDetail(reportDetail);
        navigation.navigate('VoiceScanReport', {
          session_id:
            voiceScanReportData?.data?.reading_data?.[0]?.session_id ?? '',
        });
      }
    },
  });

  const readingLength = reportData?.data?.count || 0;
  const voiceScanReportLength = voiceScanReportData?.data?.count || 0;
  const aiReportLength = aiReportData?.count || 0;
  const healthWalletReportLength = healthWalletReportList?.count || 0;
  const miscellaneousReportLength = miscellaneousFiles?.count || 0;

  const generateAIReport = async () => {
    showLoader();
    await getAIQuestions();
    navigation.navigate('PersonalisedAI');
    hideLoader();
  };

  const generateLabReport = async () => {
    showLoader();
    await getLabReportQuestions();
    navigation.navigate('LabReport');
    hideLoader();
  };

  const handleRowPress = (
    row_name: HealthWalletCategory['identifier'],
  ): (() => void) => {
    switch (row_name) {
      case 'vital_scan_report':
        return () => {
          if (readingLength === 0) {
          }
          if (readingLength === 1) {
            navigation.navigate('ReportStackScreens', {
              screen: 'Report',
              params: {
                reading_id:
                  reportData?.data?.reading_data?.[0]?.reading_id || '',
              },
            });
          }
          if (readingLength >= 2) {
            navigation.navigate('PreviousReports');
          }
        };
      case 'voice_scan_report':
        return () => {
          if (voiceScanReportLength === 1) {
            getVoiceReportDetail({
              sessoin_id:
                voiceScanReportData?.data?.reading_data?.[0]?.session_id ?? '',
            });
          }
          if (voiceScanReportLength >= 2) {
            navigation.navigate('VoiceScanReportList');
          }
        };

      case 'ai_health_report':
        return () => {
          if (aiReportLength === 0) {
            return generateAIReport();
          } else {
            navigation.navigate('AIHealthReport');
          }
        };

      case 'interpret_lab_report':
        return () => {
          if (healthWalletReportLength === 0) {
            return generateLabReport();
          } else {
            navigation.navigate('InterpretLabReport');
          }
        };

      case 'symptom_checker':
        return () => {
          navigation.navigate('SymptomChecker');
        };

      case 'miscellaneous_files':
        return () => {
          navigation.navigate('MiscellaneousFiles');
        };

      default:
        return () => {};
    }
  };

  const startVoiceScan = async () => {
    const shouldGoToVoicescan = await shouldGoToVoiceScan();
    if (shouldGoToVoicescan) {
      navigation.navigate('VoiceScanScreen');
    } else {
      navigation.navigate('VoiceScanIntroScreen');
    }
  };

  const handleRowButtonPress = (
    row_name: HealthWalletCategory['identifier'],
  ): (() => void) => {
    switch (row_name) {
      case 'vital_scan_report':
        return startScan;
      case 'voice_scan_report':
        return startVoiceScan;
      case 'ai_health_report':
        return generateAIReport;
      case 'interpret_lab_report':
        return generateLabReport;
      default:
        return () => {};
    }
  };

  const getCount = (category: HealthWalletCategory) => {
    switch (category.identifier) {
      case 'vital_scan_report':
        return isUserReadingFetching ? languages?.loading : readingLength;
      case 'voice_scan_report':
        return isUserVoiceReportFetching
          ? languages?.loading
          : voiceScanReportLength;

      case 'ai_health_report':
        return isAiReportListFetching ? languages?.loading : aiReportLength;
      case 'interpret_lab_report':
        return isHealthReportListFetching
          ? languages?.loading
          : healthWalletReportLength;
      case 'miscellaneous_files':
        return isMiscellaneousFilesFetching
          ? languages?.loading
          : miscellaneousReportLength;
      default:
        return category.count;
    }
  };

  return (
    <SafeAreaScrollView style={styles.container}>
      <View className="p-4">
        <Navbar />
      </View>
      <CustomText className="text-2xl font-isidoraBold text-ultramarineBlue text-center">
        {languages?.health_wallet_title}
      </CustomText>

      <View className="px-4 py-8">
        {HEALTH_WALLET_CATEGORY_LIST?.map((category, idx) => (
          <View
            key={`${category.identifier}-${idx}`}
            from={{opacity: 0, translateY: 200}}
            animate={{opacity: 1, translateY: 0}}
            transition={
              {
                type: 'timing',
                duration: 400 * idx,
                easing: Easing.linear,
              } as MotiTransitionProp<
                StyleValueWithReplacedTransforms<ViewStyle>
              >
            }
            className="flex-row">
            <TouchableOpacity
              className={twMerge(
                'py-8 px-4 flex-row items-center border-t  border-t-[#868686] space-x-4 flex-1',
                !!(idx % 2) && 'flex-row-reverse',
                idx + 1 === HEALTH_WALLET_CATEGORY_LIST.length &&
                  'border-b border-b-[#3a3a3a]',
              )}
              activeOpacity={0.4}
              onPress={() => handleRowPress(category.identifier)()}>
              <Image
                source={category.image}
                className="smallPhone:h-[80px] smallPhone:w-[100px] largePhone:w-[159px] largePhone:h-[124.17px] "
                resizeMode="contain"
              />
              <View className="flex-1">
                <CustomText className="text-base font-isidoraSemiBold text-ultramarineBlue ">
                  {category.name}
                </CustomText>
                <CustomText className="text-xs font-isidoraMedium">
                  {category.count_title}: {getCount(category)}
                </CustomText>
                {!!category.button_title && (
                  <RoundedButton
                    resetStyle
                    style={styles.button}
                    onPress={() => handleRowButtonPress(category.identifier)()}>
                    <CustomText className="text-white font-isidoraMedium text-xs">
                      {category.button_title}
                    </CustomText>
                  </RoundedButton>
                )}
              </View>
            </TouchableOpacity>
            <View className="justify-center">
              <Icon
                name="chevron-right"
                size={24}
                color={customColor.lightGrey}
              />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaScrollView>
  );
};

export default HealthWallet;

const styles = StyleSheet.create({
  container: {},
  button: {
    backgroundColor: '#1687C4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
});
