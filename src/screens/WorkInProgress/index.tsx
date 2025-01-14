import {
  DrawerActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import React from 'react';
import {ImageBackground, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MainStackParamList} from '../../../types/navigation';
import Navbar from '../../components/Navbar';

const WIP = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const handleBackClick = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };
  return (
    <SafeAreaView className="relative">
      <ImageBackground
        source={require('../../../assets/images/coming_soon.png')}
        className="h-screen w-screen"
        resizeMode="stretch">
        <View className="py-6 px-4 absolute z-10 left-0 right-0">
          <Navbar onBackClick={handleBackClick} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default WIP;
