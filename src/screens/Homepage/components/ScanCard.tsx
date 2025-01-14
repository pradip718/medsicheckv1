import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Homepage_Person} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {navigateToFaceScan} from '../../../../utils/navigation';
import Icon from '../../../components/Icon';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

const ScanCard = () => {
  const {languages} = useLanguageStore();
  return (
    <LinearGradient
      colors={['#222B45', '#142044']}
      className="px-4 pt-10 rounded-3xl mt-2">
      <CustomText className="text-white text-[32px] font-isidoraSemiBold leading-9 tracking-[.2px]">
        {languages?.personalizedHealthInsightsPrompt}
      </CustomText>
      <CustomText className="text-white text-base font-isidoraMedium leading-5 tracking-[.3px] mt-4">
        {languages?.faceScanReportPrompt}
      </CustomText>
      <View className="mt-4 flex-row">
        <View className="flex-shrink">
          <Image
            source={Homepage_Person as any}
            style={styles.homepagePersonImg}
          />
        </View>
        <View className="max-h-[100px] justify-center flex-grow">
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  homepagePersonImg: {
    aspectRatio: '1831/2255',
    resizeMode: 'contain',
    height: 248.05,
  },
});

export default ScanCard;
