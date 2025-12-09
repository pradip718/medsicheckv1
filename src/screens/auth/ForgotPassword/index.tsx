import {zodResolver} from '@hookform/resolvers/zod';
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {AuthBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';
import {units} from '../../../theme';
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

  const translations =
    (languages as unknown as Record<string, string | undefined>) ?? {};
  const heroSubtitleText = didSendCode
    ? translations?.enter_otp_msg
    : translations?.forgot_password;

  return (
    <LinearGradient
      colors={['#6583FF', '#3E64FF']}
      style={styles.linearGradient}>
      <ImageBackground source={AuthBackground as any} className="flex-1">
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.screenContent}>
            <View style={styles.contentWrapper}>
              <View style={styles.mainSection}>
                <View style={styles.hero}>
                  <View style={styles.heroImageRow}>
                    <View style={styles.medsiCheckWrapper}>
                      <Image
                        style={styles.medsiCheck}
                        source={require('../../../../assets/images/MedsiCheck.png')}
                        resizeMode="contain"
                      />
                    </View>
                    <Image
                      style={styles.loginImgPerson}
                      source={require('../../../../assets/images/LoginImgPerson.png')}
                      resizeMode="contain"
                    />
                  </View>
                  {heroSubtitleText ? (
                    <CustomText
                      style={styles.heroSubtitle}
                      className="font-isidoraSemiBold">
                      {heroSubtitleText}
                    </CustomText>
                  ) : null}
                </View>

                <View style={styles.formCard}>
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
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  screenContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainSection: {
    flexShrink: 0,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
  },
  heroImageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
  },
  medsiCheckWrapper: {
    justifyContent: 'flex-end',
    marginRight: -12,
  },
  medsiCheck: {
    width: units.scale(120),
    height: units.scale(120),
  },
  loginImgPerson: {
    width: units.scale(150),
    height: units.scale(200),
  },
  heroSubtitle: {
    marginTop: 24,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formCard: {
    marginTop: 16,
    marginHorizontal: 8,
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 16,
  },
});
