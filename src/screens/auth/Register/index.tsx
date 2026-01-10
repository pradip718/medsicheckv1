import {zodResolver} from '@hookform/resolvers/zod';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {MotiTransitionProp, StyleValueWithReplacedTransforms, View} from 'moti';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthBackground} from '../../../../assets';
import AppRoute from '../../../../navigation/AppRoute';
import useLanguageStore from '../../../../store/languageStore';
import {SignUpPayload} from '../../../../types/api_payload';
import {SignUpSuccessResponse} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {login, signup} from '../../../api/auth';
import CustomPhoneInput from '../../../components/PhoneInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {REMEMBERED_USER_SESSION} from '../../../constants/AsyncStorageKeys';
import useAuthNavigation from '../../../hooks/useAuthNavigation';
import {
  ANALYTICS_EVENTS,
  identifyUserAndSetProperties,
  prepareUserProperties,
  trackAnalytics,
} from '../../../services/analytics';
import customColor from '../../../theme/customColor';
import {createRegisterSchema} from '../../../validation';
import Header from './Header';

type RegisterParams = {
  email: string;
  password: string;
  confirmPassword: string;
  formattedPhonenumber: string;
};

const Register = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const queryClient = useQueryClient();

  const {mutateAsync: navigateIfExistingUser} = useAuthNavigation({
    hasLoader: false,
    shouldCheckOnboarding: true,
  });

  useEffect(() => {
    const hide = async () => {
      await BootSplash.hide({fade: true});
    };
    hide();
  });

  const registerSchema = createRegisterSchema(languages);

  const {
    handleSubmit,
    control,
    getValues,
    formState: {errors, isDirty, isValid},
  } = useForm<RegisterParams>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      formattedPhonenumber: '',
    },
  });

  const {mutateAsync: loginAndNavigate, isPending: isLogging} = useMutation({
    mutationKey: ['fetch-profile-navigate'],
    mutationFn: async () => {
      const password = getValues('confirmPassword');
      if (!password) {
        return;
      }
      await handleLogin();
      return await navigateIfExistingUser();
    },
  });

  const {mutateAsync: signupMutation, isPending: isSigningUp} = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (
      payload: SignUpPayload,
    ): Promise<SignUpSuccessResponse> => {
      trackAnalytics(ANALYTICS_EVENTS.USER_REGISTRATION_STARTED);
      const encryptedPassword = await encryptText(payload?.password);
      return await signup({
        ...payload,
        password: encryptedPassword,
      });
    },
    onSuccess: async res => {
      trackAnalytics(ANALYTICS_EVENTS.USER_REGISTRATION_SUCCESS);
      const email = getValues('email');
      const phoneNumber = getValues('formattedPhonenumber');
      const password = getValues('confirmPassword');

      // Identify user immediately and synchronously after registration
      // This MUST happen before navigation to ensure all subsequent events use user_id
      if (res?.user_id) {
        const userProperties = prepareUserProperties({
          user_id: res.user_id,
          email: email,
          phone_number: phoneNumber,
        } as Record<string, unknown>);
        // Call synchronously - identifyUserAndSetProperties is synchronous
        identifyUserAndSetProperties(res.user_id, userProperties);
        // Small delay to ensure Mixpanel processes the identify call before navigation
        // This prevents screen views from being tracked with device_id
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (res?.email_verification_flag && res?.phone_verification_flag) {
        loginAndNavigate();
      } else {
        navigation.navigate('ContactVerification', {
          email,
          phoneNumber,
          password: password,
          user_id: res?.user_id ?? '',
          loginParams: {
            isEmailVerified: res?.email_verification_flag,
            isPhoneVerified: res?.phone_verification_flag,
          },
        });
      }
    },
    onError: error => {
      if (error instanceof AxiosError) {
        trackAnalytics(ANALYTICS_EVENTS.USER_REGISTRATION_ERROR, {
          error_type: error?.response?.data?.error || 'Unknown',
          error_message: error?.response?.data?.error || 'Registration failed',
        });
        errorToast(error?.response?.data?.error || '');
      }
    },
  });

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

  const handleLogin = async () => {
    const password = getValues('confirmPassword');
    const email = getValues('email');
    if (!password) {
      return;
    }
    try {
      const encryptedPassword = await encryptText(password);
      await login({username: email, password: encryptedPassword});
      await storeUserSession();
      await queryClient.invalidateQueries({queryKey: ['Remember_Me']});
    } catch (error: any) {
      navigation.navigate('Login');
    }
  };

  const handleSignUp = async ({
    email,
    password,
    confirmPassword,
    formattedPhonenumber,
  }: RegisterParams) => {
    if (password !== confirmPassword) {
      return errorToast(languages?.password_does_not_match_error_message);
    }
    await signupMutation({
      username: email,
      password: confirmPassword,
      phone_number: formattedPhonenumber,
    });
  };

  const renderInputContent = () => {
    const isSubmitting = isSigningUp || isLogging;

    return (
      <>
        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
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
                disabled={isSubmitting}
                autoCapitalize="none"
                inputMode="email"
                activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <CustomText className="text-base font-isidoraMedium text-red-500">
                {errors?.email?.message}
              </CustomText>
            </>
          )}
          name="email"
        />

        <View className="mt-4">
          <Controller
            name="formattedPhonenumber"
            control={control}
            render={({field: {onChange, value, onBlur}}) => (
              <>
                <CustomPhoneInput<RegisterParams>
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  disabled={isSubmitting}
                />
                <CustomText className="text-base font-isidoraMedium text-red-500">
                  {errors?.formattedPhonenumber?.message}
                </CustomText>
              </>
            )}
          />
        </View>

        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <TextInput
                label={
                  <CustomText
                    style={styles.inputLabel}
                    className="text-base font-isidoraSemiBold">
                    {languages?.create_password}
                  </CustomText>
                }
                value={value}
                className="bg-transparent mt-4"
                textColor="white"
                underlineColor="black"
                activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                disabled={isSubmitting}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={!showPassword ? 'eye' : 'eye-off'}
                    color={customColor.black}
                    onPress={() => setShowPassword(prev => !prev)}
                  />
                }
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <CustomText className="text-base font-isidoraMedium text-red-500">
                {errors?.password?.message}
              </CustomText>
            </>
          )}
          name="password"
        />

        <Controller
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <TextInput
                label={
                  <CustomText
                    style={styles.inputLabel}
                    className="text-base font-isidoraSemiBold">
                    {languages?.confirm_password}
                  </CustomText>
                }
                value={value}
                className="bg-transparent mt-4"
                textColor="white"
                underlineColor="black"
                activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                disabled={isSubmitting}
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={!showConfirmPassword ? 'eye' : 'eye-off'}
                    color={customColor.black}
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                  />
                }
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <CustomText className="text-base font-isidoraMedium text-red-500">
                {errors?.confirmPassword?.message}
              </CustomText>
            </>
          )}
          name="confirmPassword"
        />
      </>
    );
  };

  return (
    <ImageBackground
      source={AuthBackground as any}
      style={styles.container}
      className="flex-1">
      <SafeAreaView className="mt-4">
        <KeyboardAwareScrollView>
          <Header />
          <View
            className="px-6 mt-8"
            from={{opacity: 0.5, translateY: 200}}
            animate={{opacity: 1, translateY: 0}}
            transition={
              {
                type: 'timing',
                duration: 500,
              } as MotiTransitionProp<
                StyleValueWithReplacedTransforms<ViewStyle>
              >
            }>
            {renderInputContent()}

            <View
              key="send-otp-button"
              from={{opacity: 0, translateY: 200}}
              animate={{opacity: 1, translateY: 0}}
              transition={{type: 'timing', duration: 500} as any}>
              <RoundedButton
                style={styles.signUpButton}
                onPress={handleSubmit(handleSignUp)}
                loading={isSigningUp || isLogging}
                disabled={isSigningUp || !isDirty || !isValid || isLogging}>
                <CustomText className="text-base text-white font-isidoraSemiBold">
                  {languages?.sign_up}
                </CustomText>
              </RoundedButton>
            </View>
          </View>

          <View
            from={{opacity: 0, translateY: 200}}
            animate={{opacity: 1, translateY: 0}}
            transition={
              {
                type: 'timing',
                duration: 1000,
              } as MotiTransitionProp<
                StyleValueWithReplacedTransforms<ViewStyle>
              >
            }>
            <TouchableOpacity
              onPress={() => {
                navigation?.navigate('PrivacyPolicy', {
                  uri: languages?.pp_link,
                });
              }}>
              <CustomText className="text-base mt-6 text-center font-isidoraSemiBold">
                {languages?.tnc} | {languages?.pp}
              </CustomText>
            </TouchableOpacity>

            <View style={styles.signUpTextWrapper}>
              <CustomText
                style={styles.footerText}
                className="text-base text-white font-isidoraRegular">
                {languages?.have_acount}
              </CustomText>
              <TouchableOpacity
                className="px-1"
                onPress={() => navigation.navigate(AppRoute.LOGIN as never)}>
                <CustomText
                  style={styles.signUpText}
                  className="text-base text-white font-isidoraBold">
                  {languages?.login}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {},
  signUpTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 40,
  },
  footerText: {
    textAlign: 'center',
  },
  signUpText: {
    color: customColor.white,
  },
  signUpButton: {
    width: '50%',
    backgroundColor: '#222B45',
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
  phoneInput: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
});
