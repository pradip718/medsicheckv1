import SDK from 'biosensesignal-react-native-sdk';
import React from 'react';
import {Linking, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import useLanguageStore from '../../store/languageStore';
import Navbar from '../components/Navbar';
import SafeAreaScrollView from '../components/SafeAreaScrollView';
import CustomText from '../components/Text';

const AboutApp = () => {
  const {languages} = useLanguageStore();
  return (
    <SafeAreaScrollView
      contentContainerStyle={{height: '100%'}}
      className="p-4">
      <Navbar />
      <View className="flex-1 mt-4">
        <CustomText className="text-lg font-isidoraMedium mt-4">
          {languages?.medsi_about_us}
          {`\n${languages?.medsi_about_us_link}`}
          <CustomText
            className="text-ultramarineBlue font-isidoraSemiBold"
            onPress={() => {
              Linking.openURL('https://medsi.ai/');
            }}>
            https://medsi.ai/
          </CustomText>
        </CustomText>
        <CustomText className="mt-4">{languages?.copyright}</CustomText>
      </View>
      <CustomText className="mt-4 font-isidoraMedium text-base text-slate-600 text-center">
        {languages?.app_version} - {DeviceInfo.getVersion()} (
        {DeviceInfo.getBuildNumber()})
      </CustomText>
      <CustomText className="font-isidoraMedium text-base text-slate-600 text-center">
        {languages?.sdk_version} - {SDK.version}
      </CustomText>
    </SafeAreaScrollView>
  );
};

export default AboutApp;
