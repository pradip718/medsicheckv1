import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {AxiosError} from 'axios';
import React, {useState} from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {CodeField, Cursor} from 'react-native-confirmation-code-field';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {login, resendEmailConfirmation, verifyEmail} from '../../../api/auth';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import useOTPTimer from '../../../hooks/useOTPTimer';
import Header from './Header';

const CELL_COUNT = 6;

type OTPRouteProp = RouteProp<MainStackParamList, 'OTP'>;

interface OTPProps {
  route: OTPRouteProp;
}

const OTP = ({route}: OTPProps) => {
  const {username, password} = route.params;
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOTP] = useState<string>();

  const {minutes, seconds, resetTimer} = useOTPTimer();

  const handleLogin = async () => {
    try {
      const encryptedPassword = await encryptText(password);
      await login({username, password: encryptedPassword});
    } catch (error: any) {
      errorToast(error?.message);
      navigation.navigate('Login');
    }
  };

  const verifyOTPAndSignIn = async () => {
    if (!otp) {
      return;
    }
    await verifyEmail({
      username,
      otp_value: otp,
    });
    await handleLogin();
  };

  const handleOTPSubmit = async () => {
    try {
      setIsLoading(true);
      await verifyOTPAndSignIn();
      navigation.navigate('TermsAndConditions');
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        errorToast(error?.response?.data?.error);
      }
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    resetTimer();
    await resendEmailConfirmation({username});
  };

  const renderCodeInput = () => {
    return (
      <CodeField
        // ref={ref}
        value={otp}
        onChangeText={setOTP}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.25)', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.cellContainer}>
            <CustomText
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              className=" font-isidoraMedium"
              // onLayout={getCellOnLayoutHandler(index)}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </CustomText>
          </LinearGradient>
        )}
      />
    );
  };
  return (
    <ImageBackground
      source={AuthBackground as any}
      style={styles.container}
      className="flex-1">
      <SafeAreaView>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.contentContainer}
          className="pt-4">
          <Header />
          <View className="flex-1 items-center">
            <View className="mt-20">
              <CustomText className="text-center text-white text-base font-isidoraRegular">
                {languages?.enter_otp_msg}
              </CustomText>
            </View>
            <View className="mt-20">{renderCodeInput()}</View>

            <RoundedButton
              style={styles.verifyButton}
              onPress={handleOTPSubmit}
              loading={isLoading}
              disabled={isLoading || otp?.length !== 6}>
              <CustomText className=" font-isidoraSemiBold text-base text-white">
                {languages?.verify_button_text}
              </CustomText>
            </RoundedButton>

            <View className="flex-row items-center justify-center mt-10">
              {minutes === 0 && seconds === 0 ? (
                <TouchableOpacity onPress={handleResendOTP} className="ml-2">
                  <CustomText className=" text-base font-isidoraMedium text-white underline">
                    {languages?.resend}
                  </CustomText>
                </TouchableOpacity>
              ) : (
                <CustomText className="text-sm font-isidoraMedium text-white">
                  {languages?.resend_otp_text} {minutes}:{seconds}
                </CustomText>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default OTP;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    paddingBottom: 40,
  },
  verifyButton: {
    width: '50%',
    backgroundColor: '#222B45',
    marginTop: 140,
  },
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cellContainer: {
    width: 44,
    height: 60,
    lineHeight: 38,
    paddingTop: 10,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  cell: {
    width: 44,
    height: 40,
    lineHeight: 38,
    fontSize: 32,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
});
