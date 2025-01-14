import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import EtchedGlass from '../../../components/EtchedGlass';
import CustomText from '../../../components/Text';

const Note = () => {
  const {languages} = useLanguageStore();
  return (
    <EtchedGlass>
      <CustomText className="font-isidoraBold text-sm text-white text-center">
        {languages?.note}
      </CustomText>
      <CustomText className="font-isidoraSemiBold text-sm text-white mt-4">
        • {languages?.mandatoryMessage}
      </CustomText>
      <CustomText className="font-isidoraSemiBold text-sm text-white mt-2">
        • {languages?.proceedMessage}
      </CustomText>
    </EtchedGlass>
  );
};

const Introductions = () => {
  const {languages} = useLanguageStore();
  return (
    <View style={styles.container}>
      <CustomText className="text-2xl font-isidoraSemiBold text-white">
        {languages?.welcome} Aayushi
      </CustomText>
      <CustomText className="text-lg font-isidoraSemiBold text-white mt-8">
        {languages?.privacyMessage}
      </CustomText>
      <CustomText className="text-lg font-isidoraSemiBold text-white mt-4">
        {languages?.anonymizationMessage}
      </CustomText>
      <View className="mt-8">
        <Note />
      </View>
    </View>
  );
};

export default Introductions;

const styles = StyleSheet.create({
  container: {},
});
