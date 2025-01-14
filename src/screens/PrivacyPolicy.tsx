import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {MainStackParamList} from '../../types/navigation';
import Navbar from '../components/Navbar';

type PrivacyPolicyRouteProp = RouteProp<MainStackParamList, 'PrivacyPolicy'>;

interface PrivacyPolicyProps {
  route: PrivacyPolicyRouteProp;
}

const PrivacyPolicy = ({route}: PrivacyPolicyProps) => {
  const {uri} = route?.params;
  return (
    <SafeAreaView className="p-4 h-full">
      <Navbar />
      <View className="flex-1">
        <WebView source={{uri}} style={{flex: 1}} />
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
