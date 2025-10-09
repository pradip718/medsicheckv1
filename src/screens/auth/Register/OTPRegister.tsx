import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {MotiTransitionProp, StyleValueWithReplacedTransforms, View} from 'moti';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-paper';
import {AuthBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {SignUpPayload} from '../../../../types/api_payload';
import {SignUpSuccessResponse} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText, isValidPhoneNumber} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {login, signupOTP} from '../../../api/auth';
import CustomPhoneInput from '../../../components/PhoneInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {REMEMBERED_USER_SESSION} from '../../../constants/AsyncStorageKeys';
import useAuthNavigation from '../../../hooks/useAuthNavigation';
import customColor from '../../../theme/customColor';
import Header from './Header';
import Icon from '../../../components/Icon';

type RegisterParams = {
  email: string;
  password: string;
  confirmPassword: string;
};

const OTPRegister = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {params} = useRoute<RouteProp<MainStackParamList, 'OTPRegister'>>();

  const {languages} = useLanguageStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [phone, setPhone] = useState(params?.phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');

  const queryClient = useQueryClient();

  const {mutateAsync: navigateIfExistingUser} = useAuthNavigation({
    hasLoader: false,
    shouldCheckOnboarding: true,
  });

  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: {errors, isDirty, isValid},
  } = useForm<RegisterParams>({
    mode: 'onBlur',
  });

  useEffect(() => {
    if (params?.email) {
      reset({
        email: params.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [params, reset]);

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
      const encryptedPassword = await encryptText(payload?.password);
      return await signupOTP({
        ...payload,
        password: encryptedPassword,
      });
    },
    onSuccess: res => {
      const email = getValues('email');
      // const phoneNumber = getValues('formattedPhonenumber');
      const password = getValues('confirmPassword');
      if (res?.email_verification_flag && res?.phone_verification_flag) {
        loginAndNavigate();
      } else {
        navigation.navigate('ContactVerification', {
          email,
          phoneNumber: phone,
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
  }: RegisterParams) => {
    if (password !== confirmPassword) {
      return errorToast(languages?.password_does_not_match_error_message);
    }
    await signupMutation({
      username: email,
      password: confirmPassword,
      phone_number: phone,
      ...(params?.phoneNumber && {session: params.session || ''}),
    });
  };

  const renderInputContent = () => {
    return (
      <>
        <View className="flex-row items-center space-x-4">
          <View className="flex-grow">
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
                    autoCapitalize="none"
                    inputMode="email"
                    activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!params?.email}
                  />
                  <CustomText className="text-base text-red-500 font-isidoraMedium">
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

          {params?.email && (
            <Icon name="checkmark" size={20} color={customColor.white} />
          )}
        </View>

        <View className="flex-row items-center mt-4 space-x-4">
          {/* <Controller
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
                <CustomPhoneInput<RegisterParams>
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                />
                <CustomText className="text-base text-red-500 font-isidoraMedium">
                  {errors?.formattedPhonenumber?.message}
                </CustomText>
              </>
            )}
          /> */}
          <View className="flex-grow">
            <CustomPhoneInput
              onChange={value => {
                setPhone(value);

                let error = '';
                if (value) {
                  const isValidPhone = isValidPhoneNumber(value);
                  if (!isValidPhone) {
                    error = languages?.phone_number_must_be_valid;
                  }
                } else {
                  error = languages?.required_phone_number;
                }
                setPhoneError(error);
              }}
              value={phone}
              disabled={!!params?.phoneNumber}
              onBlur={() => {
                let error = '';
                if (phone) {
                  const isValidPhone = isValidPhoneNumber(phone);
                  if (!isValidPhone) {
                    error = languages?.phone_number_must_be_valid;
                  }
                } else {
                  error = languages?.required_phone_number;
                }
                setPhoneError(error);
              }}
            />
            <CustomText className="text-base text-red-500 font-isidoraMedium">
              {phoneError}
            </CustomText>
          </View>

          {params?.phoneNumber && (
            <Icon name="checkmark" size={20} color={customColor.white} />
          )}
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
                className="mt-4 bg-transparent"
                textColor="white"
                underlineColor="black"
                activeUnderlineColor="rgba(255, 255, 255, 0.45)"
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
              <CustomText className="text-base text-red-500 font-isidoraMedium">
                {errors?.password?.message}
              </CustomText>
            </>
          )}
          name="password"
          rules={{
            required: languages?.password_is_required,
            pattern: {
              value:
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*._-]).{8,}$/,
              message:
                languages?.password_requirements_message_with_length_and_requirements,
            },
          }}
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
                className="mt-4 bg-transparent"
                textColor="white"
                underlineColor="black"
                activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
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
              <CustomText className="text-base text-red-500 font-isidoraMedium">
                {errors?.confirmPassword?.message}
              </CustomText>
            </>
          )}
          name="confirmPassword"
          rules={{
            required: languages?.confirm_password_is_required,
            pattern: {
              value:
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*._-]).{8,}$/,
              message:
                languages?.password_requirements_message_with_length_and_requirements,
            },
          }}
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
                disabled={
                  isSigningUp || !isDirty || !isValid || isLogging || !phone
                }>
                <CustomText className="text-base text-white font-isidoraSemiBold">
                  {languages?.sign_up}
                </CustomText>
              </RoundedButton>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default OTPRegister;

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
