import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import useAlertStore from '../../store/alertStore';
import useBinahConfigStore from '../../store/binahConfigStore';
import {MainStackParamList} from '../../types/navigation';
import {
  convertFeetAndInchesToCm,
  convertWeightToKg,
  getAgeFromBirthdate,
  hasValidUserDemographics,
} from '../../utils/methods';
import Action from '../config/Action';
import Event from '../config/Event';
// import EventBridge from '../config/EventBridge';
import useEventBridge from '../config/EventBridge';
import useGetRescanConfiguration from './api/useGetRescanConfiguration';
import useGetUserAttributes from './api/useGetUserAttributes';
import useFetchBinahConfig from './useFetchBinahConfig';
import useFullPageLoader from './useFullPageLoader';

const usePrepareFacescan = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {anuraConfig} = useBinahConfigStore();
  const {showAlert} = useAlertStore();
  const {showLoader} = useFullPageLoader();

  const EventBridge = useEventBridge();

  const {data: users} = useGetUserAttributes();
  const {data: rescanConfigurations} = useGetRescanConfiguration();

  const {mutateAsync: getSdkConfig} = useFetchBinahConfig();

  useEffect(() => {
    EventBridge.sendEvent(
      Action.synchronizeAppConfiguration,
      anuraConfig?.sdk_value,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anuraConfig]);

  const startAnuraScan = () => {
    try {
      let userDemographics = {
        height: users?.height
          ? convertFeetAndInchesToCm(Number(users?.height), users?.height_unit)
          : undefined,
        weight: users?.weight
          ? convertWeightToKg(Number(users?.weight), users?.weight_unit)
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
