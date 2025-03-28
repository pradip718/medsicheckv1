/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as Sentry from '@sentry/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React, {useEffect, useState} from 'react';
import {LogBox, StatusBar} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import ErrorBoundary from 'react-native-error-boundary';
import 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import RootNavigator from './navigation';
import {getLanguage} from './src/api/language';
import AlertModal from './src/components/AlertModal';
import AppUpdateModal from './src/components/AlertModal/AppUpdateModal';
import {ErrorFallback} from './src/components/ErrorFallback';
import FullScreenLoader from './src/components/FullScreenLoader';
import SignoutModal from './src/components/SignoutModal';
import Maintenance from './src/screens/Maintenance';
import useLanguageStore from './store/languageStore';
import useLoaderStore from './store/loaderStore';
import {toastConfig} from './utils/common';
import {getDeviceLocaleInformation} from './utils/methods';
import {registerListenerWithFCM} from './utils/notification';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response) {
          const statusCode = error.response.status;

          if (statusCode === 400 || statusCode === 403) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

function App(): JSX.Element {
  const {languages, setLanguages} = useLanguageStore();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  if (!__DEV__) {
    Sentry.init({
      environment: Config.Environment,
      dsn:
        languages?.sentry_dsn ||
        'https://6f60a90abe9479185d953565e52b9770@o4507020983926784.ingest.us.sentry.io/4507020986679296',
      tracesSampleRate: 1.0,
      release: DeviceInfo.getVersion(),
      dist: DeviceInfo.getBuildNumber(),
      enableNative: true,
    });
  }

  const {visible, signoutModalVisibility} = useLoaderStore();

  useEffect(() => {
    const loadLanguage = async () => {
      const locale = getDeviceLocaleInformation();
      const {data: language} = await getLanguage(locale);
      setLanguages(language);
    };

    loadLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsMaintenanceMode(languages?.is_under_maintenance === 'true');
  }, [languages]);

  useEffect(() => {
    const unsubscribe = registerListenerWithFCM();
    return unsubscribe;
  }, []);

  if (__DEV__) {
    const ignoreWarns = ['ViewPropTypes will be removed from React Native'];

    const warn = console.warn;
    console.warn = (...arg) => {
      for (const warning of ignoreWarns) {
        if (arg[0].startsWith(warning)) {
          return;
        }
      }
      warn(...arg);
    };

    LogBox.ignoreLogs(ignoreWarns);
  }

  return (
    <>
      <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} />
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {isMaintenanceMode ? <Maintenance /> : <RootNavigator />}
            <FullScreenLoader visible={visible} />
            <SignoutModal visible={signoutModalVisibility} />
            <AlertModal />
            <AppUpdateModal
              triggerMaintenanceMode={() => setIsMaintenanceMode(true)}
            />
            <Toast config={toastConfig} />
          </ErrorBoundary>
        </PaperProvider>
      </QueryClientProvider>
    </>
  );
}

export default Sentry.wrap(App);
