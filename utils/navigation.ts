import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigate} from '../RootNavigation';
import {Face_SCANNER_KEY} from '../src/constants/AsyncStorageKeys';
import useUserProfileStore from '../store/profileStore';

export const navigateToFaceScan = async () => {
  let userBasedVisibility = (await AsyncStorage.getItem(
    Face_SCANNER_KEY,
  )) as any;
  const {currentActiveProfileId} = useUserProfileStore.getState();

  if (userBasedVisibility) {
    userBasedVisibility = JSON.parse(userBasedVisibility);
    if (
      userBasedVisibility &&
      currentActiveProfileId &&
      userBasedVisibility[currentActiveProfileId]
    ) {
      navigate('FaceScanCamera', {});
    } else {
      navigate('FaceScan', {});
    }
  } else {
    navigate('FaceScan', {});
  }
};

export const navigateToLogin = async () => {
  navigate('Login', {});
};

export const shouldGoToFaceScan = async () => {
  let userBasedVisibility = (await AsyncStorage.getItem(
    Face_SCANNER_KEY,
  )) as any;
  const {currentActiveProfileId} = useUserProfileStore.getState();

  if (userBasedVisibility) {
    userBasedVisibility = JSON.parse(userBasedVisibility);
    if (
      userBasedVisibility &&
      currentActiveProfileId &&
      userBasedVisibility[currentActiveProfileId]
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
