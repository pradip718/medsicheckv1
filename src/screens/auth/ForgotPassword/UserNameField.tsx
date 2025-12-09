import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React from 'react';
import {
  Control,
  Controller,
  FormState,
  UseFormGetValues,
  UseFormHandleSubmit,
} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {errorToast, successToast} from '../../../../utils/toast';
import {forgotPassword} from '../../../api/auth';
import CustomTextInput from '../../../components/CustomTextInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';

type ForgotPasswordParam = {
  email: string;
};

type UserNameFieldProps = {
  handleSendCode: (didSendCode: boolean) => void;
  formProps: {
    handleSubmit: UseFormHandleSubmit<ForgotPasswordParam>;
    control: Control<ForgotPasswordParam>;
    formState: FormState<ForgotPasswordParam>;
    getValues: UseFormGetValues<ForgotPasswordParam>;
  };
};

const UserNameField = ({handleSendCode, formProps}: UserNameFieldProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {
    handleSubmit,
    control,
    formState: {errors, isDirty, isValid},
    getValues,
  } = formProps;

  const {mutateAsync: sendCodeForUsers, isPending: isSendingCode} = useMutation(
    {
      mutationFn: forgotPassword,
      onError: error => {
        if (error instanceof AxiosError) {
          return errorToast(
            error.response?.data?.error || languages?.generic_error_message,
          );
        }
        errorToast(error.message || languages?.generic_error_message);
      },
      onSuccess: () => {
        successToast(languages?.confirmation_code_sent_message);
        handleSendCode(true);
      },
    },
  );

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const onSendCode = async () => {
    const email = getValues('email');
    await sendCodeForUsers({username: email});
  };

  return (
    <View className="h-full flex-1 justify-center items-center px-8">
      <Controller
        control={control}
        render={({field: {onChange, value, onBlur}}) => (
          <CustomTextInput
            inputMode="email"
            placeholder={languages?.email}
            placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
            leftIconName="mail"
            value={value}
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
        name="email"
      />
      <RoundedButton
        resetStyle
        style={styles.resendCodeButton}
        onPress={handleSubmit(onSendCode)}
        disabled={!isDirty || !isValid || isSendingCode}
        loading={isSendingCode}>
        <CustomText className="text-lg text-white font-isidoraSemiBold">
          {languages?.send_code}
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

export default UserNameField;

const styles = StyleSheet.create({
  resendCodeButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 70,
    paddingVertical: 8,
  },
});
