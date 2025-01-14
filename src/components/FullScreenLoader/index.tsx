import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Modal, Portal} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import customColor from '../../theme/customColor';
import CustomText from '../Text';

type FullPageLoaderProps = {
  visible: boolean;
  hideModal?: () => void;
};

const FullScreenLoader = ({visible}: FullPageLoaderProps) => {
  const {languages} = useLanguageStore();
  return (
    <Portal>
      <Modal
        visible={visible}
        contentContainerStyle={styles.containerStyle}
        dismissable={false}>
        <View className="bg-white px-10 py-10 rounded-2xl">
          <ActivityIndicator size="large" color={customColor.ultramarineBlue} />
          <CustomText className="mt-4  font-isidoraSemiBold text-sm">
            {languages?.loading}
          </CustomText>
        </View>
      </Modal>
    </Portal>
  );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
  containerStyle: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
