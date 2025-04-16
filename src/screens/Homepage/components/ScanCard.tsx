import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import useLanguageStore from '../../../../store/languageStore';
import {navigateToFaceScan} from '../../../../utils/navigation';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

const ScanCard = () => {
  const {languages} = useLanguageStore();
  return (
    <LinearGradient
      colors={['#074E58', '#12A0B4']}
      className="pl-5 pt-5 mt-2 rounded-3xl flex-row flex-1 overflow-hidden space-x-2">
      <View className="flex-1 pb-5">
        <CustomText className="text-white text-lg font-isidoraSemiBold">
          {languages?.scan_instant_insights}
        </CustomText>
        <CustomText className="text-white text-base font-isidoraMedium  ">
          {languages?.camera_capture_health_signals}
        </CustomText>

        <View className="items-start mt-4">
          <RoundedButton
            className="px-5 py-2 bg-red-400"
            resetStyle
            onPress={navigateToFaceScan}>
            <View className="flex-row items-center">
              <Feather name="camera" size={20} color={customColor.white} />
              <CustomText className="text-white pl-2 font-isidoraMedium text-base">
                {languages?.take_test}
              </CustomText>
            </View>
          </RoundedButton>
        </View>
      </View>
      <View className="w-[40%] justify-end h-full -mr-[5%] mt-[2%] tablet:w-[20%]">
        <View style={styles.homepagePersonImg}>
          <Image
            source={require('../../../../assets/images/LoginImgPerson.png')}
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
    aspectRatio: 0.68,
  },
});

export default ScanCard;
