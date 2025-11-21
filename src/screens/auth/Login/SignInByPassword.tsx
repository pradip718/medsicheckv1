import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Control,
  Controller,
  FormState,
  UseFormHandleSubmit,
} from 'react-hook-form';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import useAppStore from '../../../../store/appStore';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {isAndroid} from '../../../../utils';
import CustomTextInput from '../../../components/CustomTextInput';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {color, units} from '../../../theme';
import {LoginParam, LoginType} from './type';

type SignInByPasswordProps = {
  handlePasswordLogin: (params: LoginParam) => void;
  handleSwitchLoginType: (type: LoginType) => void;
  isUserLoggingIn: boolean;
  showAlternativeLoginButton?: boolean;
  formProps: {
    handleSubmit: UseFormHandleSubmit<LoginParam>;
    control: Control<LoginParam>;
    formState: FormState<LoginParam>;
  };
};

const SignInByPassword = ({
  handleSwitchLoginType,
  handlePasswordLogin,
  isUserLoggingIn,
  showAlternativeLoginButton = true,
  formProps,
}: SignInByPasswordProps) => {
  const {
    handleSubmit,
    control,
    formState: {errors, isDirty, isValid},
  } = formProps;
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {stayLoggedIn, setStayLoggedIn} = useAppStore();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (!stayLoggedIn) {
      setStayLoggedIn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <>
      <View className="mt-4 mx-6">
        <Controller
          control={control}
          render={({field: {onChange, value, onBlur}}) => (
            <CustomTextInput
              style={styles.input}
              inputMode="email"
              placeholder={languages?.username}
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
          rules={{
            required: languages?.email_empty,
            pattern: {
              value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
              message: languages?.email_validation_error_msg,
            },
          }}
        />

        <Controller
          control={control}
          render={({field: {onChange, value, onBlur}}) => (
            <CustomTextInput
              placeholder={languages?.password}
              placeholderTextColor={'rgba(255, 255, 255, 0.5)'}
              leftIconName="lock"
              secureTextEntry={!isPasswordVisible}
              rightIconName={isPasswordVisible ? 'eye-off' : 'eye'}
              onRightIconPress={() => setIsPasswordVisible(state => !state)}
              style={[styles.input, {marginTop: 20}]}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
          name="password"
          rules={{required: languages?.password_empty}}
        />

        <View className="flex-row justify-between items-center mt-5 space-x-4">
          <View className="w-[40%] self-end flex-row items-center">
            <CheckBox
              boxType="square"
              lineWidth={4}
              onValueChange={() => setStayLoggedIn(!stayLoggedIn)}
              value={stayLoggedIn}
              style={styles.checkBox}
              tintColors={{true: 'white', false: 'white'}}
              tintColor="white"
              onCheckColor="black"
              onFillColor="white"
            />
            <CustomText className="font-isidoraMedium text-sm text-white flex-wrap">
              {languages?.stay_logged_in}
            </CustomText>
          </View>
          <TouchableOpacity
            className="w-[50%] items-end"
            onPress={navigateToForgotPassword}>
            <CustomText className="text-sm text-white font-isidoraMedium">
              {languages?.forgot_password}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <RoundedButton
        style={styles.signInButton}
        onPress={handleSubmit(handlePasswordLogin)}
        loading={isUserLoggingIn}
        disabled={isUserLoggingIn || !isDirty || !isValid}>
        <CustomText className="text-base text-white font-isidoraSemiBold">
          {languages.login}
        </CustomText>
      </RoundedButton>
      {showAlternativeLoginButton && (
        <RoundedButton
          style={styles.signInOtpButton}
          className="mt-2 bg-transparent"
          onPress={() => handleSwitchLoginType('OTP')}>
          <CustomText className="text-base text-white font-isidoraSemiBold">
            {languages.sign_in_by_otp_button}
          </CustomText>
        </RoundedButton>
      )}
    </>
  );
};

export default SignInByPassword;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 28,
    paddingTop: 20,
    flex: 1,
    marginBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    // justifyContent: 'space-between',
  },
  medsiCheck: {
    marginRight: -18,
    marginBottom: -10,
    height: units.scale(120),
    width: units.scale(120),
  },
  loginImgPerson: {
    marginTop: 50,
    height: units.scale(200),
    width: units.scale(140),
    alignSelf: 'center',
  },
  signUpTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 40,
  },
  signInButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 28,
  },
  signInOtpButton: {
    backgroundColor: 'transparent',
  },
  footerText: {
    textAlign: 'left',
  },
  signUpText: {
    color: color.white,
  },
  phoneWrapper: {
    height: 60,
    width: '100%',
    paddingHorizontal: 30,
    borderRadius: 18,
    backgroundColor: color.pearl,
    flexDirection: 'row',
  },
  phoneInput: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  checkBox: {
    transform: isAndroid
      ? [{scaleX: 1}, {scaleY: 1}]
      : [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  input: {
    height: 36,
  },
});
