import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormHandleSubmit,
  useWatch,
} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {RadioButton} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import useLanguageStore from '../../../../store/languageStore';
import {LoginOTPPayload, OTPChannel} from '../../../../types/api_payload';
import {
  isLoginOTPResponse,
  isLoginSuccessResponse,
  LoginOTPResponse,
  LoginSuccessResponse,
} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {isValidPhoneNumber} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {
  resendSignUpOTP,
  sendLoginOTP,
  sendSignUpOTP,
  verifyLoginOTP,
  verifySignUpOTP,
} from '../../../api/auth';
import AnimatedWrapper from '../../../components/AnimatedWrapper';
import CustomTextInput from '../../../components/CustomTextInput';
import Icon from '../../../components/Icon';
import CustomPhoneInput from '../../../components/PhoneInput';
import Pressable from '../../../components/Pressable';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import Timer from '../Register/Timer';
import {LoginParam, LoginType} from './type';

type SignInByOTPProps = {
  handleSwitchLoginType: (type: LoginType) => void;
  proceedLoginStep: (res: LoginSuccessResponse) => Promise<void>;
  formProps: {
    handleSubmit: UseFormHandleSubmit<LoginParam>;
    control: Control<LoginParam>;
    formState: FormState<LoginParam>;
    getValues: UseFormGetValues<LoginParam>;
  };
};

type OTPSigninType = 'Email' | 'Phone';

const SignInByOTP = ({
  handleSwitchLoginType,
  formProps,
  proceedLoginStep,
}: SignInByOTPProps) => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const [didSendOTP, setDidSendOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [otpSigninType, setOTPSigninType] = useState<OTPSigninType>('Email');
  const [otpChannel, setOTPChannel] = useState<OTPChannel>('whatsapp');
  const [sendOTPResponse, setSendOTPResponse] = useState<
    LoginOTPResponse | LoginSuccessResponse | null
  >(null);

  const [isNewUser, setIsNewUser] = useState(false);
  console.log('🚀 ~ SignInByOTP ~ isNewUser:', isNewUser);

  const {
    control,
    formState: {errors},
    getValues,
  } = formProps;

  const watchedEmail = useWatch({name: 'email', control});
  const watchedPhoneNumber = useWatch({name: 'formattedPhonenumber', control});

  const setDeliveryChannel = (channel: OTPChannel) => {
    if (channel === otpChannel) {
      return;
    }

    if (channel === 'whatsapp' && otpSigninType !== 'Phone') {
      setOTPSigninType('Phone');
    }

    setOTPChannel(channel);
  };

  const {mutateAsync: verifyLoginOTPMutation, isPending: isValidatingOTP} =
    useMutation({
      mutationKey: ['verify-login-otp'],
      mutationFn: verifyLoginOTP,
      onSuccess: async res => {
        if ('session' in res) {
          setSendOTPResponse(prevResponse => ({
            otp_sent:
              prevResponse && 'otp_sent' in prevResponse
                ? prevResponse.otp_sent
                : false,
            user_id: prevResponse?.user_id ?? '',
            user_name: prevResponse?.user_name ?? '',
            session: res?.session ?? '',
          }));
          errorToast(languages?.invalid_otp);
        } else {
          if ('error' in res) {
            return;
          }
          await proceedLoginStep(res);
        }
      },
      onError: err => {
        if (err instanceof AxiosError) {
          return errorToast(err?.response?.data?.error);
        }
      },
    });
  const {
    mutateAsync: verifySignUpOTPMutation,
    isPending: isValidatingSignUpOTP,
  } = useMutation({
    mutationKey: ['verify-signup-otp'],
    mutationFn: verifySignUpOTP,
    onSuccess: async res => {
      console.log('loginOTPResponse', loginOTPResponse);
      console.log('🚀 ~ VerifyLoginOTPScreen ~ res:', res);
      if (
        loginOTPResponse &&
        'phone_verification_flag' in loginOTPResponse &&
        'email_verification_flag' in loginOTPResponse &&
        loginOTPResponse?.phone_verification_flag === true &&
        loginOTPResponse?.email_verification_flag === false
      ) {
        return navigation.navigate('ContactVerification', {
          email: loginOTPResponse?.user_name,
          phoneNumber: loginOTPResponse?.phone_number,
          user_id: loginOTPResponse?.user_id,
          isOTPSignup: true,
          loginParams: {
            isEmailVerified: loginOTPResponse?.email_verification_flag,
            isPhoneVerified: loginOTPResponse?.phone_verification_flag,
          },
        });
      }
      navigation.dispatch(
        StackActions.replace(
          'OTPRegister',
          otpSigninType === 'Email'
            ? {email: watchedEmail}
            : {
                phoneNumber: watchedPhoneNumber,
                session:
                  sendOTPResponse && 'session' in sendOTPResponse
                    ? sendOTPResponse.session
                    : '',
              },
        ),
      );
    },
    onError: err => {
      if (err instanceof AxiosError) {
        return errorToast(err?.response?.data?.error);
      }
    },
  });

  const {
    mutateAsync: sendLoginOTPMutation,
    isPending: isSendingLoginOTP,
    data: loginOTPResponse,
  } = useMutation({
    mutationKey: ['send-login-otp'],
    mutationFn: sendLoginOTP,
    onSuccess: async res => {
      console.log('res', res);

      //User Not Confirmed scenario
      if ('is_verified' in res && res.user_id && res.is_verified === false) {
        const signupOtpResponse = await sendSignupOTPMutation({
          username:
            otpSigninType === 'Email' ? res?.user_name : res?.phone_number,
          ...(otpSigninType === 'Phone' ? {channel: otpChannel} : {}),
        });
        console.log('signupOtpResponse', signupOtpResponse);
        if (signupOtpResponse?.error) {
          return;
        }
        setDidSendOTP(true);
        setSendOTPResponse(signupOtpResponse);
        setIsNewUser(true);
        return;
      }

      //User Confirmed scenario
      if ('error' in res && res?.error) {
        return errorToast(res?.error);
      }
      setDidSendOTP(true);
      setSendOTPResponse(res);
    },
    onError: async (err, variables) => {
      if (err instanceof AxiosError) {
        console.log('🚀 ~ SignInByOTP ~ err:', err.response);

        if (err.response?.status === 400 && err.response?.data?.new_user) {
          try {
            const res = await sendSignUpOTP({
              username: variables.username,
              channel: variables.channel ?? otpChannel,
            });
            console.log('🚀 ~ OTPLoginScreen ~ res:', res);

            if (res?.error) {
              return errorToast(res?.error);
            }
            setDidSendOTP(true);
            setSendOTPResponse(res);
            setIsNewUser(true);
            return;
          } catch (error) {
            return errorToast(err?.response?.data?.error);
          }
        }

        return errorToast(err?.response?.data?.error);
      }
    },
  });

  const {mutateAsync: sendSignupOTPMutation, isPending: isSendingSignUpOTP} =
    useMutation({
      mutationKey: ['send-signup-otp'],
      mutationFn: resendSignUpOTP,
      onSuccess: res => {
        if (res?.error) {
          return errorToast(res?.error);
        }
        setDidSendOTP(true);
        setSendOTPResponse(res);
      },
      onError: async err => {
        if (err instanceof AxiosError) {
          return errorToast(err?.response?.data?.error);
        }
      },
    });

  const handleSendOTP = async (channelOverride?: OTPChannel) => {
    const email = getValues('email');
    const phoneNumber = getValues('formattedPhonenumber');
    const selectedChannel = channelOverride ?? otpChannel;

    if (channelOverride && channelOverride !== otpChannel) {
      setDeliveryChannel(channelOverride);
    }

    if (otpSigninType === 'Phone') {
      if (!phoneNumber) {
        return errorToast(languages?.required_phone_number);
      }
      const isPhoneValid = isValidPhoneNumber(phoneNumber ?? '');
      if (!isPhoneValid) {
        return errorToast(languages?.phone_number_must_be_valid);
      }
    } else if (!email) {
      return errorToast(languages?.email_empty);
    }

    const username = otpSigninType === 'Phone' ? phoneNumber : email;

    if (!username) {
      return;
    }

    const otpPayload: LoginOTPPayload = {
      username: username ?? '',
      ...(otpSigninType === 'Phone' ? {channel: selectedChannel} : {}),
    };

    if (isNewUser) {
      await sendSignupOTPMutation(otpPayload);
    } else {
      await sendLoginOTPMutation(otpPayload);
    }
  };

  console.log('sendOTPResponses', sendOTPResponse);

  const handleVerifyLoginOTP = async () => {
    if (!otp) {
      return errorToast(languages?.generic_error_message);
    }
    const verificationChannel =
      otpSigninType === 'Phone' ? otpChannel : undefined;

    isNewUser
      ? await verifySignUpOTPMutation({
          otp_value: otp,
          username:
            otpSigninType === 'Email'
              ? sendOTPResponse?.user_name ?? ''
              : isLoginSuccessResponse(sendOTPResponse)
              ? sendOTPResponse?.phone_number ?? ''
              : '',
          session:
            otpSigninType === 'Email'
              ? ''
              : isLoginOTPResponse(sendOTPResponse)
              ? sendOTPResponse?.session ?? ''
              : '',
          ...(verificationChannel ? {channel: verificationChannel} : {}),
        })
      : await verifyLoginOTPMutation({
          otp_value: otp,
          session: isLoginOTPResponse(sendOTPResponse)
            ? sendOTPResponse?.session ?? ''
            : '',
          username: sendOTPResponse?.user_name ?? '',
          ...(verificationChannel ? {channel: verificationChannel} : {}),
        });
  };

  const isDisabled =
    isSendingLoginOTP ||
    (otpSigninType === 'Email' && !watchedEmail) ||
    (otpSigninType === 'Email' && !!errors?.email) ||
    (otpSigninType === 'Phone' && !watchedPhoneNumber) ||
    (otpSigninType === 'Phone' && !!errors?.formattedPhonenumber);

  return (
    <View className="mx-6 mt-4">
      <RadioButton.Group
        onValueChange={(newValue: string) => {
          if (newValue === 'Email' || newValue === 'Phone') {
            setOTPSigninType(newValue);
            setDidSendOTP(false);
            setOTP('');
            if (newValue === 'Email' && otpChannel !== 'sms') {
              setOTPChannel('sms');
            }
          }
        }}
        value={otpSigninType}>
        <View className="flex-row flex-wrap w-full mt-8 mediumPhone:flex-nowrap mediumPhone:space-x-4">
          <View className="flex-row items-center">
            <RadioButton.Android
              value="Email"
              color="white"
              underlayColor="white"
              uncheckedColor="white"
            />
            <CustomText className="text-base text-white font-isidoraMedium">
              {languages?.email}
            </CustomText>
          </View>
          <View className="flex-row items-center">
            <RadioButton.Android
              value="Phone"
              color="white"
              underlayColor="white"
              uncheckedColor="white"
            />
            <CustomText className="text-base text-white font-isidoraMedium">
              {languages?.phone_number}
            </CustomText>
          </View>
        </View>
      </RadioButton.Group>

      {otpSigninType === 'Email' && (
        <View className="flex-row items-center mt-6 space-x-4">
          <View className="flex-grow">
            <Controller
              control={control}
              render={({field: {onChange, value, onBlur}}) => (
                <CustomTextInput
                  style={styles.input}
                  inputMode="email"
                  placeholder={languages?.email_mobile_placeholder}
                  placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
                  value={value}
                  editable={!didSendOTP}
                  autoCapitalize="none"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
              name="email"
              rules={{
                required: languages?.email_empty,
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: languages?.email_validation_error_msg,
                },
              }}
            />
          </View>
          {didSendOTP && (
            <Pressable
              className="flex-shrink"
              onPress={() => {
                setOTP('');
                setDidSendOTP(false);
                setIsNewUser(false);
              }}>
              <CustomText className="text-base text-white underline font-isidoraSemiBold">
                {languages?.edit}
              </CustomText>
            </Pressable>
          )}
        </View>
      )}

      {otpSigninType === 'Phone' && (
        <View className="flex-row items-center mt-6 space-x-4">
          <View className="flex-grow">
            <Controller
              name="formattedPhonenumber"
              control={control}
              rules={{
                required: languages?.required_phone_number,
                validate: value => {
                  const isValidPhone = isValidPhoneNumber(value ?? '');
                  if (!isValidPhone) {
                    return languages?.phone_number_must_be_valid;
                  }
                },
              }}
              render={({field: {onChange, value, onBlur}}) => (
                <>
                  <CustomPhoneInput<LoginParam>
                    disabled={didSendOTP}
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    key={`${didSendOTP}`}
                  />
                  <CustomText className="text-base text-red-500 font-isidoraMedium">
                    {errors?.formattedPhonenumber?.message}
                  </CustomText>
                </>
              )}
            />
          </View>
          {didSendOTP && (
            <Pressable
              className="flex-shrink"
              onPress={() => {
                setOTP('');
                setDidSendOTP(false);
                setIsNewUser(false);
              }}>
              <CustomText className="text-base text-white underline font-isidoraSemiBold">
                {languages?.edit}
              </CustomText>
            </Pressable>
          )}
        </View>
      )}

      {didSendOTP ? (
        <AnimatedWrapper className="mt-6">
          <CustomTextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder={languages?.enter_otp_placeholder}
            placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
            maxLength={6}
            value={otp}
            editable={!isValidatingOTP || !isValidatingSignUpOTP}
            autoCapitalize="none"
            onChangeText={setOTP}
            editing={!isValidatingOTP}
          />
          <View className="flex-row items-center justify-end my-4">
            <Timer onResendPress={() => handleSendOTP()} />
          </View>
          <RoundedButton
            style={styles.button}
            className="mt-10"
            loading={isValidatingOTP || isValidatingSignUpOTP}
            disabled={
              isValidatingOTP || otp.length !== 6 || isValidatingSignUpOTP
            }
            onPress={handleVerifyLoginOTP}>
            <CustomText className="text-base text-white font-isidoraSemiBold">
              {languages.validate_otp_button}
            </CustomText>
          </RoundedButton>
        </AnimatedWrapper>
      ) : (
        <RoundedButton
          style={styles.button}
          className="mt-10 space-x-2"
          loading={isSendingLoginOTP || isSendingSignUpOTP}
          disabled={isDisabled}
          onPress={() => handleSendOTP(otpChannel)}>
          <CustomText className="text-base text-white font-isidoraSemiBold">
            {languages.get_otp_button}
          </CustomText>
          {otpSigninType === 'Phone' &&
            (otpChannel === 'whatsapp' ? (
              <Icon
                name="whatsapp"
                size={20}
                color={isDisabled ? '#222B45' : '#25D366'}
              />
            ) : (
              <MaterialIcon
                name="sms"
                size={20}
                color={isDisabled ? '#222B45' : '#FFFFFF'}
              />
            ))}
        </RoundedButton>
      )}

      {otpSigninType === 'Phone' && (
        <>
          <Pressable
            className="flex-row items-center justify-center mt-4 space-x-2"
            onPress={() =>
              setDeliveryChannel(otpChannel === 'whatsapp' ? 'sms' : 'whatsapp')
            }>
            {otpChannel === 'whatsapp' ? (
              <MaterialIcon name="sms" size={18} color="#FFFFFF" />
            ) : (
              <Icon name="whatsapp" size={18} color="#25D366" />
            )}
            <CustomText className="text-sm text-white font-isidoraMedium">
              {otpChannel === 'whatsapp'
                ? languages.get_otp_by_message_button
                : languages.get_otp_by_whatsapp_button}
            </CustomText>
          </Pressable>
        </>
      )}

      <RoundedButton
        style={styles.signInOtpButton}
        className="mt-2 bg-transparent"
        onPress={() => handleSwitchLoginType('Password')}>
        <CustomText className="text-base text-white font-isidoraSemiBold">
          {languages.sign_in_by_password_button}
        </CustomText>
      </RoundedButton>
    </View>
  );
};

export default SignInByOTP;

const styles = StyleSheet.create({
  signInOtpButton: {
    backgroundColor: 'transparent',
  },
  button: {
    width: '50%',
    backgroundColor: '#222B45',
  },
  input: {
    height: 36,
  },
});
