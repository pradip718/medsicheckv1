import React from 'react';
import {Image, ImageBackground, StyleSheet, Text, View} from 'react-native';

import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {MainStackParamList} from '../../../../types/navigation';
import useLanguageStore from '../../../../store/languageStore';
import {goToHome} from '../../../../utils/navigation';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {BOLD, REGULAR} from '../../../constants/Fonts';

const SymptomCheckerGenerating = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomGenerating'>>();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const languages = useLanguageStore(store => store.languages);

  const onPress = () => {
    if (params?.isProgress) {
      return navigation.goBack();
    }
    goToHome();
  };

  return (
    <ImageBackground
      source={require('../../../../assets/images/generating_background.png')}
      className="flex-1 p-4 pb-4 bg-white">
      <View className="items-center justify-center flex-1">
        <Image
          source={require('../../../../assets/images/SymptomChecker/symptom_generating.png')}
          className="w-full h-96"
          resizeMode="contain"
        />
        <View className="gap-4">
          <Text style={styles.title}>
            {languages?.generating_symptom_title}
          </Text>
          <Text style={styles.info}>{languages?.generating_symptom_info}</Text>
        </View>
      </View>

      <RoundedButton onPress={onPress}>
        <CustomText className="text-lg text-white font-isidoraSemiBold">
          {params?.isProgress ? languages?.back : languages?.take_me_home}
        </CustomText>
      </RoundedButton>
    </ImageBackground>
  );
};

export default SymptomCheckerGenerating;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: BOLD,
    lineHeight: 28,
    color: '#222A3D',
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    fontFamily: REGULAR,
    lineHeight: 22,
    color: '#1F2937',
    textAlign: 'center',
  },
});
