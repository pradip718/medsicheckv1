import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import React, {useState} from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {Background} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import {MainStackParamList} from '../../../types/navigation';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import {errorToast} from '../../../utils/toast';
import axiosInstance from '../../api';
import ErrorMessage from '../../components/ErrorMessage';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {BOLD} from '../../constants/Fonts';
import usePostOnboardingSteps from '../../hooks/api/usePostOnboardingSteps';
import useBackButton from '../../hooks/useBackButton';
import {color} from '../../theme';
import Description from './Description';

const TnC = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [checked, setChecked] = useState(false);
  const {languages} = useLanguageStore();
  const {setSignoutModalVisibility} = useLoaderStore();

  const showSignoutModal = () => {
    setSignoutModalVisibility(true);
    return true;
  };
  useBackButton(showSignoutModal);

  const {
    mutateAsync: postOnboardingStep,
    error: postOnboardingError,
    isPending: isPostOnboardingPending,
  } = usePostOnboardingSteps();

  const {
    isPending,
    error,
    isError,
    data: tncData,
  } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => {
      const locale = getDeviceLocaleInformation();
      return await axiosInstance.get(`v1/tnc?locale=${locale}`);
    },
  });

  const handleAcceptTnC = async () => {
    await postOnboardingStep({milestone: 'tnc-signed'});
    if (postOnboardingError && postOnboardingError.message) {
      return errorToast(postOnboardingError.message);
    }
    navigation.navigate('UserInformation', {
      fromScreen: 'tnc',
    });
  };

  const onChangeChecked = (check: boolean) => {
    setChecked(check);
  };

  if (isError) {
    return <ErrorMessage errorMessage={error.message} />;
  }

  return (
    <ImageBackground source={Background as any} className="flex-1">
      <SafeAreaScrollView
        className="my-4"
        style={styles.container}
        contentContainerStyle={{minHeight: '100%'}}>
        <View className="px-4">
          <Navbar noBack />
        </View>
        {isPending ? (
          <Loader />
        ) : (
          <>
            <View className="mt-[10%] px-4">
              <Description
                checked={checked}
                onChangeChecked={onChangeChecked}
                tncData={tncData}
              />
            </View>
            <View className="px-[20px] mt-[10%]">
              <RoundedButton
                onPress={handleAcceptTnC}
                disabled={!checked || isPostOnboardingPending}
                loading={isPostOnboardingPending}>
                <CustomText className="text-white text-lg font-isidoraSemiBold">
                  {languages?.accept_button_txt}
                </CustomText>
              </RoundedButton>
            </View>
          </>
        )}
      </SafeAreaScrollView>
    </ImageBackground>
  );
};

export default TnC;

const styles = StyleSheet.create({
  container: {},
  link: {
    color: color.ultramarineBlue,
  },
  cardTitle: {
    textAlign: 'center',
    fontFamily: BOLD,
  },
});
