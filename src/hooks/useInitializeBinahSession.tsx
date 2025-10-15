import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {
  CameraLocation,
  HealthMonitorException,
  Session,
  SessionBuilder,
  SessionState,
  Sex,
  VitalSign,
  VitalSignTypes,
  useEnabledVitalSigns,
  useFinalResults,
  useLicenseInfo,
  useSessionErrors,
  useSessionState,
} from 'biosensesignal-react-native-sdk';
import _ from 'lodash';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  AlertButton,
  AppState,
  AppStateStatus,
  Linking,
  Platform,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import {sessionMutex} from '../..';
import useBinahConfigStore from '../../store/binahConfigStore';
import useLanguageStore from '../../store/languageStore';
import {MainStackParamList} from '../../types/navigation';
import {USER_ACTIVITY} from '../../types/readings';
import {User} from '../../types/users/user';
import {isAndroid} from '../../utils';
import {
  convertFeetAndInchesToCm,
  convertWeightToKg,
  getAgeFromBirthdate,
} from '../../utils/methods';
import {errorToast} from '../../utils/toast';
import {getBinahErrorMessage} from '../api/binah';
import useGetPreHealthReading from './api/useGetPreHealthReading';
import useGetUserAttributes from './api/useGetUserAttributes';
import useFetchBinahConfig from './useFetchBinahConfig';
import useFullPageLoader from './useFullPageLoader';

const checkCameraPermissions = async (): Promise<boolean> => {
  try {
    const permission = isAndroid
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.IOS.CAMERA;
    return (
      (await check(permission)) == RESULTS.GRANTED ||
      (await request(permission)) == RESULTS.GRANTED
    );
  } catch (e) {
    return false;
  }
};

const getGenderForDemoGraphic = (gender: User['gender'] | undefined): Sex => {
  if (gender === 'male') {
    return Sex.MALE;
  }
  if (gender === 'female') {
    return Sex.FEMALE;
  }
  return Sex.UNSPECIFIED;
};

enum ScreenActiveState {
  ACTIVE,
  INACTIVE,
}

const useInitializeBinahSession = ({
  resetMeasurement,
  cameraLocation,
}: {
  resetMeasurement: (type: USER_ACTIVITY, msg?: string) => Promise<void>;
  cameraLocation: string;
}) => {
  const {mutateAsync: getBinahConfig} = useFetchBinahConfig();
  const {data: users} = useGetUserAttributes();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [finalValue, setFinalValue] =
    useState<Record<string, VitalSign | string>>();
  const enabledVitalSigns = useEnabledVitalSigns();
  const {
    binahConfig,
    setErrorMessage,
    errorMessages,
    setSession,
    session: backupSession,
    geoPosition: location,
  } = useBinahConfigStore();
  const licenseInfo = useLicenseInfo();
  const finalResults = useFinalResults();
  const sessionError = useSessionErrors();
  const sessionState = useSessionState();

  const session = useRef<Session>();
  const duringPermissionsCheck = useRef(false);

  const [screenActiveState, setScreenActiveState] = useState(
    ScreenActiveState.ACTIVE,
  );

  const {data: preReadingConfig} = useGetPreHealthReading({
    longitude: location?.longitude ?? undefined,
    latitude: location?.latitude ?? undefined,
    altitude: location?.altitude ?? undefined,
  });

  useEffect(() => {
    const fetchErrorMsgJson = async () => {
      const errors = await getBinahErrorMessage();
      setErrorMessage(errors);
    };
    fetchErrorMsgJson();
  }, [setErrorMessage]);

  const {mutateAsync: restartSession, isPending: isRestarting} = useMutation({
    mutationKey: ['Restart_Sessions'],
    onMutate: showLoader,
    mutationFn: async () => {
      resetMeasurement('stop_scan', 'restart session');
      await createNewSession();
    },
    onSuccess: hideLoader,
  });

  const {mutateAsync: stopSession} = useMutation({
    mutationKey: ['Background-Reset-Sessions'],
    onMutate: showLoader,
    onSettled: hideLoader,
    mutationFn: async () => {
      await resetMeasurement('stop_scan', 'User Move to background');
      await createNewSession();
    },
  });

  useEffect(() => {
    getBinahConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkCameraPermission = async () => {
    if (!binahConfig?.sdk_value) {
      return;
    }
    duringPermissionsCheck.current = true;
    const permissionsGranted = await checkCameraPermissions();
    duringPermissionsCheck.current = false;
    if (!permissionsGranted) {
      errorToast('Please approve permissions in the device settings');
      return;
    }
    return true;
  };

  const {mutateAsync: createFaceSession} = useMutation({
    onMutate: async () => {
      if (backupSession) {
        await backupSession?.terminate();
      }
    },
    mutationKey: ['FaceSession'],
    mutationFn: async () => {
      session.current = await SessionBuilder.faceSession(
        {
          licenseKey: binahConfig?.sdk_value,
        },
        {
          // sdkAnalytics: true
          cameraLocation:
            cameraLocation === 'back'
              ? CameraLocation.BACK
              : CameraLocation.FRONT,
          subjectDemographic:
            binahConfig?.demographic_flag === 'True'
              ? {
                  age: users?.birthdate
                    ? getAgeFromBirthdate(users?.birthdate)
                    : undefined,
                  height: users?.height
                    ? convertFeetAndInchesToCm(
                        Number(users?.height),
                        users?.height_unit,
                      )
                    : undefined,
                  weight: users?.weight
                    ? convertWeightToKg(
                        Number(users?.weight),
                        users?.weight_unit,
                      )
                    : undefined,
                  sex: users?.gender
                    ? getGenderForDemoGraphic(users?.gender)
                    : undefined,
                }
              : undefined,
        },
      );
    },
    onSuccess: () => {
      setSession(session.current);
    },
    retry: 2,
    retryDelay: 500,
  });

  const createNewSession = () =>
    sessionMutex.runExclusive(async () => {
      try {
        const permissionAllowed = await checkCameraPermission();
        if (!permissionAllowed) {
          return;
        }

        await createFaceSession();
      } catch (e) {
        const exception = e as HealthMonitorException;
        const error = errorMessages?.find(err => err.code === exception.code);
        resetMeasurement(
          'scan_error',
          'Error while trying to create a new session',
        );
        await terminateSession(); // Ensure session is terminated in case of error
        if (error) {
          const alertAction = [
            {
              text: languages?.allow_txt,
              onPress: () => console.log('OK Pressed'),
            },
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
          Alert.alert(`${error.cause}`, `${error.solution}`, alertAction);
        } else {
          errorToast(languages?.generic_error_message);
        }
      }
    });

  const terminateSession = async () => {
    await session?.current?.terminate();
    if (backupSession) {
      await backupSession?.terminate();
    }
  };

  useEffect(() => {
    try {
      if (sessionError?.code) {
        const error = errorMessages?.find(
          err => err.code === sessionError?.code,
        );

        if (error) {
          const alertAction: AlertButton[] = [
            {
              text: languages?.allow_txt,
              onPress: navigation.goBack,
              style: 'cancel',
            },
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
              style: 'cancel',
            });
          }

          Alert.alert(`${error.cause}`, `${error.solution}`, alertAction);
        } else {
          errorToast(languages?.generic_error_message);
        }
        terminateSession();
        resetMeasurement('scan_error', `${error?.cause} ${error?.solution}`);
      }
    } catch (error) {
      console.log('error', error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionError]);

  useEffect(() => {
    try {
      const subscription = AppState.addEventListener(
        'change',
        (appState: AppStateStatus) => {
          if (appState === 'active' && !session.current) {
            setScreenActiveState(ScreenActiveState.ACTIVE);
          } else if (
            appState === 'background' &&
            !duringPermissionsCheck.current
          ) {
            stopSession();
            setScreenActiveState(ScreenActiveState.INACTIVE);
          }
        },
      );

      return subscription.remove;
    } catch (error) {
      console.log('error', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (binahConfig?.sdk_value) {
      screenActiveState == ScreenActiveState.ACTIVE
        ? createNewSession()
        : terminateSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenActiveState, binahConfig?.sdk_value, cameraLocation]);

  useFocusEffect(
    useCallback(() => {
      setScreenActiveState(ScreenActiveState.ACTIVE);
      return async () => {
        await terminateSession();
        setScreenActiveState(ScreenActiveState.INACTIVE);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (
      sessionState == SessionState.STARTING ||
      sessionState == SessionState.PROCESSING
    ) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }
  }, [sessionState]);

  useEffect(() => {
    if (enabledVitalSigns) {
      console.log(
        `Pulse Rate Enabled: ${enabledVitalSigns.isEnabled(
          VitalSignTypes.PULSE_RATE,
        )}`,
      );
    }
  }, [enabledVitalSigns]);

  useEffect(() => {
    if (licenseInfo) {
      console.log(
        `License Activation ID: ${licenseInfo.activationInfo.activationId}`,
      );

      if (licenseInfo.offlineMeasurements) {
        console.log(`License Offline Measurements:
                        ${licenseInfo.offlineMeasurements.totalMeasurements}/
                        ${licenseInfo.offlineMeasurements.remainingMeasurements}`);
      }
    }
  }, [licenseInfo]);

  useEffect(() => {
    try {
      if (finalResults) {
        const values: Record<string, VitalSign | string> = {};

        _.forOwn(VitalSignTypes, (vitalSignType, key) => {
          const result = finalResults.getResult(vitalSignType);
          let adjustedValue: VitalSign | string;

          if (_.isObject(result) && _.has(result, 'value')) {
            const configItem = _.find(preReadingConfig, {
              vitalType: vitalSignType,
            });

            if (configItem && _.has(configItem, 'config.relative')) {
              adjustedValue = {
                ...result,
                value: result.value + configItem.config.relative || 0,
              };
            } else {
              adjustedValue = result;
            }
          } else {
            adjustedValue = result ?? 'N/A';
          }
          values[key] = adjustedValue;
        });
        setFinalValue(values);
      }
    } catch (error) {
      console.log('error', error);
    }
  }, [finalResults, preReadingConfig]);

  return {
    session,
    finalValue,
    binahConfig,
    restartSession,
    isRestarting,
    createNewSession,
    preReadingConfig,
  };
};

export default useInitializeBinahSession;
