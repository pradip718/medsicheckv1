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
import useLanguageStore from '../../../../store/languageStore';
import {
  LoginOTPResponse,
  LoginSuccessResponse,
} from '../../../../types/api_response';
import {isValidPhoneNumber} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {sendLoginOTP, verifyLoginOTP} from '../../../api/auth';
import AnimatedWrapper from '../../../components/AnimatedWrapper';
import CustomTextInput from '../../../components/CustomTextInput';
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
  const [didSendOTP, setDidSendOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [otpSigninType, setOTPSigninType] = useState<OTPSigninType>('Email');
  const [sendOTPResponse, setSendOTPResponse] =
    useState<LoginOTPResponse | null>(null);

  const {
    control,
    formState: {errors},
    getValues,
  } = formProps;

  const watchedEmail = useWatch({name: 'email', control});
  const watchedPhoneNumber = useWatch({name: 'formattedPhonenumber', control});

  const {mutateAsync: verifyLoginOTPMutation, isPending: isValidatingOTP} =
    useMutation({
      mutationKey: ['verify-login-otp'],
      mutationFn: verifyLoginOTP,
      onSuccess: async res => {
        if ('session' in res) {
          setSendOTPResponse(prevResponse => ({
            otp_sent: prevResponse?.otp_sent ?? false,
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

  const {mutateAsync: sendLoginOTPMutation, isPending: isSendingLoginOTP} =
    useMutation({
      mutationKey: ['send-login-otp'],
      mutationFn: sendLoginOTP,
      onSuccess: res => {
        if (res?.error) {
          return errorToast(res?.error);
        }
        setDidSendOTP(true);
        setSendOTPResponse(res);
      },
      onError: err => {
        if (err instanceof AxiosError) {
          return errorToast(err?.response?.data?.error);
        }
      },
    });

  const handleSendOTP = async () => {
    const email = getValues('email');
    const phoneNumber = getValues('formattedPhonenumber');
    const username = otpSigninType === 'Phone' ? phoneNumber : email;
    await sendLoginOTPMutation({
      username: username ?? '',
    });
  };

  const handleVerifyLoginOTP = async () => {
    if (!otp) {
      return errorToast(languages?.generic_error_message);
    }
    await verifyLoginOTPMutation({
      otp_value: otp,
      session: sendOTPResponse?.session ?? '',
      username: sendOTPResponse?.user_name ?? '',
    });
  };

  return (
    <View className="mt-4 mx-6">
      <RadioButton.Group
        onValueChange={(newValue: string) => {
          if (newValue === 'Email' || newValue === 'Phone') {
            setOTPSigninType(newValue);
            setDidSendOTP(false);
            setOTP('');
          }
        }}
        value={otpSigninType}>
        <View className="flex-row mt-8  flex-wrap mediumPhone:flex-nowrap mediumPhone:space-x-4 w-full">
          <View className="flex-row items-center">
            <RadioButton.Android
              value="Email"
              color="white"
              underlayColor="white"
              uncheckedColor="white"
            />
            <CustomText className="text-base font-isidoraMedium text-white">
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
            <CustomText className="text-base font-isidoraMedium text-white">
              {languages?.phone_number}
            </CustomText>
          </View>
        </View>
      </RadioButton.Group>

      {otpSigninType === 'Email' && (
        <View className="mt-6 flex-row items-center space-x-4">
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
              }}>
              <CustomText className="text-white underline text-base font-isidoraSemiBold">
                {languages?.edit}
              </CustomText>
            </Pressable>
          )}
        </View>
      )}

      {otpSigninType === 'Phone' && (
        <View className="mt-6 flex-row items-center space-x-4">
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
                  <CustomText className="text-base font-isidoraMedium text-red-500">
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
              }}>
              <CustomText className="text-white underline text-base font-isidoraSemiBold">
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
            editable={!isValidatingOTP}
            autoCapitalize="none"
            onChangeText={setOTP}
            editing={!isValidatingOTP}
          />
          <View className="flex-row items-center justify-end my-4">
            <Timer onResendPress={handleSendOTP} />
          </View>
          <RoundedButton
            style={styles.button}
            className="mt-10"
            loading={isValidatingOTP}
            disabled={isValidatingOTP || otp.length !== 6}
            onPress={handleVerifyLoginOTP}>
            <CustomText className="text-base text-white font-isidoraSemiBold">
              {languages.validate_otp_button}
            </CustomText>
          </RoundedButton>
        </AnimatedWrapper>
      ) : (
        <RoundedButton
          style={styles.button}
          className="mt-10"
          loading={isSendingLoginOTP}
          disabled={
            isSendingLoginOTP ||
            (otpSigninType === 'Email' && !watchedEmail) ||
            (otpSigninType === 'Email' && !!errors?.email) ||
            (otpSigninType === 'Phone' && !watchedPhoneNumber) ||
            (otpSigninType === 'Phone' && !!errors?.formattedPhonenumber)
          }
          onPress={handleSendOTP}>
          <CustomText className="text-base text-white font-isidoraSemiBold">
            {languages.get_otp_button}
          </CustomText>
        </RoundedButton>
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
