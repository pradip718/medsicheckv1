import {AnimatePresence, Image, MotiView, View} from 'moti';
import React, {useEffect, useState} from 'react';
import {BackHandler, ImageSourcePropType, SafeAreaView} from 'react-native';
import {InternetConnected, InternetDisconnected} from '../../assets';
import useLanguageStore from '../../store/languageStore';
import {isAndroid} from '../../utils';
import Pressable from '../components/Pressable';
import CustomText from '../components/Text';

const OfflineScreen = () => {
  const {languages} = useLanguageStore();
  const [showConnectedImage, setShowConnectedImage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowConnectedImage(state => !state);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const exitApp = () => {
    BackHandler.exitApp();
  };
  return (
    <View className="h-full">
      <SafeAreaView className="h-full">
        <View className="flex-1 justify-center items-center">
          <AnimatePresence exitBeforeEnter>
            {showConnectedImage && (
              <MotiView
                from={{
                  opacity: 0.5,
                  scale: 0.9,
                }}
                exit={{
                  opacity: 0.5,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{type: 'timing', duration: 500} as any}
                key="network-connected-image">
                <Image
                  source={InternetConnected as ImageSourcePropType}
                  className="h-[194px] w-[250px]"
                />
              </MotiView>
            )}
            {!showConnectedImage && (
              <MotiView
                from={{
                  opacity: 0.5,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0.5,
                  scale: 0.9,
                }}
                transition={{type: 'timing', duration: 500} as any}
                key="network-disconnected-image">
                <Image
                  source={InternetDisconnected as ImageSourcePropType}
                  className="h-[194px] w-[250px]"
                />
              </MotiView>
            )}
          </AnimatePresence>

          <CustomText className="font-isidoraSemiBold text-lg mt-8">
            {languages?.no_internet_message}
          </CustomText>
          <CustomText className="text-base mt-6">
            {languages?.no_internet_description}
          </CustomText>
          <CustomText className="text-base mt-4">
            {languages?.no_internet_instruction}
          </CustomText>

          {isAndroid && (
            <Pressable
              className="px-8 py-2 rounded-lg bg-green-600 mt-10"
              onPress={exitApp}>
              <CustomText className="text-white text-base">
                {languages?.exit_button_label}
              </CustomText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OfflineScreen;
