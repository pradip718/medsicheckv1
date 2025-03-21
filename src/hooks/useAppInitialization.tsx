import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {StackActions} from '@react-navigation/native';
import {MutationOptions, useMutation} from '@tanstack/react-query';
import {useEffect} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {navigationRef} from '../../RootNavigation';
import useAuthStore from '../../store/authStore';
import {REMEMBERED_USER_SESSION} from '../constants/AsyncStorageKeys';
import {useSetupUserProfile} from './api/auth';
import useFetchBinahConfig from './useFetchBinahConfig';

const useAppInitialization = (props?: MutationOptions) => {
  const {deeplinkAuth} = useAuthStore();

  const {mutateAsync: setupUserProfile} = useSetupUserProfile();
  const {mutateAsync: getBinahConfig} = useFetchBinahConfig();

  const fetchBinahConfig = async () => {
    if (deeplinkAuth?.token) {
      await getBinahConfig();
    }
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
      const [_, setupUserProfileResult] = await Promise.allSettled([
        fetchBinahConfig(),
        setupUserProfile(),
      ]);
      if (setupUserProfileResult.status === 'fulfilled') {
        const {isAuthenticated} = setupUserProfileResult.value;
        if (!isAuthenticated) {
          await EncryptedStorage.removeItem(REMEMBERED_USER_SESSION);
          navigationRef?.dispatch(StackActions.replace('Login'));
          return {isAuthenticated: false};
        }
        return {isAuthenticated: true};
      }
      return {isAuthenticated: true};
    },
    mutationKey: ['appInitialization'],
    gcTime: 5000,
    ...props,
  });
};

export default useAppInitialization;
