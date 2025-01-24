import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {UseQueryResult, useQuery} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {AnimatePresence, View} from 'moti';
import React, {useCallback, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {AuthBackground, QRCode} from '../../../../assets';
import AppRoute from '../../../../navigation/AppRoute';
import useLanguageStore from '../../../../store/languageStore';
import useUserProfileStore from '../../../../store/profileStore';
import {LoginSuccessResponse} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {isAndroid} from '../../../../utils';
import {encryptText} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {login} from '../../../api/auth';
import {notifyApi} from '../../../api/user';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';
import {
  LOGIN_ASYNC_KEY,
  REMEMBERED_USER_SESSION,
} from '../../../constants/AsyncStorageKeys';
import useGetAccountStatus from '../../../hooks/api/useGetAccountStatus';
import useGetFamilyMembers from '../../../hooks/api/useGetFamilyMembers';
import useGetOnboarding from '../../../hooks/api/useGetOnboarding';
import useGetOnboardingSteps from '../../../hooks/api/useGetOnboardingSteps';
import useGetUserAttributes from '../../../hooks/api/useGetUserAttributes';
import useGetUserReading from '../../../hooks/api/useGetUserReading';
import {color, units} from '../../../theme';
import SignInByOTP from './SignInByOTP';
import SignInByPassword from './SignInByPassword';
import {
  LoginParam,
  LoginType,
  OnboardingResponse,
  OnboardingStepsResponse,
} from './type';

const Login = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {getItem} = useAsyncStorage(LOGIN_ASYNC_KEY);
  const {languages} = useLanguageStore();
  const {setCurrentActiveProfileId, currentActiveProfileId} =
    useUserProfileStore();

  const [isUserLoggingIn, setIsUserLoggingIn] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('Password');

  const {refetch: getAccountStatus} = useGetAccountStatus({
    enabled: false,
  });
  const {refetch: getFamilyMembers} = useGetFamilyMembers({enabled: false});
  const {refetch: getUserAttributes} = useGetUserAttributes({enabled: false});
  const {refetch: getUserReading} = useGetUserReading({enabled: false});

  const {handleSubmit, control, getValues, formState} = useForm<LoginParam>({
    mode: 'onChange',
  });

  const {
    refetch: getOnboardingStep,
    // data: onboardingSteps,
    isError: isOnboardingStepsError,
  } = useGetOnboardingSteps({
    enabled: false,
    gcTime: 0,
    staleTime: Infinity,
  });

  const {
    refetch: getOnboarding,
    // data: onboarding,
    isError: isOnboardingError,
  } = useGetOnboarding({
    enabled: false,
    gcTime: 0,
    staleTime: Infinity,
  });

  const {data: rememberMe} = useQuery({
    queryKey: ['Remember_Me'],
    queryFn: async () => {
      return getItem();
    },
  });

  const fetchAndSetProfile = async () => {
    const {data: members, isError: isMembersError} = await getFamilyMembers();
    const admin = members?.find(eachMember => eachMember?.relation === 'Admin');
    if (!isMembersError && !currentActiveProfileId) {
      setCurrentActiveProfileId(admin?.user_id ?? '');
    }
    await Promise.all([getUserAttributes(), getUserReading()]);
  };

  const navigateToHome = useCallback(() => {
    navigation.dispatch(
      StackActions.replace('HomepageStackScreens', {
        screen: 'Home',
      }),
    );
  }, [navigation]);

  const navigateBasedOnboardingStep = (onboardingStep: string) => {
    switch (onboardingStep) {
      case 'user-details-submitted':
        return navigation.navigate('UserInformation', {
          fromScreen: 'login',
        });
      case 'first-health-measurement':
        return navigation.navigate('FaceScan');
      case 'questionair':
        return navigation.dispatch(
          StackActions.replace('AdditionalInformation', {
            isNewUser: true,
          }),
        );
      case 'onboarded':
        return navigation.dispatch(
          StackActions.replace('HomepageStackScreens', {
            screen: 'Home',
          }),
        );
      default:
        navigation.navigate('TermsAndConditions');
    }
  };

  const checkForOnboardingStep = async () => {
    const [{data: onboarding}, {data: onboardingSteps}] = await Promise.all([
      getOnboarding() as Promise<UseQueryResult<OnboardingResponse>>,
      getOnboardingStep() as Promise<UseQueryResult<OnboardingStepsResponse>>,
    ]);
    if (isOnboardingError || isOnboardingStepsError) {
      return errorToast(languages?.onboarding_api_failure);
    }

    const nextMilestoneIndex = onboardingSteps?.data?.findIndex(step => {
      return !onboarding?.data?.some(
        onboardingStep => onboardingStep.milestone_tag === step.milestone_tag,
      );
    });

    const hasBasicDetails = onboarding?.data?.some(
      onboardingStep =>
        onboardingStep.milestone_tag === 'user-details-submitted',
    );

    if (hasBasicDetails) {
      const {data: accountStatus} = await getAccountStatus();
      if (!accountStatus?.approved) {
        return navigation?.navigate('UnverifiedUserTab', {
          screen: 'UnverifiedHome',
        });
      }
    }

    if (
      onboardingSteps?.data &&
      nextMilestoneIndex !== undefined &&
      nextMilestoneIndex !== null &&
      nextMilestoneIndex !== -1
    ) {
      navigateBasedOnboardingStep(
        onboardingSteps?.data?.[nextMilestoneIndex]?.milestone_tag,
      );
    } else {
      navigateToHome();
    }
  };

  const storeUserSession = async () => {
    try {
      await EncryptedStorage.setItem(
        REMEMBERED_USER_SESSION,
        JSON.stringify({
          username: getValues('email'),
          password: getValues('password'),
        }),
      );
    } catch (error) {
      console.error('error', error);
    }
  };

  const proceedLoginStep = async (loginResponse: LoginSuccessResponse) => {
    notifyApi('login');
    const password = getValues('password');
    if (
      'user_id' in loginResponse &&
      (!loginResponse?.email_verification_flag ||
        !loginResponse?.phone_verification_flag)
    ) {
      errorToast(languages?.profile_not_verified);
      return navigation.navigate('ContactVerification', {
        email: loginResponse?.user_name,
        phoneNumber: loginResponse?.phone_number,
        user_id: loginResponse?.user_id,
        password,
        loginParams: {
          isEmailVerified: loginResponse?.email_verification_flag,
          isPhoneVerified: loginResponse?.phone_verification_flag,
        },
      });
    }
    await fetchAndSetProfile();
    await checkForOnboardingStep();
  };

  const handlePasswordLogin = async ({email, password}: LoginParam) => {
    setIsUserLoggingIn(true);
    try {
      const encryptedPassword = await encryptText(password);
      const loginResponse = await login({
        username: email,
        password: encryptedPassword,
      });
      if (rememberMe === 'true') {
        await storeUserSession();
      }
      await proceedLoginStep(loginResponse);
    } catch (error) {
      if (error instanceof AxiosError) {
        errorToast(error?.response?.data?.error || '');
      }
    } finally {
      setIsUserLoggingIn(false);
    }
  };

  const handleSwitchLoginType = (type: LoginType) => {
    setLoginType(type);
  };

  return (
    <LinearGradient
      colors={['#6583FF', '#3E64FF']}
      style={styles.linearGradient}>
      <ImageBackground source={AuthBackground as any} className="flex-1">
        <KeyboardAwareScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}>
          <SafeAreaView style={styles.container}>
            <View
              // style={styles.content}
              className="justify-between h-full">
              <View>
                {languages?.showQRScanner?.toLowerCase() === 'true' && (
                  <Pressable
                    className="self-center flex-row space-x-2 items-center pt-6"
                    onPress={() => {
                      navigation.navigate('QRScanner');
                    }}>
                    <Image
                      source={QRCode as ImageSourcePropType}
                      className="h-8 w-8"
                    />
                    <CustomText className="text-white font-isidoraSemiBold text-base">
                      {languages?.qr_scanner}
                    </CustomText>
                  </Pressable>
                )}

                <View className="flex-row justify-center">
                  <View className="justify-end">
                    <Image
                      style={styles.medsiCheck}
                      source={require('../../../../assets/images/MedsiCheck.png')}
                      resizeMode="contain"
                    />
                  </View>
                  <Image
                    style={styles.loginImgPerson}
                    source={require('../../../../assets/images/LoginImgPerson.png')}
                    resizeMode="contain"
                  />
                </View>

                <AnimatePresence exitBeforeEnter>
                  {loginType === 'Password' && (
                    <View
                      key="password-login"
                      className="mt-8"
                      from={{opacity: 0.5, scale: 0}}
                      animate={{opacity: 1, scale: 1}}
                      exit={{opacity: 0.5, scale: 0}}
                      transition={{type: 'timing', duration: 400} as any}>
                      <SignInByPassword
                        handlePasswordLogin={handlePasswordLogin}
                        isUserLoggingIn={isUserLoggingIn}
                        formProps={{
                          handleSubmit,
                          control,
                          formState,
                        }}
                        handleSwitchLoginType={handleSwitchLoginType}
                      />
                    </View>
                  )}
                  {loginType === 'OTP' && (
                    <View
                      key="otp-login"
                      className="mt-8"
                      from={{opacity: 0.5, scale: 0}}
                      animate={{opacity: 1, scale: 1}}
                      exit={{opacity: 0.5, scale: 0}}
                      transition={{type: 'timing', duration: 400} as any}>
                      <SignInByOTP
                        handleSwitchLoginType={handleSwitchLoginType}
                        proceedLoginStep={proceedLoginStep}
                        formProps={{
                          handleSubmit,
                          control,
                          formState,
                          getValues,
                        }}
                      />
                    </View>
                  )}
                </AnimatePresence>
              </View>

              <View key="Footer">
                <TouchableOpacity
                  onPress={() => {
                    navigation?.navigate('PrivacyPolicy', {
                      uri: 'https://medsi.ai/t%C3%A9rminos-y-privacidad',
                    });
                  }}>
                  <CustomText className="text-base mt-6 text-center font-isidoraSemiBold">
                    {languages.tnc} | {languages.pp}
                  </CustomText>
                </TouchableOpacity>
                <View style={styles.signUpTextWrapper}>
                  <CustomText
                    style={styles.footerText}
                    className="text-base text-white font-isidoraRegular">
                    {languages?.no_acount}{' '}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(AppRoute.REGISTER as never)
                    }>
                    <CustomText
                      style={styles.signUpText}
                      className="text-base font-isidoraBold">
                      {languages?.sign_up}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAwareScrollView>
      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 28,
    paddingTop: 20,
    flex: 1,
    // marginBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    // justifyContent: 'space-between',
  },
  medsiCheck: {
    marginRight: -18,
    marginBottom: -10,
    height: units.scale(120),
    width: units.scale(120),
  },
  loginImgPerson: {
    marginTop: 50,
    height: units.scale(200),
    width: units.scale(140),
    alignSelf: 'center',
  },
  signUpTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 40,
  },
  signInButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 70,
  },
  signInOtpButton: {
    width: '50%',
    backgroundColor: 'transparent',
  },
  footerText: {
    textAlign: 'left',
  },
  signUpText: {
    color: color.white,
  },
  phoneWrapper: {
    height: 60,
    width: '100%',
    paddingHorizontal: 30,
    borderRadius: 18,
    backgroundColor: color.pearl,
    flexDirection: 'row',
  },
  phoneInput: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  checkBox: {
    transform: isAndroid
      ? [{scaleX: 1}, {scaleY: 1}]
      : [{scaleX: 0.8}, {scaleY: 0.8}],
  },
});

export default Login;
