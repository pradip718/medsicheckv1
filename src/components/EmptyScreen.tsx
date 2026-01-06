import {Text, View} from 'moti';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import useLanguageStore from '../../store/languageStore';
import Navbar from './Navbar';

const EmptyScreen = ({
  hideNavbar = false,
  message,
}: {
  hideNavbar?: boolean;
  message?: string;
}) => {
  const {languages} = useLanguageStore();
  let emptyMsg;
  if (message) {
    emptyMsg = message;
  } else {
    emptyMsg = languages?.information_empty;
  }
  return (
    <SafeAreaView className="h-full bg-white">
      {!hideNavbar && (
        <View className="p-4">
          <Navbar />
        </View>
      )}
      <View className="h-full justify-center items-center space-y-4">
        <Text
          className="font-isidoraSemiBold text-lg text-black text-center"
          from={{scale: 0.9}}
          animate={{scale: 1}}
          transition={
            {
              duration: 900,
              type: 'timing',
              loop: true,
            } as any
          }>
          {emptyMsg}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default EmptyScreen;
