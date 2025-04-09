import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  HealthMonitorException,
  SessionState,
  useSessionState,
} from 'biosensesignal-react-native-sdk';
import {assign, isArray, isString} from 'lodash';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useAlertStore from '../../../store/alertStore';
import useAuthStore from '../../../store/authStore';
import useBinahConfigStore from '../../../store/binahConfigStore';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {SCAN_SESSION_STATUS, USER_ACTIVITY} from '../../../types/readings';
import {errorToast} from '../../../utils/toast';
import {syncScanSession} from '../../api/report';
import {postCaptureUserActivity} from '../../api/user';
import BottomAlert from '../../components/AlertModal/BottomAlert';
import BackgroundImage from '../../components/BackgroundImage';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {RESCAN_CONFIGURATION} from '../../constants/hooks';
import {useGetUserReadingDetail} from '../../hooks/api/readings';
import useGetPreHealthReading from '../../hooks/api/useGetPreHealthReading';
import useGetRescanConfiguration from '../../hooks/api/useGetRescanConfiguration';
import useGetUserReading from '../../hooks/api/useGetUserReading';
import usePostReadings from '../../hooks/api/usePostReading';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import useInitializeBinahSession from '../../hooks/useInitializeBinahSession';
import useScreenOrientation from '../../hooks/useScreenOrientation';
import ScanReport from './ScanReport';
import {ImageValidityView} from './components/ImageValidityView';
import RenderCamera from './components/RenderCamera';
import RenderInformationCard from './components/RenderInformationCard';
import StopButton from './components/StopButton';
import FaceScanError from './modal/FaceScanError';
import LowConfidence from './modal/LowConfidence';

type ValidityCount = {
  [key: string]: number;
};

const QRFaceScan = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();

  const {languages} = useLanguageStore();
  const {
    binahConfig,
    errorMessages,
    geoPosition: location,
  } = useBinahConfigStore();
  const {deeplinkAuth} = useAuthStore();
  const {showAlert} = useAlertStore();

  const sessionState = useSessionState();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {isLandscape} = useScreenOrientation();

  const [cameraLocation] = useState('front');
  const [fakeRecording, setFakeRecording] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [didFinishedMeasuring, setDidFinishedMeasuring] =
    useState<boolean>(false);
  const [imageValidityJSON, setImageValidityJSON] = useState<ValidityCount>({});
  const [imageValidity, setImageValidity] = useState<string>();
  const [visible, setVisible] = useState<boolean>(false);
  const [reading_id, setReadingId] = useState(deeplinkAuth?.session_id || '');

  useEffect(() => {
    setReadingId(deeplinkAuth?.session_id || '');
  }, [deeplinkAuth?.session_id]);

  const {data: rescanConfigurations} = useGetRescanConfiguration();
  const {refetch: getReadingDetail} = useGetUserReadingDetail({
    reading_id,
    enabled: false,
  });
  const {refetch: getReading} = useGetUserReading({
    enabled: false,
    gcTime: 0,
  });

  const clearFaceScan = () => {
    if (intervalRef?.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
    setFakeRecording(false);
    setDidFinishedMeasuring(false);
  };

  const resetMeasurement = async (type: USER_ACTIVITY, msg?: string) => {
    clearFaceScan();
    syncScanSession(type as SCAN_SESSION_STATUS, {
      scan_error: imageValidityJSON,
    });
    notifyApi(type, true, {
      message: isString(msg) ? msg : JSON.stringify(msg),
      reading_id,
    });
  };

  const {session, finalValue, restartSession, isRestarting} =
    useInitializeBinahSession({
      resetMeasurement,
      cameraLocation,
    });

  useEffect(() => {
    if (!rescanConfigurations?.rescan_flag && !!rescanConfigurations?.error) {
      notifyApi('scan_error', true, {
        message: rescanConfigurations?.error_msg,
        reading_id,
      });
      showAlert({
        title: rescanConfigurations?.error || languages?.generic_error_message,
        content: rescanConfigurations?.error_msg || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (didFinishedMeasuring) {
      handleCheckResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didFinishedMeasuring]);

  const {data: preReadingConfig} = useGetPreHealthReading();

  const {mutateAsync: postReadings} = usePostReadings();

  const handleValidityJSON = (validity: string) => {
    setImageValidityJSON(prevCounts => ({
      ...prevCounts,
      [validity]: (prevCounts[validity] || 0) + 1,
    }));
  };

  const proceedToReportScreen = async () => {
    showLoader();
    await Promise.all([
      notifyApi('scan_error', true, {
        scan_information: imageValidityJSON,
        reading_id,
      }),
      getReadingDetail(),
      getReading(),
      queryClient.invalidateQueries({queryKey: [RESCAN_CONFIGURATION]}),
    ]);
    hideLoader();

    navigation.navigate('SessionReportDetail', {
      reading_id: reading_id,
    });
    clearFaceScan();
  };

  const handleReportSuccess = async (data: any) => {
    if (
      !data?.success &&
      (data?.error || (isArray(data?.error_msg) && data?.error_msg?.length))
    ) {
      await resetMeasurement('scan_error', data.error_msg);
      return setVisible(true);
    }
    await proceedToReportScreen();
  };

  const handleReportError = (err: any) => {
    errorToast(languages?.post_reading_error);
    resetMeasurement('scan_error', err?.message);
  };

  const {
    isPending: isResultSubmitting,
    mutateAsync: submitResult,
    data: reportResponse,
  } = useMutation({
    mutationFn: async () => {
      if (finalValue) {
        return await postReadings({
          payload: {
            data: finalValue,
            scan_error: imageValidityJSON,
            reading_id,
            timestamp: moment().format('YYYY-MM-DD HH:mm'),
            sdk_name: binahConfig?.sdk_name,
            sdk_type: binahConfig?.sdk_type,
            geo_location: location,
          },
        });
      }
    },
    onMutate: () => showLoader(),
    onSuccess: handleReportSuccess,
    onError: handleReportError,
    onSettled: () => hideLoader(),
  });

  const notifyApi = async (
    user_activity: USER_ACTIVITY,
    includeBinahKey: boolean,
    ...rest: any
  ) => {
    const payload = assign(
      {user_activity, includeBinahKey},
      user_activity === 'scan_error' ? {scan_error: imageValidityJSON} : {},
      ...rest,
    );
    await postCaptureUserActivity(payload);
  };

  const startMeasurement = React.useCallback(async () => {
    if (!session) {
      return;
    }
    try {
      if (sessionState == SessionState.READY && binahConfig?.scan_duration) {
        syncScanSession('start_scan');
        notifyApi('start_scan', true, {
          reading_id: reading_id,
        });
        await session.current?.start(+binahConfig?.scan_duration);
      } else {
        await session.current?.stop();
      }
    } catch (e) {
      resetMeasurement('scan_error', 'Error while trying to start the session');
      const exception = e as HealthMonitorException;
      const error = errorMessages?.find(err => err.code === exception.code);
      if (error) {
        Alert.alert(`${error.cause}`, `${error.solution}`);
      } else {
        errorToast(languages?.generic_error_message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState]);

  const startFakeLoader = async () => {
    // let intervalId: ReturnType<typeof setInterval> | undefined;
    let faceScanningProgress = 0;

    if (!binahConfig?.scan_duration) {
      return;
    }

    if (fakeRecording && intervalRef.current) {
      setFakeRecording(false);
      clearInterval(intervalRef.current);
    }

    setFakeRecording(true);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      faceScanningProgress += 1 / (+binahConfig?.scan_duration + 2);
      setProgress(faceScanningProgress);
      if (faceScanningProgress >= 1 && intervalRef.current) {
        clearInterval(intervalRef.current);
        setFakeRecording(false);
        setDidFinishedMeasuring(true);
      }
    }, 1000);
  };

  const handleMeasureNowPress = () => {
    startMeasurement();
    startFakeLoader();
  };

  const handleCheckResult = async () => {
    syncScanSession('end_scan');
    notifyApi('end_scan', true, {
      reading_id,
    });
    await submitResult();
  };

  const handleImageValidity = (validity: string | undefined) => {
    setImageValidity(validity);
  };

  const isEnabled =
    sessionState == SessionState.READY ||
    sessionState == SessionState.PROCESSING;

  if (isLandscape) {
    return (
      <View className="h-full justify-center items-center">
        <CustomText className="font-isidoraBold text-lg">
          {languages?.switch_to_portrait}
        </CustomText>
      </View>
    );
  }

  return (
    <BackgroundImage className="h-full" style={styles.container}>
      <SafeAreaScrollView
        contentContainerStyle={styles.contentContainer}
        className="h-full">
        <View className="px-6 py-4">
          <Navbar />
        </View>
        <View className="relative px-2 items-center smallPhone:h-2/5 mediumPhone:h-1/2">
          <RenderCamera
            didFinishedMeasuring={didFinishedMeasuring}
            progress={progress}
            readingId={reading_id}
            imageValidity={imageValidity}
          />
        </View>
        <View className="justify-between flex-grow py-4">
          {fakeRecording ? (
            <View className="px-4 items-center">
              <ImageValidityView
                handleValidityJSON={handleValidityJSON}
                progress={progress}
                imageValidity={imageValidity}
                handleImageValidity={handleImageValidity}
              />
            </View>
          ) : (
            <View className="px-8 pt-2">
              <RenderInformationCard
                progress={progress}
                fakeRecording={fakeRecording}
                didFinishedMeasuring={didFinishedMeasuring}
              />
            </View>
          )}

          {progress >= 0.3 ? (
            <ScanReport
              progress={progress}
              preReadingConfig={preReadingConfig || []}
            />
          ) : progress ? (
            <View
              className={twMerge('items-center', isRestarting && 'opacity-50')}>
              <StopButton restartSession={restartSession} />
            </View>
          ) : null}

          {!didFinishedMeasuring && !fakeRecording && (
            <View className="px-2 py-1">
              <RoundedButton
                onPress={handleMeasureNowPress}
                loading={fakeRecording || isResultSubmitting}
                disabled={
                  fakeRecording ||
                  isResultSubmitting ||
                  !isEnabled ||
                  !rescanConfigurations?.rescan_flag
                }>
                <CustomText className="text-xl text-white font-isidoraSemiBold">
                  {languages?.measure_button_txt}
                </CustomText>
              </RoundedButton>
            </View>
          )}
        </View>
      </SafeAreaScrollView>

      <BottomAlert
        visible={visible}
        hideModal={() => {
          setVisible(false);
        }}>
        {reportResponse?.error ? (
          <FaceScanError
            params={reportResponse}
            startMeasurement={startMeasurement}
            proceedToReportScreen={proceedToReportScreen}
            hideModal={() => {
              setVisible(false);
            }}
          />
        ) : (
          <LowConfidence
            params={reportResponse}
            startMeasurement={startMeasurement}
            proceedToReportScreen={proceedToReportScreen}
            hideModal={() => {
              setVisible(false);
            }}
          />
        )}
      </BottomAlert>
    </BackgroundImage>
  );
};

export default QRFaceScan;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    height: '100%',
  },
  // cameraImgOverlay: {resizeMode: 'stretch', height: '100%', width: '100%'},
});
