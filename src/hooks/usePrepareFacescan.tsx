import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import useAlertStore from '../../store/alertStore';
import useBinahConfigStore from '../../store/binahConfigStore';
import useLanguageStore from '../../store/languageStore';
import {MainStackParamList} from '../../types/navigation';
import {
  convertFeetAndInchesToCm,
  convertWeightToKg,
  getAgeFromBirthdate,
  hasValidUserDemographics,
} from '../../utils/methods';
import {notifyApi} from '../api/user';
import Action from '../config/Action';
import Event from '../config/Event';
import useEventBridge from '../config/EventBridge';
import useGetRescanConfiguration from './api/useGetRescanConfiguration';
import useGetUserAttributes from './api/useGetUserAttributes';
import useFetchBinahConfig from './useFetchBinahConfig';
import useFullPageLoader from './useFullPageLoader';

const usePrepareFacescan = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {anuraConfig, setGeoPosition} = useBinahConfigStore();
  const {languages} = useLanguageStore();
  const {showAlert} = useAlertStore();
  const {showLoader} = useFullPageLoader();

  const EventBridge = useEventBridge();

  const {data: users} = useGetUserAttributes();
  const {data: rescanConfigurations} = useGetRescanConfiguration();

  const {mutateAsync: getSdkConfig} = useFetchBinahConfig();

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

  useEffect(() => {
    EventBridge.sendEvent(
      Action.synchronizeAppConfiguration,
      anuraConfig?.sdk_value,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anuraConfig]);

  useEffect(() => {
    setGeoPosition(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAnuraScan = () => {
    try {
      let userDemographics = {
        height: users?.height
          ? Math.round(
              convertFeetAndInchesToCm(
                Number(users?.height),
                users?.height_unit,
              ) ?? 0,
            )
          : undefined,
        weight: users?.weight
          ? Math.round(
              convertWeightToKg(Number(users?.weight), users?.weight_unit) ?? 0,
            )
          : undefined,
        age: users?.birthdate
          ? getAgeFromBirthdate(users?.birthdate)
          : undefined,
        gender: users?.gender,
        partnerID: users?.profile_id,
      };

      if (!hasValidUserDemographics(userDemographics)) {
        // user demographics is not valid, only retain the partnerID
        userDemographics = {partnerID: users?.profile_id};
      }

      EventBridge.sendEvent(Action.startMeasurement, userDemographics);

      /* Use the following code to customize the measurement page
                        EventBridge.sendEvent(Action.synchronizeConfiguration, CustomConfig.measurementConfig)
                        EventBridge.sendEvent(Action.synchronizeUIConfiguration, CustomConfig.measurementUIConfig)
                      */

      EventBridge.addCommonListener(name => {
        if (name == Event.anuraMeasurementPageDidFinishMeasuring) {
          navigation.navigate('AnuraIntermediateLoader');
        }
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const startScan = async () => {
    if (rescanConfigurations?.rescan_flag) {
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
    } else {
      showAlert({
        title: rescanConfigurations?.error ?? '',
        content: rescanConfigurations?.error_msg ?? '',
      });
    }
  };

  return {startScan};
};

export default usePrepareFacescan;
