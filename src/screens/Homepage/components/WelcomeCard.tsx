import React from 'react';
import {ImageBackground, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';
import useGetUserAttributes from '../../../hooks/api/useGetUserAttributes';

const WelcomeCard = () => {
  const {data: userAttributes} = useGetUserAttributes();
  const {languages} = useLanguageStore();

  return (
    <View className="bg-[#162244]  mt-10 rounded-3xl">
      <ImageBackground
        source={require('../../../../assets/images/welcome_user_background.png')}
        className="px-4 py-10"
        resizeMode="contain">
        <CustomText className="text-white text-2xl font-isidoraBold">
          {userAttributes?.gender === 'female'
            ? languages?.welcome_female
            : languages?.welcome}{' '}
          {userAttributes?.given_name ??
            (userAttributes?.gender === 'female'
              ? languages?.user_txt_female
              : languages?.user_txt)}
        </CustomText>
        <CustomText className="text-white text-sm font-isidoraMedium">
          {languages?.welcome_txt}
        </CustomText>
      </ImageBackground>
    </View>
  );
};

export default WelcomeCard;
