import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {ImageBackground, Linking, StyleSheet, View} from 'react-native';
import {TransparentCircularBg} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {isAndroid} from '../../../../utils';
import RoundedButton from '../../../components/RoundedButton';
import SafeAreaScrollView from '../../../components/SafeAreaScrollView';
import CustomText from '../../../components/Text';
import Header from './Header';

const MaleUserFallback = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const navigateToHome = () => {
    navigation.navigate('HomepageStackScreens', {
      screen: 'Home',
    });
  };

  const navigateToStore = () => {
    if (!isAndroid) {
      // Linking.openURL(`https://apps.apple.com/${appStoreLocale}/app/${appName}/id${appStoreId}`);
    } else {
      Linking.openURL(
        'http://play.google.com/store/apps/details?id=mx.medsi.medsicheck',
      );
    }
  };

  return (
    <ImageBackground
      source={TransparentCircularBg as any}
      className="w-full h-full">
      <SafeAreaScrollView
        style={styles.container}
        className="bg-[#2FB6AF] h-full">
        <Header />
        <View className="px-8">
          <CustomText className="text-lg font-isidoraSemiBold text-white mt-8 text-center">
            {languages?.male_fallback_msg}
          </CustomText>
          <CustomText className="text-lg font-isidoraSemiBold text-white mt-8 text-center">
            {languages?.male_fallback_msg_2}
          </CustomText>
          <CustomText className="text-lg font-isidoraSemiBold text-white mt-8 text-center">
            {languages?.male_fallback_msg_3}
          </CustomText>

          <View className="items-center mt-4">
            <RoundedButton
              resetStyle
              style={styles.startButton}
              className="my-4 py-2 min-w-[200px]"
              onPress={navigateToHome}>
              <CustomText className="font-isidoraBold text-lg text-white">
                {languages?.proceed?.toUpperCase()}
              </CustomText>
            </RoundedButton>
            {isAndroid && (
              <RoundedButton
                resetStyle
                className="my-4 py-2 min-w-[200px] bg-[#3652CD]"
                onPress={navigateToStore}>
                <CustomText className="font-isidoraBold text-lg text-white">
                  Medsi Check
                </CustomText>
              </RoundedButton>
            )}
          </View>
        </View>
      </SafeAreaScrollView>
    </ImageBackground>
  );
};

export default MaleUserFallback;

const styles = StyleSheet.create({
  container: {},
  startButton: {
    backgroundColor: 'rgba(239, 130, 179, 1)',
  },
});
