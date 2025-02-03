import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React from 'react';
import {BackHandler} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import BackgroundImage from '../../components/BackgroundImage';
import CustomText from '../../components/Text';

const PrepareFacescan = () => {
  const navigation = useNavigation();
  const {languages} = useLanguageStore();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        navigation.goBack();
        return true;
      };

      backAction();

      BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, [navigation]),
  );

  return (
    <BackgroundImage className="h-full justify-center items-center">
      <CustomText className="font-isidoraSemiBold text-xl text-center">
        {languages?.anura_preparation_loader}
      </CustomText>
    </BackgroundImage>
  );
};

export default PrepareFacescan;
