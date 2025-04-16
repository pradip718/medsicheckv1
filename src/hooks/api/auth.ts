import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {isEmpty} from 'lodash';
import EncryptedStorage from 'react-native-encrypted-storage';
import useAppStore from '../../../store/appStore';
import useUserProfileStore from '../../../store/profileStore';
import {encryptText} from '../../../utils/methods';
import {login} from '../../api/auth';
import {REMEMBERED_USER_SESSION} from '../../constants/AsyncStorageKeys';
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
      if (!members || isEmpty(members)) {
        return;
      }
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
  const {stayLoggedIn} = useAppStore();
  const {mutateAsync: fetchAndSetProfile} = useFetchAndSetProfile();

  return useMutation({
    mutationFn: async (): Promise<{isAuthenticated: boolean}> => {
      if (stayLoggedIn) {
        const session = await EncryptedStorage.getItem(REMEMBERED_USER_SESSION);
        console.log('session', session);
        if (session) {
          const userSession = JSON.parse(session);
          console.log('userSession', userSession);
          const encryptPassword = await encryptText(userSession?.password);
          console.log('encryptPassword', encryptPassword);
          if (!encryptPassword) {
            return {isAuthenticated: false};
          }
          try {
            await login({
              username: userSession.username,
              password: encryptPassword,
            });
            await fetchAndSetProfile();
            return {isAuthenticated: true};
          } catch (error: any) {
            return {isAuthenticated: false};
          }
        }
      }
      return {isAuthenticated: false};
    },
    ...props,
  });
};
