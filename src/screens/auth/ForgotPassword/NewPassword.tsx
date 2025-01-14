import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText} from '../../../../utils/methods';
import {errorToast, successToast} from '../../../../utils/toast';
import {postConfirmPassword} from '../../../api/auth';
import CustomTextInput from '../../../components/CustomTextInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

type NewPasswordProps = {
  email: string;
};

type ForgetPasswordParams = {
  password: string;
  confirmPassword: string;
};

const NewPassword = ({email}: NewPasswordProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const [code, setCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const {
    mutateAsync: resetPassword,
    isPending: isResettingPassword,
    isError: isErrorResettingPassword,
  } = useMutation({
    mutationFn: async ({confirmPassword}: {confirmPassword: string}) => {
      const encryptedConfirmPassword = await encryptText(confirmPassword);
      return await postConfirmPassword({
        username: email,
        otp_value: code,
        password: encryptedConfirmPassword,
      });
    },
    onError: error => {
      if (error instanceof AxiosError) {
        errorToast(
          error?.response?.data?.error || languages?.generic_error_message,
        );
      }
      errorToast(languages?.generic_error_message);
    },
  });

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const validatePasswordAndCode = ({
    password,
    confirmPassword,
  }: ForgetPasswordParams): boolean => {
    if (password !== confirmPassword) {
      errorToast(languages?.password_does_not_match_error_message);
      return false;
    }
    if (code.length !== 6) {
      errorToast(languages?.code_length_not_matched);
      return false;
    }
    return true;
  };

  const changePassword = async ({
    confirmPassword,
    password,
  }: ForgetPasswordParams) => {
    const isValid = validatePasswordAndCode({password, confirmPassword});
    if (!isValid) {
      return;
    }
    await resetPassword({confirmPassword});
    if (isErrorResettingPassword) {
      errorToast(languages?.reset_password_error);
    } else {
      successToast(languages?.password_change_success);
      navigateToLogin();
    }
  };

  const {
    handleSubmit,
    control,
    formState: {errors, isDirty, isValid},
  } = useForm<ForgetPasswordParams>({
    mode: 'onBlur',
  });

  return (
    <View className="h-full flex-1 justify-center items-center px-8">
      <CustomTextInput
        inputMode="number"
        placeholder={languages?.code}
        placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
        value={code}
        autoCapitalize="none"
        onChangeText={(codeTxt: string) => {
          setCode(codeTxt);
        }}
        onBlur={() => {}}
      />
      <Controller
        control={control}
        render={({field: {onChange, value, onBlur}}) => (
          <>
            <TextInput
              label={
                <CustomText
                  style={styles.inputLabel}
                  className="text-base font-isidoraSemiBold">
                  {languages?.new_password_txt}
                </CustomText>
              }
              value={value}
              className="bg-transparent mt-4 w-full"
              textColor="white"
              activeUnderlineColor="rgba(255, 255, 255, 0.45)"
              secureTextEntry={!showPassword}
              // right={<Icon name="person" size={20} color={customColor.black} />}
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
        rules={{
          required: languages?.password_is_required,
          pattern: {
            value:
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            message:
              languages?.password_requirements_message_with_length_and_requirements,
          },
        }}
      />

      <Controller
        control={control}
        render={({field: {onChange, value, onBlur}}) => (
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
              className="bg-transparent mt-4 w-full"
              textColor="white"
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
            <CustomText className="text-base font-isidoraMedium text-red-500">
              {errors?.confirmPassword?.message}
            </CustomText>
          </>
        )}
        name="confirmPassword"
        rules={{
          required: languages?.confirm_password_is_required,
          pattern: {
            value:
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            message:
              languages?.password_requirements_message_with_length_and_requirements,
          },
        }}
      />

      <RoundedButton
        resetStyle
        style={styles.resendCodeButton}
        onPress={handleSubmit(changePassword)}
        disabled={isResettingPassword || !isDirty || !isValid || !code}
        loading={isResettingPassword}>
        <CustomText className="text-lg text-white font-isidoraSemiBold">
          {languages?.submit}
        </CustomText>
      </RoundedButton>
      <CustomText className="text-base font-isidoraMedium text-black mt-10">
        {languages?.back_to}{' '}
        <CustomText
          className="font-isidoraSemiBold text-white underline"
          onPress={navigateToLogin}>
          {languages?.login}
        </CustomText>
      </CustomText>
    </View>
  );
};

export default NewPassword;

const styles = StyleSheet.create({
  resendCodeButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 70,
    paddingVertical: 8,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
});
