import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {UseQueryResult} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {isEmpty} from 'lodash';
import {AnimatePresence, View} from 'moti';
import React, {useCallback, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {AuthBackground, QRCode} from '../../../../assets';
import AppRoute from '../../../../navigation/AppRoute';
import useAppStore from '../../../../store/appStore';
import useLanguageStore from '../../../../store/languageStore';
import useUserProfileStore from '../../../../store/profileStore';
import {LoginSuccessResponse} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText, setUserRegistered} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {login} from '../../../api/auth';
import {notifyApi} from '../../../api/user';
import CustomText from '../../../components/Text';
import {REMEMBERED_USER_SESSION} from '../../../constants/AsyncStorageKeys';
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
  const {languages} = useLanguageStore();
  const {setCurrentActiveProfileId, currentActiveProfileId} =
    useUserProfileStore();
  const {stayLoggedIn} = useAppStore();

  const [isUserLoggingIn, setIsUserLoggingIn] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('Password');
  const isPasswordLogin = loginType === 'Password';
  const translations =
    (languages as unknown as Record<string, string | undefined>) ?? {};
  const heroSubtitleText = isPasswordLogin
    ? translations?.login_subtitle
    : translations?.otp_subtitle;
  const orLabel = translations?.or;

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

  const fetchAndSetProfile = async () => {
    const {data: members, isError: isMembersError} = await getFamilyMembers();
    if (!members || isEmpty(members)) {
      return;
    }
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

  const cleanUserSession = async () => {
    try {
      await EncryptedStorage.removeItem(REMEMBERED_USER_SESSION);
    } catch (error) {
      console.error('error', error);
    }
  };

  const proceedLoginStep = async (loginResponse: LoginSuccessResponse) => {
    const password = getValues('password');
    //Only occurs in email signup --> user already been created in cognito for email
    if (loginResponse?.user_password === false) {
      return navigation.dispatch(
        StackActions.replace('OTPRegister', {email: loginResponse?.user_name}),
      );
    }
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
    notifyApi('login');
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
      if (stayLoggedIn) {
        await storeUserSession();
      } else {
        await cleanUserSession();
      }
      await setUserRegistered();
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
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.screenContent}>
            <View style={styles.contentWrapper}>
              <View style={styles.mainSection}>
                <View style={styles.hero}>
                  {languages?.showQRScanner?.toLowerCase?.() === 'true' && (
                    <Pressable
                      style={styles.qrButton}
                      onPress={() => navigation.navigate('QRScanner')}>
                      <Image
                        source={QRCode as ImageSourcePropType}
                        style={styles.qrIcon}
                      />
                      <CustomText style={styles.qrText}>
                        {languages?.qr_scanner}
                      </CustomText>
                    </Pressable>
                  )}
                  <View style={styles.heroImageRow}>
                    <View style={styles.medsiCheckWrapper}>
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
                  {/* <CustomText style={styles.heroTitle} className="font-isidoraBold">
                {isPasswordLogin
                  ? languages?.login
                  : languages?.sign_in_by_otp_button}
              </CustomText> */}
                  {heroSubtitleText ? (
                    <CustomText
                      style={styles.heroSubtitle}
                      className="font-isidoraRegular">
                      {heroSubtitleText}
                    </CustomText>
                  ) : null}
                </View>

                <View style={styles.formCard}>
                  <AnimatePresence exitBeforeEnter>
                    {isPasswordLogin ? (
                      <View
                        key="password-form"
                        from={{opacity: 0.8, translateY: 12}}
                        animate={{opacity: 1, translateY: 0}}
                        exit={{opacity: 0, translateY: -12}}
                        transition={{type: 'timing', duration: 250} as any}>
                        <SignInByPassword
                          handlePasswordLogin={handlePasswordLogin}
                          isUserLoggingIn={isUserLoggingIn}
                          showAlternativeLoginButton={false}
                          formProps={{
                            handleSubmit,
                            control,
                            formState,
                          }}
                          handleSwitchLoginType={handleSwitchLoginType}
                        />

                        <View style={styles.orRow}>
                          <View style={styles.orLine} />
                          <CustomText style={styles.orText}>
                            {orLabel ?? 'OR'}
                          </CustomText>
                          <View style={styles.orLine} />
                        </View>

                        <TouchableOpacity
                          style={styles.otpEntryButton}
                          onPress={() => handleSwitchLoginType('OTP')}>
                          <CustomText style={styles.otpEntryButtonText}>
                            {languages?.sign_in_by_otp_button}
                          </CustomText>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View
                        key="otp-form"
                        from={{opacity: 0.8, translateY: 12}}
                        animate={{opacity: 1, translateY: 0}}
                        exit={{opacity: 0, translateY: -12}}
                        transition={{type: 'timing', duration: 250} as any}>
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
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => {
                    navigation?.navigate('PrivacyPolicy', {
                      uri:
                        languages?.pp_link ??
                        'https://www.medsi.ai/terminos-y-condiciones/',
                    });
                  }}>
                  <CustomText style={styles.footerLink}>
                    {languages.tnc} | {languages.pp}
                  </CustomText>
                </TouchableOpacity>
                <View style={styles.signUpTextWrapper}>
                  <CustomText style={styles.footerText}>
                    {languages?.no_acount}{' '}
                  </CustomText>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(AppRoute.REGISTER as never)
                    }>
                    <CustomText style={styles.signUpText}>
                      {languages?.sign_up}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  screenContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainSection: {
    flexShrink: 0,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  qrIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  qrText: {
    color: color.white,
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 13,
  },
  heroImageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
  },
  medsiCheckWrapper: {
    justifyContent: 'flex-end',
    marginRight: -12,
  },
  medsiCheck: {
    width: units.scale(120),
    height: units.scale(120),
  },
  loginImgPerson: {
    width: units.scale(150),
    height: units.scale(200),
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 26,
    color: color.white,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    marginTop: 16,
    marginHorizontal: 8,
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 16,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    marginHorizontal: 10,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'IsidoraSans-SemiBold',
  },
  otpEntryButton: {
    marginTop: 16,
    marginHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  otpEntryButtonText: {
    color: color.white,
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 15,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerLink: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    color: color.white,
    fontFamily: 'IsidoraSans-SemiBold',
  },
  signUpTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    textAlign: 'left',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'IsidoraSans-Regular',
  },
  signUpText: {
    color: color.white,
    fontFamily: 'IsidoraSans-Bold',
    marginLeft: 4,
  },
});

export default Login;
