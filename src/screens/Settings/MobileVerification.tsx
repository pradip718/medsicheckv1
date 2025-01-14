import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {SafeAreaView} from 'moti';
import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {CodeField, Cursor} from 'react-native-confirmation-code-field';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {errorToast} from '../../../utils/toast';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import {GET_USER_PREFERENCES} from '../../constants/hooks';
import {
  useGetUserPreference,
  usePostUserPreference,
  useSendWhatsappOTP,
  useValidateWhatsappOTP,
} from '../../hooks/api/settings';
import useOTPTimer from '../../hooks/useOTPTimer';
import customColor from '../../theme/customColor';

const CELL_COUNT = 6;

const MobileVerification = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {languages} = useLanguageStore();
  const [otp, setOTP] = useState<string>();

  const {minutes, seconds, resetTimer} = useOTPTimer();

  const {data: userPreference} = useGetUserPreference({staleTime: Infinity});
  const {mutateAsync: syncUserPreference} = usePostUserPreference({
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: [GET_USER_PREFERENCES]});
      navigation?.goBack();
    },
    onError: async error => {
      errorToast(error?.message);
    },
  });
  const {mutateAsync: sendWhatsAppOTP} = useSendWhatsappOTP();
  const {mutateAsync: validateOTP, isPending: isValidating} =
    useValidateWhatsappOTP({
      onSuccess: async () => {
        await syncUserPreference({
          email_flag: userPreference?.email_flag || false,
          push_flag: userPreference?.push_flag || false,
          preference_id: userPreference?.preference_id,
          whatsapp_flag: true,
        });
      },
      onError: (error: any) => {
        if (error?.response?.data?.error === 'Invalid OTP') {
          errorToast(languages?.invalid_otp);
        }
      },
    });

  const handleOTPSubmit = async () => {
    if (!otp) {
      return;
    }
    await validateOTP({otp_value: otp});
  };

  const handleResendOTP = async () => {
    resetTimer();
    await sendWhatsAppOTP();
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
            colors={['rgba(255, 255, 255, 0.25)', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.cellContainer}
            className="border border-slate-400">
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
    <View className="bg-white h-full">
      <SafeAreaView>
        <View className="p-4">
          <Navbar />
        </View>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.contentContainer}
          className="pt-4">
          <View className="flex-1 items-center">
            <View className="mt-20">
              <CustomText className="text-center text-black text-xl font-isidoraSemiBold pb-2">
                {languages?.mobile_verification_message_title}
              </CustomText>
              <CustomText className="text-center text-black text-base font-isidoraRegular">
                {languages?.mobile_verification_otp_content}
              </CustomText>
            </View>
            <View className="mt-20">{renderCodeInput()}</View>

            <RoundedButton
              style={styles.verifyButton}
              onPress={handleOTPSubmit}
              loading={isValidating}
              disabled={isValidating || otp?.length !== 6}>
              <CustomText className=" font-isidoraSemiBold text-base text-white">
                {languages?.verify_button_text}
              </CustomText>
            </RoundedButton>

            <View className="flex-row items-center justify-center mt-10">
              {minutes === 0 && seconds === 0 ? (
                <TouchableOpacity onPress={handleResendOTP} className="ml-2">
                  <CustomText className=" text-base font-isidoraMedium text-ultramarineBlue underline">
                    {languages?.resend}
                  </CustomText>
                </TouchableOpacity>
              ) : (
                <CustomText className="text-sm font-isidoraMedium">
                  {languages?.resend_otp_text} {minutes}:{seconds}
                </CustomText>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default MobileVerification;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    paddingBottom: 40,
  },
  verifyButton: {
    width: '50%',
    backgroundColor: customColor.ultramarineBlue,
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
    // backgroundColor: '#FFF',
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
