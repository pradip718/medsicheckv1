import {Text, View} from 'moti';
import React from 'react';
import {SafeAreaView} from 'react-native';
import {FallbackComponentProps} from 'react-native-error-boundary';
import useLanguageStore from '../../store/languageStore';
import useSignout from '../hooks/useSignout';
import customColor from '../theme/customColor';
import Icon from './Icon';
import RoundedButton from './RoundedButton';
import CustomText from './Text';

export const ErrorFallback = ({resetError, error}: FallbackComponentProps) => {
  const {handleSignout} = useSignout();
  const {languages} = useLanguageStore();

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="h-full justify-center items-center space-y-4">
        <View
          from={{rotate: '0deg'}}
          animate={{rotate: '360deg'}}
          transition={
            {
              loop: true,
              duration: 1000,
              type: 'timing',
              repeatReverse: true,
            } as any
          }>
          <Icon name="setting" size={20} color={customColor.lightGrey} />
        </View>
        <View className="flex-row justify-center items-center space-x-1">
          <Text
            className="font-isidoraSemiBold text-lg text-black text-center max-w-[80%]"
            from={{scale: 0.9}}
            animate={{scale: 1}}
            transition={
              {
                duration: 1000,
                type: 'timing',
                loop: true,
              } as any
            }>
            {languages?.fallback_message}
          </Text>
        </View>
        <Text
          className="font-isidoraSemiBold text-lg text-black text-center max-w-[80%]"
          from={{scale: 0.9}}
          animate={{scale: 1}}
          transition={
            {
              duration: 1000,
              type: 'timing',
              loop: true,
            } as any
          }>
          {error?.message}
        </Text>
        <View className="flex-row space-x-4">
          <RoundedButton
            resetStyle
            className="bg-green-400 px-8 py-2"
            onPress={resetError}>
            <CustomText className="font-isidoraSemiBold">Retry</CustomText>
          </RoundedButton>
          <RoundedButton
            resetStyle
            className="px-4 py-2 bg-red-500"
            onPress={handleSignout}>
            <CustomText className="text-white font-isidoraMedium text-sm">
              {languages?.sign_out}
            </CustomText>
          </RoundedButton>
        </View>
      </View>
    </SafeAreaView>
  );
};
