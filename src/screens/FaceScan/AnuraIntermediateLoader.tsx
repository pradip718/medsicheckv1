import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import uuid from 'react-native-uuid';
import useBinahConfigStore from '../../../store/binahConfigStore';
import useHealthRiskStore from '../../../store/healthRisksStore';
import useLanguageStore from '../../../store/languageStore';
import {useAIReportFacescanStore} from '../../../store/smartReportStore';
import {MainStackParamList} from '../../../types/navigation';
import {notifyApi} from '../../api/user';
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
  const {anuraConfig, geoPosition} = useBinahConfigStore();
  const {actionData, executeAction} = useAIReportFacescanStore();
  const {
    actionData: healthRiskAction,
    executeAction: executeHealthRisksAction,
  } = useHealthRiskStore();
  const EventBridge = useEventBridge();

  const {mutateAsync: postReadings} = usePostReadings({
    onSuccess: async (data, variable) => {
      queryClient.invalidateQueries({queryKey: ['readings']});
      queryClient.invalidateQueries({queryKey: [RESCAN_CONFIGURATION]});
      if (actionData?.fromScreen === 'PersonalisedAI') {
        await executeAction();
        return navigation.goBack();
      }
      if (healthRiskAction?.fromScreen === 'HealthRisks') {
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
      notifyApi('anura_event', {name, data, screen: 'AnuraIntermediateLoader'});
      if (name == Event.anuraMeasurementGetResultsSuccess) {
        await postReadings({
          payload: {
            data: data?.results,
            scan_error: [],
            reading_id: uuid.v4(),
            timestamp: moment().format('YYYY-MM-DD HH:mm'),
            sdk_name: anuraConfig?.sdk_name,
            sdk_type: anuraConfig?.sdk_type,
            geo_location: geoPosition,
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
