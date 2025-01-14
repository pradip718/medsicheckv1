import {useMutation} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import Pressable from '../../../components/Pressable';
import CustomText from '../../../components/Text';
import useOTPTimer from '../../../hooks/useOTPTimer';

type TimerProps = {
  onResendPress: () => Promise<void>;
  resendTextClassName?: string;
};

const Timer = ({onResendPress, resendTextClassName}: TimerProps) => {
  const {languages} = useLanguageStore();
  const {minutes, seconds, resetTimer} = useOTPTimer();

  const {mutateAsync: handleResendPress} = useMutation({
    mutationKey: ['resend-otp'],
    onMutate: resetTimer,
    mutationFn: onResendPress,
  });

  return (
    <View className="flex-row items-center justify-center">
      {minutes === 0 && seconds === 0 ? (
        <Pressable onPress={handleResendPress} className="ml-2">
          <CustomText
            className={twMerge(
              'text-base font-isidoraMedium text-white underline',
              resendTextClassName,
            )}>
            {languages?.resend}
          </CustomText>
        </Pressable>
      ) : (
        <CustomText
          className={twMerge(
            'text-sm font-isidoraMedium text-white',
            resendTextClassName,
          )}>
          {languages?.resend_otp_text} {minutes}:{seconds}
        </CustomText>
      )}
    </View>
  );
};

export default Timer;
