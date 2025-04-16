import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import useLanguageStore from '../../../../store/languageStore';
import {navigateToFaceScan} from '../../../../utils/navigation';
import Icon from '../../../components/Icon';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

const VoiceScanCard = () => {
  const {languages} = useLanguageStore();
  return (
    <LinearGradient
      colors={['#148CBF', '#0A60B7']}
      className="pl-4 pt-4 rounded-3xl mt-2 flex-row flex-1">
      <View className="flex-1">
        <CustomText className="text-white text-lg font-isidoraSemiBold">
          {languages?.voice_check_in}
        </CustomText>
        <CustomText className="text-white text-base font-isidoraMedium  mt-4">
          {languages?.voice_note_description}
        </CustomText>

        <View className="items-start mt-4">
          <RoundedButton
            className="px-5 py-2 bg-red-400"
            resetStyle
            onPress={navigateToFaceScan}>
            <Icon name="person" size={20} color={customColor.white} />
            <CustomText className="text-white pl-2">
              {languages?.take_test}
            </CustomText>
          </RoundedButton>
        </View>
      </View>
      <View className="flex-[0.8] mt-4 justify-end items-end">
        <Image
          source={require('../../../../assets/images/voice_scan_dashboard_user.png')}
          style={styles.homepagePersonImg}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  homepagePersonImg: {
    height: '100%',
    width: '100%',
    // aspectRatio: 0.68,
  },
});

export default VoiceScanCard;
