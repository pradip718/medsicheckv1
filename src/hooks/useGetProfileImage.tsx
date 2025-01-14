import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';
import {Asset} from 'react-native-image-picker';
import {STORAGE_KEY} from '../constants/AsyncStorageKeys';
import useGetUserAttributes from './api/useGetUserAttributes';

const useGetProfileImage = (profileId: string) => {
  const {data: userAttributes} = useGetUserAttributes();
  const [avatarSource, setAvatarSource] = useState<Asset>();

  const getUserDetails = useCallback(() => {
    return userAttributes?.profile_id || '';
  }, [userAttributes?.profile_id]);

  useEffect(() => {
    const readProfileData = async () => {
      try {
        const profileStoreData = await AsyncStorage.getItem(STORAGE_KEY);
        if (!profileStoreData) {
          return;
        }
        const profileInfo = JSON.parse(profileStoreData);
        const userId: string = await getUserDetails();
        if (profileInfo && userId) {
          setAvatarSource(profileInfo[profileId]);
        }
      } catch (e) {
        console.log({e});
      }
    };
    readProfileData();
  }, [getUserDetails, userAttributes, profileId]);

  return {avatarSource};
};

export default useGetProfileImage;
