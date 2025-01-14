import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {TransparentCircularBg} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import Header from './components/Header';

const Conclusion = () => {
  const navigation = useNavigation<any>();
  const {languages} = useLanguageStore();

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };
  return (
    <ImageBackground
      source={TransparentCircularBg as any}
      className="w-full h-full">
      <SafeAreaScrollView
        style={styles.container}
        className="bg-[#2FB6AF] h-full">
        <Header />
        <View className="mt-4 px-12">
          <CustomText className="text-white text-lg font-isidoraSemiBold">
            {languages?.privacyRejectMessage}
          </CustomText>
        </View>
        <View className="items-center my-4">
          <RoundedButton
            resetStyle
            style={styles.btnStyle}
            className="py-2 min-w-[182px]"
            onPress={navigateToProfile}>
            <CustomText className="font-isidoraBold text-lg text-center text-white">
              {languages?.proceed}
            </CustomText>
          </RoundedButton>
          <RoundedButton
            resetStyle
            style={styles.btnStyle}
            className="py-2 min-w-[182px] mt-4"
            onPress={navigation.goBack}>
            <CustomText className="font-isidoraBold text-lg text-center text-white">
              {languages?.goBackTxt}
            </CustomText>
          </RoundedButton>
        </View>
      </SafeAreaScrollView>
    </ImageBackground>
  );
};

export default Conclusion;

const styles = StyleSheet.create({
  container: {},
  btnStyle: {
    backgroundColor: 'rgba(239, 130, 179, 1)',
  },
});
