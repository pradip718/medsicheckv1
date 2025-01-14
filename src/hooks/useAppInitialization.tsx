import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {StackActions} from '@react-navigation/native';
import {MutationOptions, useMutation} from '@tanstack/react-query';
import {useEffect} from 'react';
import {navigationRef} from '../../RootNavigation';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';
import {getDeviceLocaleInformation} from '../../utils/methods';
import {getLanguage} from '../api/language';
import {useSetupUserProfile} from './api/auth';
import useFetchBinahConfig from './useFetchBinahConfig';

const useAppInitialization = (props?: MutationOptions) => {
  const {setLanguages} = useLanguageStore();
  const {deeplinkAuth} = useAuthStore();

  const {mutateAsync: setupUserProfile} = useSetupUserProfile();
  const {mutateAsync: getBinahConfig} = useFetchBinahConfig();

  const loadLanguage = async () => {
    const locale = getDeviceLocaleInformation();
    const {data: language} = await getLanguage(locale);
    if (language) {
      setLanguages(language);
    }
  };

  const fetchBinahConfig = async () => {
    if (deeplinkAuth?.token) {
      await getBinahConfig();
    }
  };

  const initializeLanguage = async () => {
    await loadLanguage();
  };

  const handleConnectivityChange = (state: NetInfoState) => {
    if (
      !state.isInternetReachable &&
      !state.isConnected &&
      navigationRef?.isReady()
    ) {
      navigationRef?.navigate('OfflineScreen');
    } else if (navigationRef?.canGoBack()) {
      navigationRef?.goBack();
    }
  };

  const subscribeToConnectivityChanges = () => {
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return unsubscribe;
  };

  useEffect(() => {
    if (navigationRef?.isReady()) {
      const unsubscribe = subscribeToConnectivityChanges();
      return () => {
        unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationRef]);

  return useMutation({
    mutationFn: async () => {
      const [_, __, setupUserProfileResult] = await Promise.allSettled([
        fetchBinahConfig(),
        initializeLanguage(),
        setupUserProfile(),
      ]);
      if (setupUserProfileResult.status === 'fulfilled') {
        const {isAuthenticated} = setupUserProfileResult.value;
        if (!isAuthenticated) {
          navigationRef?.dispatch(StackActions.replace('Login'));
        }
      }
    },
    mutationKey: ['appInitialization'],
    gcTime: 5000,
    ...props,
  });
};

export default useAppInitialization;
