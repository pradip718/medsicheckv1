import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {Text, View} from 'moti';
import React from 'react';
import {SafeAreaView} from 'react-native';
import useLanguageStore from '../../store/languageStore';
import {MainStackParamList} from '../../types/navigation';
import customColor from '../theme/customColor';
import Icon from './Icon';
import Navbar from './Navbar';
import RoundedButton from './RoundedButton';
import CustomText from './Text';

const FallbackScreen = ({hideNavbar = false}: {hideNavbar?: boolean}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  return (
    <SafeAreaView className="h-full bg-white">
      {!hideNavbar && (
        <View className="p-4">
          <Navbar />
        </View>
      )}
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
        <RoundedButton
          resetStyle
          className="bg-cornflowerBlue px-8 py-2"
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.dispatch(
                StackActions.replace('HomepageStackScreens', {
                  screen: 'Home',
                }),
              );
            }
          }}>
          <CustomText className="font-isidoraSemiBold">
            {languages?.goBackTxt}
          </CustomText>
        </RoundedButton>
      </View>
    </SafeAreaView>
  );
};

export default FallbackScreen;
