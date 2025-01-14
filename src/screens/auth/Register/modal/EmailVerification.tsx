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
import {ResendEmailConfirmationPayload} from '../../../../../types/api_payload';
import {errorToast} from '../../../../../utils/toast';
import {resendEmailConfirmation, verifyEmail} from '../../../../api/auth';
import BasicContainer from '../../../../components/BasicContainer';
import EtchedGlass from '../../../../components/EtchedGlass';
import Pressable from '../../../../components/Pressable';
import RoundedButton from '../../../../components/RoundedButton';
import CustomText from '../../../../components/Text';
import Timer from '../Timer';

const CELL_COUNT = 6;

interface EmailVerificationProps {
  updatedEmail: string;
  email: string;
  updateCurrentEmail: (email: string) => void;
  closeVerficationModal: (focus?: boolean) => void;
  handleEmailVerified: (verify: boolean) => void;
}

const modifyEmailPayload = (
  updatedEmail: string,
  email: string,
): ResendEmailConfirmationPayload => {
  if (updatedEmail === email) {
    return {
      username: email,
    };
  } else {
    return {
      username: email,
      updated_value: updatedEmail,
      update_flag: true,
    };
  }
};

const EmailVerificationModal = ({
  email,
  updatedEmail,
  updateCurrentEmail,
  closeVerficationModal,
  handleEmailVerified,
}: EmailVerificationProps) => {
  const {languages} = useLanguageStore();
  const [otp, setOTP] = useState('');

  const ref = useBlurOnFulfill({value: otp, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOTP,
  });

  const {mutateAsync: resendEmailConfirmationMutation} = useMutation({
    mutationKey: ['resend-email-otp'],
    mutationFn: resendEmailConfirmation,
    onError: err => {
      if (err instanceof AxiosError) {
        errorToast(err?.response?.data?.error);
        closeVerficationModal();
      }
    },
    onSuccess: () => {
      updateCurrentEmail(updatedEmail ?? email);
    },
  });

  const {mutateAsync: verifyEmailMutation, isPending: isVerifyingEmail} =
    useMutation({
      mutationKey: ['verify-email-otp'],
      mutationFn: verifyEmail,
      onError: err => {
        if (err instanceof AxiosError) {
          errorToast(err?.response?.data?.error);
        }
      },
      onSuccess: () => {
        handleEmailVerified(true);
        closeVerficationModal();
      },
    });

  useEffect(() => {
    resendEmailConfirmationMutation(modifyEmailPayload(updatedEmail, email));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResendOTP = async () => {
    await resendEmailConfirmationMutation(
      modifyEmailPayload(updatedEmail, email),
    );
  };

  const handleVerifyOTP = async () => {
    await verifyEmailMutation({
      username: updatedEmail ?? email,
      otp_value: otp,
    });
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
            className="w-[30] h-[60] mediumPhone:w-[40]"
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
          {languages?.email_verification}
        </CustomText>
        <View className="mt-6">
          <CustomText className="text-center text-base">
            {languages?.email_verification_description}
          </CustomText>
          <View className="flex-row items-center justify-center space-x-2">
            <CustomText className="text-base">
              {updatedEmail ?? email ?? ''}
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
              loading={isVerifyingEmail}
              disabled={isVerifyingEmail}>
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

export default EmailVerificationModal;

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
