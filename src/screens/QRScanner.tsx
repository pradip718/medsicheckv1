import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AxiosError} from 'axios';
import React from 'react';
import {Alert, SafeAreaView, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';
import useUserProfileStore from '../../store/profileStore';
import {MainStackParamList} from '../../types/navigation';
import {extractQueryParams} from '../../utils/methods';
import {getSessionToken} from '../api/auth';
import {syncScanSession} from '../api/report';
import BasicContainer from '../components/BasicContainer';
import Navbar from '../components/Navbar';
import {DEEPLINK_CONFIG} from '../constants';

const QRScanner = () => {
  const {languages} = useLanguageStore();
  const {setDeeplinkAuth, userAuth} = useAuthStore();
  const {setIsFaceScanDeeplink} = useAppStore();
  const {setCurrentActiveProfileId} = useUserProfileStore();

  const [isTokenError, setIsTokenError] = React.useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const handleOkPress = () => {
    setIsTokenError(false);
  };

  const handleQRRead = async ({data: url}: {data: string}) => {
    if (isTokenError) {
      return;
    }
    if (
      [
        'https://dev.d1p9s5r42tah7c.amplifyapp.com',
        'https://stage.d1p9s5r42tah7c.amplifyapp.com',
        'https://main.d1p9s5r42tah7c.amplifyapp.com',
        'medsicheck://',
      ]?.some(baseUrl => url.startsWith(baseUrl))
    ) {
      const {session_id, profile_id} = extractQueryParams(url);
      try {
        const {token} = await getSessionToken({
          session_id,
          profile_id,
          customErrorHandle: true,
        });
        if (!token) {
          return '';
        }
        const path = url.split('?')[0].split('/').pop();
        if (path === 'face_scan') {
          setIsFaceScanDeeplink(true);
          setDeeplinkAuth({
            session_id: session_id || '',
            token: token || '',
          });
          setCurrentActiveProfileId(profile_id || '');
          syncScanSession('deeplink_opened');
          return navigation.navigate('QRFaceScan');
        }
        if (path && DEEPLINK_CONFIG[path] && userAuth?.idToken) {
          return navigation.navigate(DEEPLINK_CONFIG[path] as any);
        } else {
          console.warn(`Unknown path: ${path}`);
        }
      } catch (error) {
        setIsTokenError(true);
        if (error instanceof AxiosError) {
          Alert.alert(
            error.response?.data?.error_title || '',
            error.response?.data?.error_msg || '',
            [
              {
                text: 'OK',
                onPress: handleOkPress,
              },
            ],
            {cancelable: false},
          );
        }
      }
    } else {
      Alert.alert(
        languages?.non_medsi_qr_title,
        languages?.non_medsi_qr_content,
      );
    }
  };
  return (
    <BasicContainer className="bg-white">
      <SafeAreaView className="h-full">
        <View className="p-6">
          <Navbar />
        </View>
        <View className="justify-center items-center flex-grow">
          <QRCodeScanner
            showMarker
            reactivate
            reactivateTimeout={500}
            onRead={handleQRRead}
            flashMode={RNCamera.Constants.FlashMode.auto}
          />
        </View>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default QRScanner;
