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
    <View style={styles.container}>
      <View style={styles.formContent}>
        <Controller
          control={control}
          render={({field: {onChange, value, onBlur}}) => (
            <CustomTextInput
              style={styles.input}
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
          style={styles.sendCodeButton}
          onPress={handleSubmit(onSendCode)}
          disabled={!isDirty || !isValid || isSendingCode}
          loading={isSendingCode}>
          <CustomText className="text-lg text-white font-isidoraSemiBold">
            {languages?.send_code}
          </CustomText>
        </RoundedButton>
      </View>
      <View style={styles.footer}>
        <CustomText style={styles.footerText}>
          {languages?.back_to}{' '}
          <CustomText style={styles.footerLink} onPress={navigateToLogin}>
            {languages?.login}
          </CustomText>
        </CustomText>
      </View>
    </View>
  );
};

export default UserNameField;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  formContent: {
    paddingHorizontal: 24,
  },
  input: {
    height: 36,
  },
  sendCodeButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 28,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'IsidoraSans-Regular',
  },
  footerLink: {
    color: 'rgba(255,255,255,1)',
    fontFamily: 'IsidoraSans-SemiBold',
    textDecorationLine: 'underline',
  },
});
