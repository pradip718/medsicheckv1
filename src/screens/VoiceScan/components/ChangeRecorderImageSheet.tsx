import React, {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {Dialog, Portal} from 'react-native-paper';
import useLanguageStore from '../../../../store/languageStore';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

interface PrivacyInfoProps {
  open: boolean;
  onClose: () => void;
  onImageChange: () => void;
}

const ChangeRecorderImageBottomSheet = ({
  open,
  onClose,
  onImageChange,
}: PrivacyInfoProps) => {
  const languages = useLanguageStore(store => store.languages);

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose} style={styles.sheetContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Want a new image?</Text>

          <View>
            <Text style={styles.infoText}>
              If you change the image, your current recording and transcript
              will be lost.
            </Text>
            <Text style={styles.infoText}>Would you like to proceed?</Text>
          </View>

          <View style={styles.buttonContainer}>
            <RoundedButton onPress={onImageChange} className="space-x-2">
              <CustomText className="text-white font-isidoraMedium text-base">
                Yes, change the image
              </CustomText>
              <Feather name="repeat" size={18} color="#fff" />
            </RoundedButton>
            <RoundedButton
              onPress={() => onClose()}
              style={styles.cancelButton}
              className="space-x-2 items-center mt-4">
              <CustomText className="text-ultramarineBlue font-isidoraSemiBold text-base">
                {languages?.cancel}
              </CustomText>
              <FontAwesome
                name="close"
                size={22}
                color={customColor.ultramarineBlue}
              />
            </RoundedButton>
          </View>
        </View>
      </Dialog>
    </Portal>
  );
};

export default ChangeRecorderImageBottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: 16,
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  title: {
    color: '#4B5363',
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4B5363',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#D7EEFC',
    borderColor: '#D7EEFC',
  },
  backButtonText: {
    color: '#1671C0',
  },
  cancelButton: {
    backgroundColor: '#BCC9FF',
  },
});
