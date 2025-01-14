import React from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useSignout from '../../hooks/useSignout';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';

type ErrorMessageProps = {
  errorMessage?: string;
};

const ErrorMessage = ({errorMessage}: ErrorMessageProps) => {
  const {handleSignout, isLoading} = useSignout();

  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="flex-1 justify-center">
        <CustomText className="text-red-400 font-isidoraSemiBold text-base text-center">
          Failed to Load Content, Please try after sometime
        </CustomText>
        <CustomText className="text-red-400 font-isidoraSemiBold text-base text-center">
          {errorMessage}
        </CustomText>

        <View className="justify-center px-4 my-4">
          <RoundedButton
            className=""
            onPress={handleSignout}
            loading={isLoading}
            disabled={isLoading}>
            <CustomText className="text-base text-white font-isidoraSemiBold text-center">
              Sign Out
            </CustomText>
          </RoundedButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ErrorMessage;
