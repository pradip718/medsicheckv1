import {View} from 'moti';
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Dialog, Portal} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import customColor from '../../theme/customColor';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';

interface DeleteModalProps {
  visible: boolean;
  hideAlert: () => void;
  message: {
    title: string;
    content: string;
  };
  handleOk: () => void;
  handleCancel: () => void;
}

const DeleteModal = ({
  visible,
  hideAlert,
  message,
  handleOk,
  handleCancel,
}: DeleteModalProps) => {
  const {languages} = useLanguageStore();
  return (
    <Portal>
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
        </ScrollView>

        <Dialog.Actions>
          <View
            className="w-full flex-row justify-center space-x-4"
            from={{scaleY: 0}}
            animate={{scaleY: 1}}
            transition={{type: 'timing', duration: 500} as any}>
            <RoundedButton
              onPress={handleOk}
              resetStyle
              className="bg-ultramarineBlue flex-1 py-2">
              <CustomText className="text-base font-isidoraBold text-white text-center">
                {languages?.allow_txt}
              </CustomText>
            </RoundedButton>
            <RoundedButton
              onPress={handleCancel}
              resetStyle
              className="bg-ultramarineBlue flex-1 py-2">
              <CustomText className="text-base font-isidoraBold text-white text-center">
                {languages?.cancel}
              </CustomText>
            </RoundedButton>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteModal;

const styles = StyleSheet.create({
  dialogText: {
    maxHeight: 300,
  },
});
