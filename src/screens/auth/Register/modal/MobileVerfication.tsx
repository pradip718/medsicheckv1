import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import useLanguageStore from '../../../../../store/languageStore';
import {sendPhoneOTPPayload} from '../../../../../types/api_payload';
import {errorToast} from '../../../../../utils/toast';
import {
  resendSignUpOTP,
  sendPhoneOTP,
  verifyPhone,
  verifySignUpOTP,
} from '../../../../api/auth';
import BasicContainer from '../../../../components/BasicContainer';
import EtchedGlass from '../../../../components/EtchedGlass';
import Pressable from '../../../../components/Pressable';
import RoundedButton from '../../../../components/RoundedButton';
import CustomText from '../../../../components/Text';
import Timer from '../Timer';

const CELL_COUNT = 6;

interface MobileVerificationProps {
  email: string;
  phoneNumber: string;
  updatedPhoneNumber: string;
  user_id: string;
  updateCurrentPhoneNumber: (phoneNumber: string) => void;
  closeVerficationModal: (focus?: boolean) => void;
  handlePhoneVerified: (verify: boolean) => void;
  isOTPSignup: boolean;
}

const modifyPhonePayload = (
  user_id: string,
  phoneNumber: string,
  updatedPhone: string,
  email: string,
): sendPhoneOTPPayload => {
  if (updatedPhone === phoneNumber) {
    return {
      user_id,
      username: email,
    };
  } else {
    return {
      user_id,
      username: email,
      updated_value: updatedPhone,
      update_flag: true,
    };
  }
};

const MobileVerificationModal = ({
  email,
  phoneNumber,
  user_id,
  updatedPhoneNumber,
  updateCurrentPhoneNumber,
  closeVerficationModal,
  handlePhoneVerified,
  isOTPSignup,
}: MobileVerificationProps) => {
  const {languages} = useLanguageStore();
  const [otp, setOTP] = useState('');

  const ref = useBlurOnFulfill({value: otp, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOTP,
  });

  const {mutateAsync: sendSignupOTPMutation} = useMutation({
    mutationKey: ['send-signup-otp'],
    mutationFn: resendSignUpOTP,
    onError: err => {
      if (err instanceof AxiosError) {
        errorToast(err?.response?.data?.error);
        closeVerficationModal();
      }
    },
    onSuccess: () => {
      updateCurrentPhoneNumber(updatedPhoneNumber ?? phoneNumber);
    },
  });

  const {mutateAsync: sendPhoneOTPMutation} = useMutation({
    mutationKey: ['send-phone-otp'],
    mutationFn: sendPhoneOTP,
    onError: err => {
      if (err instanceof AxiosError) {
        errorToast(err?.response?.data?.error);
        closeVerficationModal();
      }
    },
    onSuccess: () => {
      updateCurrentPhoneNumber(updatedPhoneNumber ?? phoneNumber);
    },
  });

  const {
    mutateAsync: verifySignUpOTPMutation,
    isPending: isValidatingSignUpOTP,
  } = useMutation({
    mutationKey: ['verify-signup-otp'],
    mutationFn: verifySignUpOTP,
    onError: err => {
      if (err instanceof AxiosError) {
        errorToast(err?.response?.data?.error);
      }
    },
    onSuccess: () => {
      handlePhoneVerified(true);
      closeVerficationModal();
    },
  });

  const {mutateAsync: verifyPhoneMutation, isPending: isVerifyingPhone} =
    useMutation({
      mutationKey: ['verify-phone-otp'],
      mutationFn: verifyPhone,
      onError: err => {
        if (err instanceof AxiosError) {
          errorToast(err?.response?.data?.error);
        }
      },
      onSuccess: () => {
        handlePhoneVerified(true);
        closeVerficationModal();
      },
    });

  useEffect(() => {
    isOTPSignup
      ? sendSignupOTPMutation(
          modifyPhonePayload(user_id, phoneNumber, updatedPhoneNumber, email),
        )
      : sendPhoneOTPMutation(
          modifyPhonePayload(user_id, phoneNumber, updatedPhoneNumber, email),
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResendOTP = async () => {
    if (isOTPSignup) {
      await sendSignupOTPMutation(
        modifyPhonePayload(user_id, phoneNumber, updatedPhoneNumber, email),
      );
    } else {
      await sendPhoneOTPMutation(
        modifyPhonePayload(user_id, phoneNumber, updatedPhoneNumber, email),
      );
    }
  };

  const handleVerifyOTP = async () => {
    if (isOTPSignup) {
      await verifySignUpOTPMutation({
        otp_value: otp,
        username: email,
        session: '',
      });
    } else {
      await verifyPhoneMutation({
        username: email,
        otp_value: otp,
        user_id,
      });
    }
  };

  const renderCodeInput = useCallback(() => {
    return (
      <CodeField
        ref={ref}
        {...props}
        value={otp}
        onChangeText={setOTP}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <View
            onLayout={getCellOnLayoutHandler(index)}
            key={index}
            className="h-[60] w-[30] mediumPhone:w-[40]"
            style={[
              styles.cellRoot,
              isFocused && styles.focusCell,
              {marginRight: index < CELL_COUNT - 1 ? 10 : 0},
            ]}>
            <CustomText
              style={styles.cellText}
              className="font-isidoraSemiBold">
              {symbol || (isFocused ? <Cursor /> : null)}
            </CustomText>
          </View>
        )}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  return (
    <BasicContainer style={styles.container} className="min-h-[300]">
      <EtchedGlass>
        <CustomText className="text-center mt-4 text-xl font-isidoraSemiBold">
          {languages?.mobile_verification}
        </CustomText>
        <View className="mt-6">
          <CustomText className="text-center text-base">
            {languages?.email_verification_description}
          </CustomText>
          <View className="flex-row items-center justify-center space-x-2">
            <CustomText className="text-base">
              {updatedPhoneNumber ?? phoneNumber ?? ''}
            </CustomText>
            <Pressable onPress={() => closeVerficationModal(true)}>
              <CustomText className="text-base font-isidoraBold text-ultramarineBlue">
                {languages?.change}
              </CustomText>
            </Pressable>
          </View>
          {renderCodeInput()}
          <View className="space-y-4 my-8 items-center">
            <RoundedButton
              onPress={handleVerifyOTP}
              resetStyle
              className="py-[8] px-[60] bg-midnightBlue"
              loading={isOTPSignup ? isValidatingSignUpOTP : isVerifyingPhone}
              disabled={isOTPSignup ? isValidatingSignUpOTP : isVerifyingPhone}>
              <CustomText className="text-base font-isidoraBold text-white text-center">
                {languages?.verify_button_text}
              </CustomText>
            </RoundedButton>

            <View className="my-4">
              <Timer
                onResendPress={handleResendOTP}
                resendTextClassName="font-isidoraBold text-ultramarineBlue text-center"
              />
            </View>
          </View>
        </View>
      </EtchedGlass>
    </BasicContainer>
  );
};

export default MobileVerificationModal;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  root: {padding: 20, minHeight: 300},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {
    marginTop: 20,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cellRoot: {
    // width: 50,
    // height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
  },
  cellText: {
    color: '#000',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
});
