import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import useLanguageStore from '../../store/languageStore';
import RoundedButton from './RoundedButton';
import CustomText from './Text';

type DeleteAdminModalProps = {
  visible: boolean;
  isDeleting: boolean;
  handleDeleteAccount: () => void;
  hideModal: () => void;
};

const DeleteAdminModal = ({
  visible,
  handleDeleteAccount,
  hideModal,
  isDeleting,
}: DeleteAdminModalProps) => {
  const {languages} = useLanguageStore();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        style={styles.modalStyle}
        contentContainerStyle={styles.modalContentContainer}>
        <View className="justify-center items-center bg-white h-[160px] min-w-[240px] max-w-[300px] rounded-3xl px-2">
          <CustomText className="text-lg font-isidoraSemiBold text-center">
            {languages?.delete_account_title}
          </CustomText>
          <View className="flex-row mt-4 justify-center space-x-4  w-full">
            <RoundedButton
              resetStyle
              className="px-4 py-2 bg-gray-400"
              onPress={hideModal}>
              <CustomText className="text-white font-isidoraMedium text-sm">
                {languages?.cancel}
              </CustomText>
            </RoundedButton>
            <RoundedButton
              resetStyle
              className="px-4 py-2 bg-red-500"
              disabled={isDeleting}
              loading={isDeleting}
              onPress={handleDeleteAccount}>
              <CustomText className="text-white font-isidoraMedium text-sm">
                {languages?.delete}
              </CustomText>
            </RoundedButton>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

export default DeleteAdminModal;

const styles = StyleSheet.create({
  modalContentContainer: {
    // paddingTop: 170,
    // marginRight: 20,
  },
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
