import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AxiosError} from 'axios';
import React, {useCallback} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  View,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Geolocation from 'react-native-geolocation-service';
import QRCodeScanner from 'react-native-qrcode-scanner';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';
import useBinahConfigStore from '../../store/binahConfigStore';
import useLanguageStore from '../../store/languageStore';
import useUserProfileStore from '../../store/profileStore';
import {MainStackParamList} from '../../types/navigation';
import {extractQueryParams} from '../../utils/methods';
import {getSessionToken} from '../api/auth';
import {DEEPLINKS} from '../api/DeepLinks';
import {syncScanSession} from '../api/report';
import {notifyApi} from '../api/user';
import BasicContainer from '../components/BasicContainer';
import Navbar from '../components/Navbar';
import Action from '../config/Action';
import Event from '../config/Event';
import useEventBridge from '../config/EventBridge';
import {DEEPLINK_CONFIG} from '../constants';
import useFetchBinahConfig from '../hooks/useFetchBinahConfig';
import useFullPageLoader from '../hooks/useFullPageLoader';

const QRScanner = () => {
  const {languages} = useLanguageStore();
  const {setDeeplinkAuth, userAuth} = useAuthStore();
  const {setIsFaceScanDeeplink} = useAppStore();
  const {setCurrentActiveProfileId} = useUserProfileStore();
  const {setGeoPosition} = useBinahConfigStore();
  const {showLoader} = useFullPageLoader();

  const [isTokenError, setIsTokenError] = React.useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const {mutateAsync: getSdkConfig} = useFetchBinahConfig();
  const EventBridge = useEventBridge();

  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const status = await Geolocation.requestAuthorization('whenInUse');
        return status === 'granted';
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: languages?.location_permission_title,
          message: languages?.location_permission_message,
          buttonNeutral: languages?.ask_me_later,
          buttonNegative: languages?.cancel,
          buttonPositive: languages?.allow_txt,
        },
      );
      notifyApi('geo_location_permission_granted', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }, [languages]);

  const getLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    notifyApi('geo_location_permission_granted', hasPermission);
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        position => {
          setGeoPosition(position?.coords);
        },
        error => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestLocationPermission]);

  const startAnuraScan = () => {
    try {
      let userDemographics = {
        height: 0,
        weight: 0,
        age: 25,
        gender: 'male',
        partnerID: 123456,
      };

      EventBridge.sendEvent(Action.startMeasurement, userDemographics);

      EventBridge.addCommonListener(name => {
        if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
          navigation.navigate('AnuraIntermediateLoader');
        }
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleOkPress = () => {
    setIsTokenError(false);
  };

  const handleQRRead = async ({data: url}: {data: string}) => {
    if (isTokenError) {
      return;
    }
    if (DEEPLINKS?.some(baseUrl => url.startsWith(baseUrl))) {
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

        const {sdk_name} = await getSdkConfig();
        await getLocation();
        if (sdk_name === 'binaah') {
          navigation?.navigate('FaceScanCamera');
        }
        if (sdk_name === 'nuralogix') {
          navigation?.navigate('PrepareFacescan');
          showLoader();
          startAnuraScan();
        }

        const path = url?.split('?')[0]?.replace(/\/$/, '')?.split('/').pop();
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
