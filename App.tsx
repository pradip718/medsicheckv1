/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as Sentry from '@sentry/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {LogBox, StatusBar, useColorScheme} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import ErrorBoundary from 'react-native-error-boundary';
import 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import RootNavigator from './navigation';
import {getAWSSecretKeys} from './src/api/auth';
import AlertModal from './src/components/AlertModal';
import AppUpdateModal from './src/components/AlertModal/AppUpdateModal';
import {ErrorFallback} from './src/components/ErrorFallback';
import FullScreenLoader from './src/components/FullScreenLoader';
import SignoutModal from './src/components/SignoutModal';
import Maintenance from './src/screens/Maintenance';
import useAuthStore from './store/authStore';
import useLanguageStore from './store/languageStore';
import useLoaderStore from './store/loaderStore';
import {toastConfig} from './utils/common';
import {registerListenerWithFCM} from './utils/notification';

const queryClient = new QueryClient();

function App(): JSX.Element {
  const {languages} = useLanguageStore();
  const {setAWSCred} = useAuthStore();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isAWSKeyFetching, setIsAWSKeyFetching] = useState(false);

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

  const isDarkMode = useColorScheme() === 'dark';
  const {visible, signoutModalVisibility} = useLoaderStore();

  useEffect(() => {
    if (languages?.is_under_maintenance === 'false') {
      setIsMaintenanceMode(false);
    }
  }, [languages]);

  useEffect(() => {
    const initializeAWS = async () => {
      try {
        setIsAWSKeyFetching(true);
        const credentials = await getAWSSecretKeys();
        if (credentials) {
          setAWSCred(credentials);
        }
      } catch (error) {
        console.log('error', error);
      } finally {
        setIsAWSKeyFetching(false);
      }
    };
    initializeAWS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (isAWSKeyFetching) {
    return <></>;
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Toast config={toastConfig} />
            {isMaintenanceMode ? <Maintenance /> : <RootNavigator />}
            <Toast />
            <FullScreenLoader visible={visible} />
            <SignoutModal visible={signoutModalVisibility} />
            <AlertModal />
            <AppUpdateModal
              triggerMaintenanceMode={() => setIsMaintenanceMode(true)}
            />
          </ErrorBoundary>
        </PaperProvider>
      </QueryClientProvider>
    </>
  );
}

export default Sentry.wrap(App);
