import {zodResolver} from '@hookform/resolvers/zod';
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {ImageBackground, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AuthBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import SafeAreaScrollView from '../../../components/SafeAreaScrollView';
import {createForgotPasswordSchema} from '../../../validation';
import NewPassword from './NewPassword';
import UserNameField from './UserNameField';

type ForgotPasswordParam = {
  email: string;
};

const ForgotPassword = () => {
  const {languages} = useLanguageStore();
  const [didSendCode, setDidSendCode] = useState(false);

  const forgotPasswordSchema = createForgotPasswordSchema(languages);

  const {handleSubmit, control, getValues, formState} =
    useForm<ForgotPasswordParam>({
      resolver: zodResolver(forgotPasswordSchema),
      mode: 'onBlur',
      reValidateMode: 'onChange',
      shouldFocusError: true,
      defaultValues: {
        email: '',
      },
    });

  const handleSendCode = (haveSendCode: boolean) => {
    setDidSendCode(haveSendCode);
  };

  return (
    <LinearGradient
      colors={['#6583FF', '#3E64FF']}
      style={styles.linearGradient}>
      <ImageBackground source={AuthBackground as any} className="flex-1">
        <SafeAreaScrollView
          className="h-full"
          contentContainerStyle={styles.contentContainer}>
          {didSendCode ? (
            <NewPassword email={getValues('email')} />
          ) : (
            <UserNameField
              handleSendCode={handleSendCode}
              formProps={{
                handleSubmit,
                control,
                formState,
                getValues,
              }}
            />
          )}
        </SafeAreaScrollView>
      </ImageBackground>
    </LinearGradient>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  contentContainer: {flex: 1},
});
