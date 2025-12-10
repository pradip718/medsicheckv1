import {zodResolver} from '@hookform/resolvers/zod';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
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
import {createOTPLoginSchema} from '../../../validation';
import Timer from '../Register/Timer';
import {LoginParam, LoginType} from './type';

type SignInByOTPProps = {
  handleSwitchLoginType: (type: LoginType) => void;
  proceedLoginStep: (res: LoginSuccessResponse) => Promise<void>;
};

type OTPSigninType = 'Email' | 'Phone';

const SignInByOTP = ({
  handleSwitchLoginType,
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

  const otpLoginSchema = createOTPLoginSchema(languages);

  const {
    control,
    formState: {errors, isValid},
    getValues,
  } = useForm<LoginParam>({
    resolver: zodResolver(otpLoginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      formattedPhonenumber: '',
    },
  });

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

    if (otpSigninType === 'Phone' && !phoneNumber) {
      return errorToast(languages?.required_phone_number);
    } else if (otpSigninType === 'Email' && !email) {
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
    (otpSigninType === 'Email' && !isValid) ||
    (otpSigninType === 'Phone' && !watchedPhoneNumber) ||
    (otpSigninType === 'Phone' && !!errors?.formattedPhonenumber);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(['Email', 'Phone'] as OTPSigninType[]).map(option => {
          const isActive = otpSigninType === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                if (otpSigninType !== option) {
                  setOTPSigninType(option);
                  setDidSendOTP(false);
                  setOTP('');
                  if (option === 'Email' && otpChannel !== 'sms') {
                    setOTPChannel('whatsapp');
                  }
                }
              }}>
              <CustomText
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {option === 'Email'
                  ? languages?.email
                  : languages?.phone_number}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>

      {otpSigninType === 'Email' && (
        <View style={styles.fieldRow}>
          <View style={styles.fieldGrow}>
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
            />
          </View>
          {didSendOTP && (
            <Pressable
              style={styles.editButton}
              onPress={() => {
                setOTP('');
                setDidSendOTP(false);
                setIsNewUser(false);
              }}>
              <CustomText style={styles.editButtonText}>
                {languages?.edit}
              </CustomText>
            </Pressable>
          )}
        </View>
      )}

      {otpSigninType === 'Phone' && (
        <View style={styles.fieldRow}>
          <View style={styles.fieldGrow}>
            <Controller
              name="formattedPhonenumber"
              control={control}
              render={({field: {onChange, value, onBlur}}) => (
                <>
                  <CustomPhoneInput<LoginParam>
                    disabled={didSendOTP}
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    key={`${didSendOTP}`}
                  />
                  <CustomText style={styles.phoneError}>
                    {errors?.formattedPhonenumber?.message}
                  </CustomText>
                </>
              )}
            />
          </View>
          {didSendOTP && (
            <Pressable
              style={styles.editButton}
              onPress={() => {
                setOTP('');
                setDidSendOTP(false);
                setIsNewUser(false);
              }}>
              <CustomText style={styles.editButtonText}>
                {languages?.edit}
              </CustomText>
            </Pressable>
          )}
        </View>
      )}

      {didSendOTP ? (
        <AnimatedWrapper style={styles.otpWrapper}>
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
          <View style={styles.timerRow}>
            <Timer onResendPress={() => handleSendOTP()} />
          </View>
          <View style={styles.sectionSpacing}>
            <RoundedButton
              style={styles.primaryButton}
              loading={isValidatingOTP || isValidatingSignUpOTP}
              disabled={
                isValidatingOTP || otp.length !== 6 || isValidatingSignUpOTP
              }
              onPress={handleVerifyLoginOTP}>
              <CustomText style={styles.primaryButtonText}>
                {languages.validate_otp_button}
              </CustomText>
            </RoundedButton>
          </View>
        </AnimatedWrapper>
      ) : (
        <View style={styles.sectionSpacing}>
          <RoundedButton
            style={styles.primaryButton}
            loading={isSendingLoginOTP || isSendingSignUpOTP}
            disabled={isDisabled}
            onPress={() => handleSendOTP(otpChannel)}>
            <CustomText style={styles.primaryButtonText}>
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
        </View>
      )}

      {otpSigninType === 'Phone' && !didSendOTP && (
        <>
          <Pressable
            style={styles.channelToggle}
            onPress={() =>
              setDeliveryChannel(otpChannel === 'whatsapp' ? 'sms' : 'whatsapp')
            }>
            {otpChannel === 'whatsapp' ? (
              <MaterialIcon name="sms" size={18} color="#FFFFFF" />
            ) : (
              <Icon name="whatsapp" size={18} color="#25D366" />
            )}
            <CustomText style={styles.channelToggleText}>
              {otpChannel === 'whatsapp'
                ? languages.get_otp_by_message_button
                : languages.get_otp_by_whatsapp_button}
            </CustomText>
          </Pressable>
        </>
      )}

      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <CustomText style={styles.orText}>OR</CustomText>
        <View style={styles.orLine} />
      </View>

      <RoundedButton
        style={styles.secondaryButton}
        onPress={() => handleSwitchLoginType('Password')}>
        <CustomText style={styles.secondaryButtonText}>
          {languages.sign_in_by_password_button}
        </CustomText>
      </RoundedButton>
    </View>
  );
};

export default SignInByOTP;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    padding: 4,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'white',
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 14,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#1B2653',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  fieldGrow: {
    flex: 1,
  },
  editButton: {
    marginLeft: 12,
  },
  editButtonText: {
    color: 'white',
    textDecorationLine: 'underline',
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 14,
  },
  phoneError: {
    color: '#F87171',
    fontFamily: 'IsidoraSans-Medium',
    fontSize: 13,
    marginTop: 6,
  },
  sectionSpacing: {
    marginTop: 28,
  },
  otpWrapper: {
    marginTop: 16,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#222B45',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 15,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  orText: {
    marginHorizontal: 10,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 12,
  },
  channelToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  channelToggleText: {
    color: 'white',
    fontFamily: 'IsidoraSans-Medium',
    fontSize: 13,
    marginLeft: 8,
  },
  secondaryButton: {
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: 'white',
    fontFamily: 'IsidoraSans-SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
  input: {
    height: 36,
  },
});
