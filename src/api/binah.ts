import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import {BinahErrorMessage} from '../../store/binahConfigStore';
import useUserProfileStore from '../../store/profileStore';
import {CheckAppUpdateResponse} from '../../types/api_response';
import axiosSessionInstance from './sessionConfiguration';

export type BinahConfigResponse = {
  setting_name: string;
  setting_value: string;
  setting_id: string;
};

async function getBinahConfiguration(): Promise<BinahConfigResponse[]> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/face-scan-setting?${
        profile_id ? 'profile_id=' + profile_id : ''
      }&client_name=medsi_check`,
    });
    return response?.data;
  } catch (error) {
    console.warn('getBinahConfiguration error', error);
    throw error;
  }
}

async function checkAppUpdate(token: string): Promise<CheckAppUpdateResponse> {
  try {
    const {deeplinkAuth} = useAuthStore.getState();
    const activeAxiosInstance = deeplinkAuth?.session_id
      ? axiosSessionInstance
      : axiosInstance;

    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/app_config?client_name=medsi_check&device_token=${token}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getBinahErrorMessage(): Promise<BinahErrorMessage[]> {
  try {
    const {deeplinkAuth} = useAuthStore.getState();
    const activeAxiosInstance = deeplinkAuth?.session_id
      ? axiosSessionInstance
      : axiosInstance;

    const response = await activeAxiosInstance({
      method: 'GET',
      url: 'v1/error-msg',
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export {checkAppUpdate, getBinahConfiguration, getBinahErrorMessage};
