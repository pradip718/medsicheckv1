import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useCallback, useEffect} from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import uuid from 'react-native-uuid';
import useBinahConfigStore from '../../../store/binahConfigStore';
import useHealthRiskStore from '../../../store/healthRisksStore';
import useLanguageStore from '../../../store/languageStore';
import {useAIReportFacescanStore} from '../../../store/smartReportStore';
import {MainStackParamList} from '../../../types/navigation';
import BackgroundImage from '../../components/BackgroundImage';
import CustomText from '../../components/Text';
import Event from '../../config/Event';
import useEventBridge from '../../config/EventBridge';
import {RESCAN_CONFIGURATION} from '../../constants/hooks';
import usePostReadings from '../../hooks/api/usePostReading';
import customColor from '../../theme/customColor';

const AnuraIntermediateLoader = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {anuraConfig} = useBinahConfigStore();
  const {actionData, executeAction} = useAIReportFacescanStore();
  const {executeAction: executeHealthRisksAction} = useHealthRiskStore();
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
          title: 'Location Permission',
          message: 'We need access to your location for accurate readings',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }, []);

  const getLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      return new Promise(resolve => {
        Geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || undefined,
            });
          },
          error => {
            console.log(error.code, error.message);
            resolve({}); // Resolve with empty object if there's an error
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      });
    }
    return {};
  }, [requestLocationPermission]);

  const {mutateAsync: postReadings} = usePostReadings({
    onSuccess: async (data, variable) => {
      queryClient.invalidateQueries({queryKey: ['readings']});
      queryClient.invalidateQueries({queryKey: [RESCAN_CONFIGURATION]});
      if (actionData?.fromScreen === 'PersonalisedAI') {
        await executeAction();
        return navigation.goBack();
      }
      if (actionData?.fromScreen === 'HealthRisks') {
        await executeHealthRisksAction();
        return navigation.goBack();
      }
      const {
        payload: {reading_id},
      } = variable;
      navigation.dispatch(
        StackActions.replace('ReportStackScreens', {
          screen: 'Report',
          params: {
            reading_id,
          },
        }),
      );
    },
  });

  const addResultsListener = async () => {
    EventBridge.addResultsListener(async (name, data) => {
      if (name == Event.anuraMeasurementGetResultsSuccess) {
        const locationData = await getLocation();
        await postReadings({
          payload: {
            data: data?.results,
            scan_error: [],
            reading_id: uuid.v4(),
            timestamp: moment().format('YYYY-MM-DD HH:mm'),
            sdk_name: anuraConfig?.sdk_name,
            sdk_type: anuraConfig?.sdk_type,
            geo_location: locationData,
          },
        });
      }
    });
  };

  useEffect(() => {
    addResultsListener();
    return () => {
      EventBridge.removeResultsListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BackgroundImage>
      <View className="h-full justify-center items-center">
        <CustomText className="font-isidoraSemiBold text-lg text-ultramarineBlue">
          {languages?.anura_intermediate_loader}
        </CustomText>

        <ActivityIndicator
          animating={true}
          color={customColor.blueBerry}
          size={'large'}
          className="mt-4"
        />
      </View>
    </BackgroundImage>
  );
};

export default AnuraIntermediateLoader;
