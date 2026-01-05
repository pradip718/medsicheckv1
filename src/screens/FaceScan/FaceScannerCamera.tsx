/* eslint-disable react-hooks/exhaustive-deps */
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  HealthMonitorException,
  SessionState,
  useSessionState,
} from 'biosensesignal-react-native-sdk';
import { assign, isArray, isString } from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';
import { twMerge } from 'tailwind-merge';
import useAlertStore from '../../../store/alertStore';
import useBinahConfigStore from '../../../store/binahConfigStore';
import useHealthRiskStore from '../../../store/healthRisksStore';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import { useAIReportFacescanStore } from '../../../store/smartReportStore';
import { MainStackParamList } from '../../../types/navigation';
import { SCAN_SESSION_STATUS, USER_ACTIVITY } from '../../../types/readings';
import {
  startSDKVideoRecording,
  stopSDKVideoRecording,
} from '../../../utils/sdkVideoUpload';
import { errorToast } from '../../../utils/toast';
import { getUserScanImagePresignedUrl, syncWebScan } from '../../api/report';
import { postCaptureUserActivity } from '../../api/user';
import BottomAlert from '../../components/AlertModal/BottomAlert';
import BackgroundImage from '../../components/BackgroundImage';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import { RESCAN_CONFIGURATION } from '../../constants/hooks';
import { useGetUserReadingDetail } from '../../hooks/api/readings';
import useGetOnboarding from '../../hooks/api/useGetOnboarding';
import useGetRescanConfiguration from '../../hooks/api/useGetRescanConfiguration';
import usePostOnboardingSteps from '../../hooks/api/usePostOnboardingSteps';
import usePostReadings from '../../hooks/api/usePostReading';
import useBackButton from '../../hooks/useBackButton';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import useInitializeBinahSession from '../../hooks/useInitializeBinahSession';
import useScreenOrientation from '../../hooks/useScreenOrientation';
import ScanReport from './ScanReport';
import { ImageValidityView } from './components/ImageValidityView';
import RenderCamera from './components/RenderCamera';
import RenderInformationCard from './components/RenderInformationCard';
import StopButton from './components/StopButton';
import FaceScanError from './modal/FaceScanError';
import LowConfidence from './modal/LowConfidence';

type ValidityCount = {
  [key: string]: number;
};

const FaceScannerCamera = () => {
  const cameraLocation = 'front';

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {languages} = useLanguageStore();
  const {
    binahConfig,
    errorMessages,
    geoPosition: location,
  } = useBinahConfigStore();
  const sessionState = useSessionState();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {isLandscape} = useScreenOrientation();
  const {showAlert} = useAlertStore();
  const {actionData, executeAction} = useAIReportFacescanStore();
  const {actionData: healthRiskAction, executeAction: executeHealthRiskAction} =
    useHealthRiskStore();

  const [fakeRecording, setFakeRecording] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [didFinishedMeasuring, setDidFinishedMeasuring] =
    useState<boolean>(false);
  const [imageValidityJSON, setImageValidityJSON] = useState<ValidityCount>({});
  const [reading_id, setReadingId] = useState<string>('');
  const videoFilePathRef = React.useRef<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [isOngoingSessions, setIsOngoingSessions] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [imageValidity, setImageValidity] = useState<string>();

  const {data: rescanConfigurations} = useGetRescanConfiguration();
  const {refetch: getReadingDetail} = useGetUserReadingDetail({
    reading_id: reading_id,
    enabled: false,
  });
  const {data: onboarding} = useGetOnboarding({
    gcTime: 0,
    staleTime: Infinity,
  });

  const {session} = useBinahConfigStore();
  const {setSignoutModalVisibility} = useLoaderStore();

  const showSignoutModal = () => {
    setSignoutModalVisibility(true);
    return true;
  };
  useBackButton(showSignoutModal);

  const clearFaceScan = () => {
    if (intervalRef?.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
    setFakeRecording(false);
    setDidFinishedMeasuring(false);
  };

  const resetMeasurement = async (
    type: USER_ACTIVITY,
    msg?: string,
    readingId?: string,
  ) => {
    if (intervalRef?.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    clearFaceScan();
    syncWebScan(type as SCAN_SESSION_STATUS, reading_id, {
      scan_error: imageValidityJSON,
    });
    syncWebScan('end_scan', reading_id || '');
    notifyApi(type, true, {
      message: isString(msg) ? msg : JSON.stringify(msg),
      reading_id: readingId || reading_id,
    });
  };

  const checkForOngoingSession = async () => {
    try {
      await syncWebScan('ongoing_session', '');
      setIsOngoingSessions(false);
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.status === 400) {
        setIsOngoingSessions(true);
        return showAlert({
          title:
            error?.response?.data?.error_title ||
            languages?.generic_error_message,
          content: error?.response?.data?.error_msg || '',
        });
      }
      setIsOngoingSessions(false);
    }
  };

  const {finalValue, restartSession, isRestarting, preReadingConfig} =
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
    checkForOngoingSession();
  }, []);

  useEffect(() => {
    if (didFinishedMeasuring && finalValue) {
      // Stop video recording and upload using presigned URL (non-blocking)
      const handleStopAndUploadVideo = async () => {
        if (!session || !reading_id) {
          return;
        }

        try {
          console.log('Stopping video recording for reading:', reading_id);
          const videoPath = await stopSDKVideoRecording(session);

          if (videoPath) {
            videoFilePathRef.current = videoPath;
            console.log('Video recording stopped, path:', videoPath);

            // Upload video using presigned URL (non-blocking, runs in background)
            (async () => {
              try {
                console.log(
                  'Getting presigned URL for video upload:',
                  reading_id,
                );

                const presignedUrlResponse = await getUserScanImagePresignedUrl(
                  reading_id,
                  false,
                );
                console.log('Presigned URL response:', presignedUrlResponse);

                if (!presignedUrlResponse?.upload_url) {
                  throw new Error('No upload URL received from server');
                }

                // Upload raw binary via RNFS.uploadFiles with binaryStreamOnly
                const filePath = videoPath.replace('file://', '');
                const fileInfo = await RNFS.stat(filePath);

                console.log(
                  'Uploading video file via RNFS.uploadFiles:',
                  filePath,
                );

                try {
                  const uploadResult = await RNFS.uploadFiles({
                    toUrl: presignedUrlResponse.upload_url,
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'video/mp4', // must match backend signing
                    },
                    files: [
                      {
                        name: 'video',
                        filepath: filePath,
                        filename: 'video.mp4', // static
                        filetype: 'video/mp4',
                      },
                    ],
                    binaryStreamOnly: true, // ensures raw bytes only
                    begin: () => console.log('Video upload started'),
                    progress: (data: any) => {
                      const uploadProgress =
                        (data.totalBytesSent / fileInfo.size) * 100;
                      console.log(
                        `Upload progress: ${uploadProgress.toFixed(2)}%`,
                      );
                    },
                  }).promise;

                  if (![200, 204].includes(uploadResult.statusCode)) {
                    throw new Error(
                      `Upload failed: ${uploadResult.statusCode} ${uploadResult.body}`,
                    );
                  }

                  console.log('Video uploaded successfully');

                  // Clean up local file
                  if (await RNFS.exists(filePath)) {
                    await RNFS.unlink(filePath);
                    console.log('Local video file deleted:', filePath);
                  }
                } catch (error) {
                  console.error('Error uploading video:', error);
                }
              } catch (uploadError) {
                console.error('Error uploading video:', uploadError);
              }
            })();
          } else {
            console.log('No video file to upload');
          }
        } catch (videoError) {
          console.error('Error stopping video recording:', videoError);
        }
      };

      handleStopAndUploadVideo();

      submitResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didFinishedMeasuring, finalValue]);

  const {mutateAsync: postOnboardingStep, isPending: isPostOnboardingPending} =
    usePostOnboardingSteps();
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

      onboarding?.data?.some(
        onboardingStep =>
          onboardingStep.milestone_tag === 'first-health-measurement',
      )
        ? Promise.resolve()
        : postOnboardingStep({milestone: 'first-health-measurement'}),

      getReadingDetail(),
      queryClient.invalidateQueries({queryKey: ['readings']}),
      queryClient.invalidateQueries({queryKey: [RESCAN_CONFIGURATION]}),
    ]);

    hideLoader();

    if (actionData?.fromScreen === 'PersonalisedAI') {
      await executeAction();
      return navigation.goBack();
    }
    if (healthRiskAction?.fromScreen === 'HealthRisks') {
      await executeHealthRiskAction();
      return navigation.goBack();
    }

    navigation.dispatch(
      StackActions.replace('ReportStackScreens', {
        screen: 'Report',
        params: {
          reading_id,
        },
      }),
    );
  };

  const handleReportSuccess = async (data: any) => {
    if (
      !data?.success &&
      (data?.error || (isArray(data?.error_msg) && data?.error_msg?.length))
    ) {
      await resetMeasurement('scan_error', data.error_msg);
      return setVisible(true);
    }
    syncWebScan('end_scan', reading_id || '');
    notifyApi('end_scan', true, {
      reading_id,
    });

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
      {geo_location: location},
      ...rest,
    );
    await postCaptureUserActivity(payload);
  };

  const startMeasurement = React.useCallback(async () => {
    if (!session) {
      return;
    }
    const readingId = uuid.v4();
    setReadingId(readingId);
    try {
      if (sessionState == SessionState.READY && binahConfig?.scan_duration) {
        syncWebScan('start_scan', readingId || '');
        notifyApi('start_scan', true, {
          reading_id: readingId,
        });

        // Start video recording before starting the session
        try {
          console.log('Starting video recording for reading:', readingId);
          const videoPath = await startSDKVideoRecording(
            session,
            readingId,
            0,
            0,
            30,
          );
          videoFilePathRef.current = videoPath;
          console.log('Video recording started, path:', videoPath);
        } catch (videoError: any) {
          console.error('Error starting video recording:', videoError);
          // Continue with scan even if video recording fails
        }

        await session?.start(+binahConfig?.scan_duration);
      } else {
        await session?.stop();
      }
    } catch (e) {
      resetMeasurement(
        'scan_error',
        'Error while trying to start the session',
        readingId,
      );
      const exception = e as HealthMonitorException;
      const error = errorMessages?.find(err => err.code === exception.code);

      const alertAction = [
        {text: languages?.allow_txt, onPress: () => console.log('OK Pressed')},
      ];
      if (error?.code === 4) {
        alertAction.push({
          text: languages?.settings,
          onPress: () => {
            if (Platform.OS === 'android') {
              Linking.sendIntent('android.settings.BATTERY_SAVER_SETTINGS');
            } else {
              Linking.openSettings();
            }
          },
        });
      }
      if (error) {
        Alert.alert(`${error.cause}`, `${error.solution}`, alertAction);
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

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await checkForOngoingSession();
    } catch (error) {
      console.error('handleRefresh error', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImageValidity = (validity: string | undefined) => {
    setImageValidity(validity);
  };

  const isEnabled =
    (sessionState == SessionState.READY ||
      sessionState == SessionState.PROCESSING) &&
    !isOngoingSessions;

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
    <BackgroundImage className="h-full flex-1" style={styles.container}>
      <SafeAreaScrollView
        contentContainerStyle={styles.contentContainer}
        className="h-full"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }>
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
            <>
              <View className="px-2 py-1">
                <RoundedButton
                  onPress={handleMeasureNowPress}
                  loading={
                    fakeRecording ||
                    isResultSubmitting ||
                    isPostOnboardingPending
                  }
                  disabled={
                    fakeRecording ||
                    isResultSubmitting ||
                    isPostOnboardingPending ||
                    !isEnabled ||
                    !rescanConfigurations?.rescan_flag
                  }>
                  <CustomText className="text-xl text-white font-isidoraSemiBold">
                    {languages?.measure_button_txt}
                  </CustomText>
                </RoundedButton>
              </View>
            </>
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

export default FaceScannerCamera;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    flex: 1,
    height: '100%',
  },
  // cameraImgOverlay: {resizeMode: 'stretch', height: '100%', width: '100%'},
});
