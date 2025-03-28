import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Additional_Information_img} from '../../../../../assets';
import useLanguageStore from '../../../../../store/languageStore';
import useLoaderStore from '../../../../../store/loaderStore';
import {MainStackParamList} from '../../../../../types/navigation';
import BackgroundImage from '../../../../components/BackgroundImage';
import Navbar from '../../../../components/Navbar';
import RoundedButton from '../../../../components/RoundedButton';
import SafeAreaScrollView from '../../../../components/SafeAreaScrollView';
import CustomText from '../../../../components/Text';
import {useGetQuestionnaireSection} from '../../../../hooks/api/useGetQuestions';
import usePostOnboardingSteps from '../../../../hooks/api/usePostOnboardingSteps';
import useBackButton from '../../../../hooks/useBackButton';
import useFullPageLoader from '../../../../hooks/useFullPageLoader';
import customColor from '../../../../theme/customColor';

type AdditionalInformationRoute = RouteProp<
  MainStackParamList,
  'AdditionalInformation'
>;

interface AdditionalInformationProps {
  route: AdditionalInformationRoute;
}

const AdditionalInformation = ({route}: AdditionalInformationProps) => {
  const {isNewUser} = route?.params || {};
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const {showLoader, hideLoader} = useFullPageLoader();

  const {setSignoutModalVisibility} = useLoaderStore();

  const showSignoutModal = () => {
    setSignoutModalVisibility(true);
    return true;
  };
  useBackButton(showSignoutModal);

  const {data: questions, isLoading} = useGetQuestionnaireSection({
    cacheTime: 0,
    staleTime: 0,
  });

  const {mutateAsync: postOnboardingStep} = usePostOnboardingSteps();
  const {mutateAsync: onContinuePress} = useMutation({
    onMutate: showLoader,
    mutationFn: async () => {
      await postOnboardingStep({milestone: 'questionair'});
    },
    onSettled: hideLoader,
  });

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleContinue = async () => {
    navigation.navigate('QuestionnaireSection', {
      isNewUser: isNewUser ?? false,
    });
  };

  const handleSkip = async () => {
    if (isNewUser) {
      await onContinuePress();
      navigation.navigate('FaceScan');
    } else {
      navigation.navigate('HomepageStackScreens', {
        screen: 'Home',
      });
    }
  };

  return (
    <BackgroundImage className="flex-1 p-4">
      <SafeAreaScrollView style={styles.container} className="px-2 my-6">
        <Navbar noBack={isNewUser} hasLogout />
        <View className="mt-4 items-end">
          <Image
            source={Additional_Information_img as any}
            style={styles.additionalInformationImg}
          />
        </View>
        <View className="mt-4">
          <CustomText
            className="text-3xl font-isidoraSemiBold"
            style={styles.highlightText}>
            {languages?.great_start}
          </CustomText>
          <CustomText
            className="text-base font-isidoraSemiBold"
            style={styles.highlightText}>
            {languages?.ready_to_uncover}
          </CustomText>
        </View>
        <View className="mt-10">
          <CustomText className="text-sm leading-4">
            {languages?.unlock_information}
          </CustomText>
        </View>

        <RoundedButton className="mt-20" onPress={handleContinue}>
          <CustomText className="text-white text-lg font-isidoraSemiBold">
            {languages?.add_additional_details}
          </CustomText>
        </RoundedButton>

        {questions?.questionnaireSetting?.overall_skip && (
          <RoundedButton className="mt-2" onPress={handleSkip}>
            <CustomText className="text-white text-lg font-isidoraSemiBold">
              {languages?.skip_for_now}
            </CustomText>
          </RoundedButton>
        )}
      </SafeAreaScrollView>
    </BackgroundImage>
  );
};

export default AdditionalInformation;

const styles = StyleSheet.create({
  container: {},
  additionalInformationImg: {
    aspectRatio: '1/1',
    resizeMode: 'contain',
    height: 218,
  },
  highlightText: {
    color: customColor.blueBerry,
  },
});
