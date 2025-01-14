import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {errorToast, successToast} from '../../../../utils/toast';
import {forgotPassword} from '../../../api/auth';
import CustomTextInput from '../../../components/CustomTextInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';

type UserNameFieldProps = {
  handleSendCode: (didSendCode: boolean) => void;
  onEmailChange: (email: string) => void;
  email: string;
};

const UserNameField = ({
  handleSendCode,
  email,
  onEmailChange,
}: UserNameFieldProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const {mutateAsync: sendCodeForUsers, isPending: isSendingCode} = useMutation(
    {
      mutationFn: async () => {
        const output = await forgotPassword({username: email});
        return output;
      },
      onError: error => {
        errorToast(error.message || languages?.generic_error_message);
      },
    },
  );

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const onSendCode = async () => {
    try {
      await sendCodeForUsers();
      successToast(languages?.confirmation_code_sent_message);
      handleSendCode(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        errorToast(error.message || languages?.generic_error_message);
      }
    }
  };

  return (
    <View className="h-full flex-1 justify-center items-center px-8">
      <CustomTextInput
        inputMode="email"
        placeholder={languages?.email}
        placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
        leftIconName="mail"
        value={email}
        autoCapitalize="none"
        onChangeText={onEmailChange}
        onBlur={() => {}}
      />
      <RoundedButton
        resetStyle
        style={styles.resendCodeButton}
        onPress={onSendCode}
        disabled={!email || isSendingCode}
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
