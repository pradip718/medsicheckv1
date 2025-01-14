import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {TransparentCircularBg} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import Header from './components/Header';
import Introductions from './components/Introductions';

const Welcome = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const navigateToQuestion = () => {
    navigation.navigate('PreventixInformationStackScreens', {
      screen: 'Questions',
    });
  };
  return (
    <ImageBackground
      source={TransparentCircularBg as any}
      className="w-full h-full">
      <SafeAreaScrollView
        style={styles.container}
        className="bg-[#2FB6AF] h-full">
        <Header />
        <View className="mt-4 px-12 ">
          <Introductions />
        </View>
        <View className="items-center">
          <RoundedButton
            resetStyle
            style={styles.startButton}
            className="my-4 py-2 min-w-[200px]"
            onPress={navigateToQuestion}>
            <CustomText className="font-isidoraBold text-lg text-white">
              {languages?.start_button_text?.toUpperCase()}
            </CustomText>
          </RoundedButton>
        </View>
      </SafeAreaScrollView>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {},
  startButton: {
    backgroundColor: 'rgba(239, 130, 179, 1)',
  },
});
