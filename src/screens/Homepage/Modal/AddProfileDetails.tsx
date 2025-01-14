import {NavigationProp, useNavigation} from '@react-navigation/native';
import {View} from 'moti';
import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {AddBackgroundImg, MedsiBackgroundLogo} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';

type AddProfileDetailsProps = {
  onLaterPress: () => void;
};

const AddProfileDetails = ({onLaterPress}: AddProfileDetailsProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const navigateToProfileDetails = () => {
    navigation.navigate('AdditionalDetail');
  };

  return (
    <View
      className="bg-[#0D8988] rounded-t-[30px] px-8 py-4 items-center justify-center pb-[140px] relative"
      from={{translateY: 200}}
      animate={{translateY: 0}}
      exit={{translateY: 200}}
      transition={{type: 'timing', duration: 1000} as any}>
      <Image source={AddBackgroundImg as any} style={styles.addBackgroundImg} />
      <Image
        source={MedsiBackgroundLogo as any}
        style={styles.medsiBackgroundImg}
      />
      <CustomText className="text-white text-sm font-isidoraMedium">
        {languages?.add_profile_details_tile_info}
      </CustomText>

      <View className="flex-row mt-4">
        <RoundedButton
          resetStyle
          style={styles.profileDetailButton}
          onPress={navigateToProfileDetails}>
          <CustomText className="text-white text-sm font-isidoraMedium">
            {languages?.add_profile_details_btn_txt}
          </CustomText>
        </RoundedButton>
        <RoundedButton
          resetStyle
          style={styles.laterButton}
          onPress={onLaterPress}>
          <CustomText className="text-white text-sm font-isidoraMedium">
            {languages?.later_button_txt}
          </CustomText>
        </RoundedButton>
      </View>
    </View>
  );
};

export default AddProfileDetails;

const styles = StyleSheet.create({
  containerStyle: {
    position: 'absolute',
  },
  profileDetailButton: {
    backgroundColor: '#222B45',
    paddingHorizontal: 32,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginLeft: 12,
  },
  addBackgroundImg: {
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  medsiBackgroundImg: {
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 30,
    left: 0,
  },
});
