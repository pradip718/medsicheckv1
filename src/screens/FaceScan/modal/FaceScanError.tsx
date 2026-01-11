import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import _, {isArray} from 'lodash';
import {Image} from 'moti';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {trackAnalytics, ANALYTICS_EVENTS} from '../../../services/analytics';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import BasicContainer from '../../../components/BasicContainer';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';

interface FaceScanErrorProps {
  hideModal: () => void;
  startMeasurement: () => void;
  proceedToReportScreen: () => void;
  params?: any;
}

const FaceScanError = ({
  hideModal,
  startMeasurement,
  proceedToReportScreen,
  params,
}: FaceScanErrorProps) => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {error_msg = []} = params || {error_msg: []};
  const handleRescan = () => {
    hideModal();
    trackAnalytics(ANALYTICS_EVENTS.FACESCAN_RETRY, {
      reading_id: params?.reading_id || '',
    });
    startMeasurement?.();
  };

  const handleContinue = async () => {
    hideModal();
    trackAnalytics(ANALYTICS_EVENTS.FACESCAN_CONTINUE, {
      reading_id: params?.reading_id || '',
    });
    await proceedToReportScreen?.();
  };

  const handleExit = async () => {
    hideModal();
    navigation?.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: 'HomepageStackScreens',
          },
        ],
      }),
    );
  };

  const buttonsConfig = [
    {
      condition: params?.rescan,
      onPress: handleRescan,
      text: languages?.rescan,
    },
    {
      condition: params?.continue,
      onPress: handleContinue,
      text: languages?.continue,
    },
    {
      condition: params?.exit_flag,
      onPress: handleExit,
      text: languages?.proceed,
    },
  ];

  const defaultButtonConfig = {
    condition: !params?.continue && !params?.rescan && !params?.exit,
    onPress: hideModal,
    text: languages?.allow_txt,
  };

  const renderButton = ({onPress, text}: any, key: string | number) => (
    <LinearGradient
      key={key}
      colors={['#0BC899', '#1A6AD7']}
      className="rounded-full py-2 px-4 mb-2 min-w-[30%]">
      <RoundedButton onPress={onPress} resetStyle className="">
        <CustomText className="text-base font-isidoraBold text-white text-center">
          {text}
        </CustomText>
      </RoundedButton>
    </LinearGradient>
  );
  return (
    <BasicContainer style={styles.container}>
      <CustomText className="text-xl font-isidoraSemiBold text-center">
        {languages?.error}
      </CustomText>

      <CustomText className="text-[#979797] text-center mt-4">
        {languages?.confidence_issue}
      </CustomText>
      <Image
        source={require('../../../../assets/images/scan_error.png')}
        className="w-[154px] h-[119px] my-4 self-center"
      />
      {isArray(error_msg) &&
        error_msg?.map((msg, idx) => (
          <View key={`${msg?.header}-${idx}`} className="my-2">
            <CustomText className="text-sm font-isidoraSemiBold">
              {msg?.header}
            </CustomText>
            <CustomText className="text-[#979797]">
              {msg?.description}
            </CustomText>
          </View>
        ))}

      <View className="my-4 flex-row justify-center space-x-2 flex-wrap">
        {buttonsConfig
          .filter(button => button.condition)
          .map((button, index) => renderButton(button, index))}
        {_.isEmpty(buttonsConfig.filter(button => button.condition)) &&
          renderButton(defaultButtonConfig, 'default')}
      </View>
    </BasicContainer>
  );
};

export default FaceScanError;

const styles = StyleSheet.create({
  container: {},
});
