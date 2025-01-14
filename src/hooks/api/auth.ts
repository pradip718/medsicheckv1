import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import EncryptedStorage from 'react-native-encrypted-storage';
import {navigationRef} from '../../../RootNavigation';
import useUserProfileStore from '../../../store/profileStore';
import {encryptText} from '../../../utils/methods';
import {login} from '../../api/auth';
import {
  LOGIN_ASYNC_KEY,
  REMEMBERED_USER_SESSION,
} from '../../constants/AsyncStorageKeys';
import useGetFamilyMembers from './useGetFamilyMembers';
import useGetUserAttributes from './useGetUserAttributes';
import useGetUserReading from './useGetUserReading';

export const useFetchAndSetProfile = (
  props?: Omit<UseMutationOptions, 'mutationFn'>,
) => {
  const {currentActiveProfileId, setCurrentActiveProfileId} =
    useUserProfileStore();

  const {refetch: getUserReading} = useGetUserReading({enabled: false});
  const {refetch: getFamilyMembers} = useGetFamilyMembers({enabled: false});
  const {refetch: getUserAttributes} = useGetUserAttributes({enabled: false});

  const fetchAndSetProfile = async () => {
    const {data: members, isSuccess} = await getFamilyMembers();
    if (isSuccess) {
      const admin = members?.find(
        eachMember => eachMember?.relation === 'Admin',
      );
      if (!currentActiveProfileId) {
        setCurrentActiveProfileId(admin?.user_id || '');
      }
      await Promise.allSettled([getUserAttributes(), getUserReading()]);
    }
  };

  return useMutation({
    mutationFn: fetchAndSetProfile,
    ...props,
  });
};

export const useSetupUserProfile = (
  props?: Omit<UseMutationOptions, 'mutationFn'>,
) => {
  const {getItem} = useAsyncStorage(LOGIN_ASYNC_KEY);

  const {mutateAsync: fetchAndSetProfile} = useFetchAndSetProfile();

  return useMutation({
    mutationFn: async (): Promise<{isAuthenticated: boolean}> => {
      const isRememberme = await getItem();
      if (isRememberme === 'true' && navigationRef?.isReady()) {
        const session = await EncryptedStorage.getItem(REMEMBERED_USER_SESSION);

        if (session) {
          const userSession = JSON.parse(session);
          const encryptPassword = await encryptText(userSession?.password);
          await login({
            username: userSession.username,
            password: encryptPassword,
          });
          await fetchAndSetProfile();
          return {isAuthenticated: true};
        }
      }
      return {isAuthenticated: false};
    },
    ...props,
  });
};
