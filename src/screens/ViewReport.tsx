import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import _ from 'lodash';
import {SafeAreaView, View} from 'moti';
import React from 'react';
import WebView from 'react-native-webview';
import useLanguageStore from '../../store/languageStore';
import {MainStackParamList} from '../../types/navigation';
import FallbackScreen from '../components/FallbackScreen';
import Navbar from '../components/Navbar';
import RoundedButton from '../components/RoundedButton';
import CustomText from '../components/Text';

type ViewReportRouteProp = RouteProp<MainStackParamList, 'ViewReport'>;

interface ViewReportProps {
  route: ViewReportRouteProp;
}

const ViewReport = ({route}: ViewReportProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const {uri} = route?.params || {};

  if (!uri || _.isEmpty(uri)) {
    return <FallbackScreen />;
  }
  const googleDocsViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    uri,
  )}`;

  return (
    <SafeAreaView className="mt-4">
      <View className="p-4">
        <Navbar />
      </View>
      <View
        className="h-full"
        from={{opacity: 0, scale: 0.5}}
        animate={{opacity: 1, scale: 1}}
        transition={{type: 'timing', duration: 1000} as any}>
        <WebView
          source={{
            uri: googleDocsViewerUrl,
          }}
          className="flex-grow"
        />

        <View className="items-center my-4">
          <RoundedButton
            resetStyle
            className="py-2 min-w-[182px] bg-[#D8E0FF]"
            onPress={navigation.goBack}>
            <CustomText className="font-isidoraBold text-lg text-center text-black">
              {languages?.proceed}
            </CustomText>
          </RoundedButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ViewReport;
