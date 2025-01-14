import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {TransparentCircularBg} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import Navbar from './components/Navbar';
import QuestionAnswer from './components/QuestionAnswer';

const Questions = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const navigateToConclusion = () => {
    navigation.navigate('PreventixInformationStackScreens', {
      screen: 'Conclusion',
    });
  };
  return (
    <ImageBackground
      source={TransparentCircularBg as any}
      style={styles.imageBg}>
      <SafeAreaScrollView
        contentContainerStyle={{height: '100%', paddingBottom: 20}}>
        <View style={styles.container} className="mt-4 justify-between h-full">
          <Navbar />
          <View className="mt-4 flex-grow">
            <QuestionAnswer />
          </View>
          <View className="px-4">
            <RoundedButton
              style={{
                backgroundColor: '#2FB6AF',
              }}
              onPress={navigateToConclusion}>
              <CustomText className="text-lg text-white font-isidoraSemiBold">
                {languages?.save_btn_txt}
              </CustomText>
            </RoundedButton>
          </View>
        </View>
      </SafeAreaScrollView>
    </ImageBackground>
  );
};

export default Questions;

const styles = StyleSheet.create({
  container: {},
  imageBg: {
    width: '100%',
    height: '100%',
  },
});
