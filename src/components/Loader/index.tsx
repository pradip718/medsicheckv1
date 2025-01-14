import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import customColor from '../../theme/customColor';
import Navbar from '../Navbar';
import CustomText from '../Text';

const Loader = ({
  message,
  hasNavbar,
}: {
  message?: string;
  hasNavbar?: boolean;
}) => {
  const {languages} = useLanguageStore();
  let msg;
  if (message) {
    msg = message;
  } else {
    msg = languages.loading;
  }
  return (
    <SafeAreaView className="h-full">
      {hasNavbar && (
        <View className="p-4">
          <Navbar />
        </View>
      )}
      <View className="items-center justify-center flex-row space-x-4 flex-1">
        <ActivityIndicator animating={true} color={customColor.blueBerry} />
        <CustomText className="font-isidoraSemiBold text-base text-[#222B45] text-center">
          {msg}
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

export default Loader;
