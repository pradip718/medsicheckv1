import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {SafeAreaView, View} from 'moti';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  StyleSheet,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-paper';
import {AuthBackground} from '../../../../assets';
import useAppStore from '../../../../store/appStore';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText, isValidPhoneNumber} from '../../../../utils/methods';
import {login} from '../../../api/auth';
import BottomAlert from '../../../components/AlertModal/BottomAlert';
import AnimatedWrapper from '../../../components/AnimatedWrapper';
import Icon from '../../../components/Icon';
import CustomPhoneInput from '../../../components/PhoneInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {
  LOGIN_ASYNC_KEY,
  REMEMBERED_USER_SESSION,
} from '../../../constants/AsyncStorageKeys';
import useAuthNavigation from '../../../hooks/useAuthNavigation';
import customColor from '../../../theme/customColor';
import Header from './Header';
import EmailVerificationModal from './modal/EmailVerification';
import MobileVerificationModal from './modal/MobileVerfication';

type OTPRouteProp = RouteProp<MainStackParamList, 'ContactVerification'>;

interface OTPProps {
  route: OTPRouteProp;
}

type ContactParams = {
  email: string;
  formattedPhonenumber: string;
};

const VerifiedMessage = ({message}: {message: string}) => (
  <CustomText className="text-white text-center text-base font-isidoraSemiBold">
    {message}
  </CustomText>
);

const RenderFooter = ({
  isEmailVerified,
  isPhoneVerified,
}: {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}) => {
  const {screenName} = useAppStore();

  console.log('screenName', screenName);
  const {languages} = useLanguageStore();

  if (isEmailVerified && isPhoneVerified) {
    return <VerifiedMessage message={languages?.all_verified} />;
  }

  if (!isEmailVerified && !isPhoneVerified) {
    return <VerifiedMessage message={languages?.none_verified} />;
  }

  return (
    <>
      {isEmailVerified && (
        <>
          {screenName?.previous !== 'Register' && (
            <VerifiedMessage message={languages?.email_verified_header} />
          )}
          <VerifiedMessage message={languages?.email_verified_content} />
        </>
      )}
      {isPhoneVerified && (
        <>
          {screenName?.previous !== 'Register' && (
            <VerifiedMessage message={languages?.phone_verified_header} />
          )}
          <VerifiedMessage message={languages?.phone_verified_content} />
        </>
      )}
    </>
  );
};

const ContactVerification = ({route}: OTPProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {email, password, phoneNumber, user_id, loginParams} =
    route?.params || {
      email: '',
      phoneNumber: '',
    };
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(phoneNumber);
  const {setItem} = useAsyncStorage(LOGIN_ASYNC_KEY);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneInputFocus, setPhoneInputFocus] = useState(false);

  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [showMobileVerificationModal, setShowMobileVerificationModal] =
    useState(false);

  const {mutateAsync: navigateIfExistingUser} = useAuthNavigation({
    hasLoader: false,
    shouldCheckOnboarding: true,
  });
  const {mutateAsync: fetchProfileAndNavigate, isPending: isLoadingAuthSteps} =
    useMutation({
      mutationKey: ['fetch-profile-navigate'],
      mutationFn: async () => {
        return await navigateIfExistingUser();
      },
    });

  const queryClient = useQueryClient();

  const storeUserSession = async () => {
    try {
      await EncryptedStorage.setItem(
        REMEMBERED_USER_SESSION,
        JSON.stringify({
          username: currentEmail,
          password: password,
        }),
      );
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      return;
    }
    try {
      const encryptedPassword = await encryptText(password);
      await login({username: currentEmail, password: encryptedPassword});
      if (currentEmail !== email || password !== route.params?.password) {
        await storeUserSession();
        await setItem('true');
        await queryClient.invalidateQueries({queryKey: ['Remember_Me']});
      }
    } catch (error: any) {
      navigation.navigate('Login');
    }
  };

  const {
    control,
    getValues,
    setFocus,
    formState: {errors},
  } = useForm<ContactParams>({
    mode: 'onBlur',
    defaultValues: {
      email: currentEmail,
      formattedPhonenumber: phoneNumber,
    },
  });

  const loginAndNavigate = async () => {
    if (password) {
      await handleLogin();
    }
    fetchProfileAndNavigate();
  };

  useEffect(() => {
    if (loginParams?.isEmailVerified) {
      setIsEmailVerified(loginParams?.isEmailVerified);
    }
    if (loginParams?.isPhoneVerified) {
      setIsPhoneVerified(loginParams?.isPhoneVerified);
    }
  }, [loginParams]);

  useEffect(() => {
    if (isEmailVerified && isPhoneVerified) {
      loginAndNavigate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmailVerified, isPhoneVerified]);

  const updateCurrentEmail = (updatedEmail: string) => {
    setCurrentEmail(updatedEmail);
  };
  const updateCurrentPhoneNumber = (updatedPhoneNumber: string) => {
    setCurrentPhoneNumber(updatedPhoneNumber);
  };

  const handleEmailVerificationModal = (open: boolean) => {
    setShowEmailVerificationModal(open);
  };

  const handleMobileVerificationModal = (open: boolean) => {
    setShowMobileVerificationModal(open);
  };

  const handleEmailVerified = (verify: boolean) => {
    setIsEmailVerified(verify);
  };

  const handlePhoneVerified = (verify: boolean) => {
    setIsPhoneVerified(verify);
  };

  return (
    <ImageBackground
      source={AuthBackground as any}
      style={styles.container}
      className="flex-1">
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        className="flex-grow h-full"
        keyboardShouldPersistTaps="handled"
        bounces={false}
        nestedScrollEnabled
        enableOnAndroid>
        <SafeAreaView className="pt-4 pb-[40]">
          <View className="flex-grow">
            <Header />

            <AnimatedWrapper className="px-6 mt-8 flex-row items-center space-x-4">
              <View className="flex-grow">
                <Controller
                  control={control}
                  render={({field: {onChange, onBlur, value, ref}}) => (
                    <>
                      <TextInput
                        label={
                          <CustomText
                            style={styles.inputLabel}
                            className="text-base font-isidoraSemiBold">
                            {languages?.username}
                          </CustomText>
                        }
                        value={value}
                        className="bg-transparent"
                        textColor="white"
                        underlineColor="black"
                        autoCapitalize="none"
                        inputMode="email"
                        activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        disabled={isEmailVerified}
                      />
                      <CustomText className="text-base font-isidoraMedium text-red-500">
                        {errors?.email?.message}
                      </CustomText>
                    </>
                  )}
                  name="email"
                  rules={{
                    required: languages?.email_required,
                    pattern: {
                      value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                      message: languages?.email_validation_error_msg,
                    },
                  }}
                />
              </View>
              {isEmailVerified ? (
                <Icon name="checkmark" size={20} color={customColor.white} />
              ) : (
                <RoundedButton
                  resetStyle
                  className="bg-midnightBlue min-h-[22] min-w-[57] px-2 py-1 max-w-[70]"
                  onPress={() => {
                    Keyboard.dismiss();
                    handleEmailVerificationModal(true);
                  }}>
                  <CustomText
                    className="text-white text-sm font-isidoraMedium"
                    numberOfLines={1}>
                    {languages?.mobile_verification_message_title}
                  </CustomText>
                </RoundedButton>
              )}
            </AnimatedWrapper>
            <AnimatedWrapper className="px-6 mt-4 flex-row items-center space-x-4">
              <View className="flex-grow">
                <Controller
                  name="formattedPhonenumber"
                  control={control}
                  rules={{
                    required: languages?.required_phone_number,
                    validate: value => {
                      const isValidPhone = isValidPhoneNumber(value);
                      if (!isValidPhone) {
                        return languages?.phone_number_must_be_valid;
                      }
                    },
                  }}
                  render={({field: {onChange, value, onBlur}}) => (
                    <>
                      <CustomPhoneInput<ContactParams>
                        key={`${phoneInputFocus}`}
                        disabled={isPhoneVerified}
                        autoFocus={phoneInputFocus}
                        onChange={onChange}
                        value={value}
                        onBlur={onBlur}
                      />
                      <CustomText className="text-base font-isidoraMedium text-red-500">
                        {errors?.formattedPhonenumber?.message}
                      </CustomText>
                    </>
                  )}
                />
              </View>
              {isPhoneVerified ? (
                <Icon name="checkmark" size={20} color={customColor.white} />
              ) : (
                <RoundedButton
                  resetStyle
                  className="bg-midnightBlue min-h-[22] min-w-[57] px-2 py-1 max-w-[70]"
                  onPress={() => {
                    Keyboard.dismiss();
                    handleMobileVerificationModal(true);
                    setPhoneInputFocus(false);
                  }}>
                  <CustomText
                    className="text-white text-sm font-isidoraMedium"
                    numberOfLines={1}>
                    {languages?.mobile_verification_message_title}
                  </CustomText>
                </RoundedButton>
              )}
            </AnimatedWrapper>
            <AnimatedWrapper
              className="mt-12"
              isTranslateY={false}
              shouldScaleFrom0
              duration={1000}>
              {isLoadingAuthSteps && (
                <ActivityIndicator
                  size="large"
                  color={customColor.white}
                  className="mb-4"
                />
              )}
              <RenderFooter
                isEmailVerified={isEmailVerified}
                isPhoneVerified={isPhoneVerified}
              />
            </AnimatedWrapper>
          </View>
        </SafeAreaView>

        <BottomAlert
          visible={showEmailVerificationModal || showMobileVerificationModal}
          hideModal={() => {
            handleEmailVerificationModal(false);
            handleMobileVerificationModal(false);
          }}
          hasBackgroundImage>
          {showEmailVerificationModal && (
            <EmailVerificationModal
              updatedEmail={getValues('email')}
              email={currentEmail}
              updateCurrentEmail={updateCurrentEmail}
              handleEmailVerified={handleEmailVerified}
              closeVerficationModal={(focus?: boolean) => {
                handleEmailVerificationModal(false);
                if (focus) {
                  setFocus('email');
                }
              }}
            />
          )}
          {showMobileVerificationModal && (
            <MobileVerificationModal
              email={isEmailVerified ? getValues('email') : currentEmail}
              phoneNumber={currentPhoneNumber}
              updateCurrentPhoneNumber={updateCurrentPhoneNumber}
              updatedPhoneNumber={getValues('formattedPhonenumber')}
              user_id={user_id}
              handlePhoneVerified={handlePhoneVerified}
              closeVerficationModal={(focus?: boolean) => {
                handleMobileVerificationModal(false);
                if (focus) {
                  setPhoneInputFocus(true);
                }
              }}
            />
          )}
        </BottomAlert>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default ContactVerification;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    // paddingBottom: 40,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  verifyButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 140,
  },
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cellContainer: {
    width: 44,
    height: 60,
    lineHeight: 38,
    paddingTop: 10,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  cell: {
    width: 44,
    height: 40,
    lineHeight: 38,
    fontSize: 32,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },

  inputLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
});
