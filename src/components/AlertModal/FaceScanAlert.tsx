import _ from 'lodash';
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Dialog} from 'react-native-paper';
import useAlertStore from '../../../store/alertStore';
import useLanguageStore from '../../../store/languageStore';
import customColor from '../../theme/customColor';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';

interface FaceScanAlertProps {
  visible: boolean;
  hideAlert: () => void;
}

const FaceScanAlert = ({visible, hideAlert}: FaceScanAlertProps) => {
  const {message} = useAlertStore();
  const {languages} = useLanguageStore();
  const {params} = message || {};

  const handleRescan = () => {
    hideAlert();
    params?.startMeasurement?.();
  };

  const handleContinue = async () => {
    hideAlert();
    await params?.proceedToReportScreen?.();
  };

  const buttonsConfig = [
    {
      condition: params?.rescan,
      onPress: handleRescan,
      text: languages?.allow_txt,
    },
    {
      condition: params?.continue,
      onPress: handleContinue,
      text: languages?.continue,
    },
    {
      condition: params?.exit,
      onPress: handleContinue,
      text: languages?.continue,
    },
  ];

  const defaultButtonConfig = {
    condition: !params?.continue && !params?.rescan && !params?.exit,
    onPress: hideAlert,
    text: languages?.allow_txt,
  };

  const renderButton = ({onPress, text}: any, key: string | number) => (
    <RoundedButton key={key} onPress={onPress}>
      <CustomText className="text-base font-isidoraBold text-white text-center">
        {text}
      </CustomText>
    </RoundedButton>
  );
  return (
    <Dialog
      visible={visible}
      onDismiss={hideAlert}
      style={{
        backgroundColor: customColor.white,
      }}>
      <ScrollView className="space-y-2 my-4 px-4" style={styles.dialogText}>
        <CustomText className="text-2xl font-isidoraSemiBold text-black text-center">
          {message?.title}
        </CustomText>

        <CustomText className="text-base font-isidoraMedium text-black text-center">
          {message?.content}
        </CustomText>
        <Dialog.Actions className="flex-row">
          {buttonsConfig
            .filter(button => button.condition)
            .map((button, index) => renderButton(button, index))}
          {_.isEmpty(buttonsConfig.filter(button => button.condition)) &&
            renderButton(defaultButtonConfig, 'default')}
        </Dialog.Actions>
      </ScrollView>
    </Dialog>
  );
};

export default FaceScanAlert;

const styles = StyleSheet.create({
  dialogText: {
    maxHeight: 300,
  },
});
