import _ from 'lodash';
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Dialog, Portal} from 'react-native-paper';
import useAlertStore from '../../../store/alertStore';
import useAppStore from '../../../store/appStore';
import useLanguageStore from '../../../store/languageStore';
import customColor from '../../theme/customColor';
import BasicContainer from '../BasicContainer';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';
import FaceScanAlert from './FaceScanAlert';

const AlertModal = () => {
  const {visible, hideAlert, message, action} = useAlertStore();
  const {screenName} = useAppStore();
  const {languages} = useLanguageStore();
  const {params} = message || {};

  return (
    <BasicContainer>
      <Portal>
        {screenName?.current === 'FaceScanCamera' && !_.isEmpty(params) ? (
          <FaceScanAlert visible={visible} hideAlert={hideAlert} />
        ) : (
          <Dialog
            visible={visible}
            onDismiss={hideAlert}
            style={{
              backgroundColor: customColor.white,
            }}>
            <ScrollView
              className="space-y-2 my-4 px-4"
              style={styles.dialogText}>
              <CustomText className="text-2xl font-isidoraSemiBold text-black text-center">
                {message?.title}
              </CustomText>

              <CustomText className="text-base font-isidoraMedium text-black text-center">
                {message?.content}
              </CustomText>
            </ScrollView>

            <Dialog.Actions className="flex-row">
              <RoundedButton
                onPress={action ? action?.onOkPressed : hideAlert}
                resetStyle
                className="flex-1 bg-ultramarineBlue py-2">
                <CustomText className="text-base font-isidoraBold text-white text-center">
                  {languages?.allow_txt}
                </CustomText>
              </RoundedButton>
              {action?.onCancelPressed && (
                <RoundedButton
                  resetStyle
                  className="flex-1 bg-ultramarineBlue py-2"
                  onPress={action ? action?.onCancelPressed : hideAlert}>
                  <CustomText className="text-base font-isidoraBold text-white text-center">
                    {languages?.cancel}
                  </CustomText>
                </RoundedButton>
              )}
            </Dialog.Actions>
          </Dialog>
        )}
      </Portal>
    </BasicContainer>
  );
};

export default AlertModal;

const styles = StyleSheet.create({
  dialogText: {
    maxHeight: 300,
  },
});
