import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

const VoiceScanCard = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const navigateToVoiceScan = () => {
    navigation.navigate('VoiceScanIntroScreen');
  };
  return (
    <LinearGradient
      colors={['#0A60B7', '#148CBF']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      className="pl-5 pt-5 mt-2 rounded-3xl flex-row flex-1 overflow-hidden space-x-2">
      <View className="flex-1 pb-5 mr-[40%]">
        <CustomText className="text-white text-lg font-isidoraSemiBold">
          {languages?.voice_check_in}
        </CustomText>
        <CustomText className="text-white text-base font-isidoraMedium leading-none">
          {languages?.voice_note_description}
        </CustomText>

        <View className="items-start mt-4">
          <RoundedButton
            className="px-5 py-2 bg-red-400"
            resetStyle
            onPress={navigateToVoiceScan}>
            <View className="flex-row items-center">
              <FontAwesome
                name="microphone"
                size={20}
                color={customColor.white}
              />
              <CustomText className="text-white pl-2 font-isidoraMedium text-base leading-none">
                {languages?.take_test}
              </CustomText>
            </View>
          </RoundedButton>
        </View>
      </View>
      <View className="w-[60%] justify-end h-full mt-[2%] tablet:w-[20%] absolute right-0 bottom-0">
        <View style={styles.homepagePersonImg}>
          <Image
            source={require('../../../../assets/images/voice_scan_dashboard_user.png')}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  homepagePersonImg: {
    // height: '100%',
    width: '100%',
    aspectRatio: 168 / 164,
  },
});

export default VoiceScanCard;
