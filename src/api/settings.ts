import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {ValidateWhatsappOTP} from '../../types/api_response';
import {
  GetUserPreferenceResponse,
  PostUserPreferencePayload,
  PostUserPreferenceResponse,
} from '../../types/settings';
import {getDeviceLocaleInformation} from '../../utils/methods';
import axiosSessionInstance from './sessionConfiguration';

async function sendDeepLinkClickEvent(comm_id: string): Promise<any> {
  const locale = getDeviceLocaleInformation();

  const params = new URLSearchParams({
    comm_id,
    locale,
  });

  const response = await axiosInstance({
    method: 'POST',
    url: `v1/click_event?${params}`,
  });
  return response?.data;
}

async function getUserPreference(): Promise<GetUserPreferenceResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/user-preference?locale=${locale}&profile_id=${profile_id}`,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function submitUserPreferences(
  payload: PostUserPreferencePayload,
): Promise<PostUserPreferenceResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  try {
    const response = await axiosInstance({
      method: payload?.preference_id ? 'PATCH' : 'POST',
      url: `v1/user-preference?locale=${locale}&profile_id=${profile_id}`,
      data: payload,
    });

    return response?.data;
  } catch (error: any) {
    if (error?.response?.data) {
      throw error?.response?.data;
    }
    throw error;
  }
}

async function sendOTPInWhatsapp(): Promise<any> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;
  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/whatsapp-verification?locale=${locale}&profile_id=${profile_id}&type=send_otp`,
    });

    return response?.data;
  } catch (error: any) {
    throw error;
  }
}

async function validateOTPForWhatsapp(
  payload: ValidateWhatsappOTP,
): Promise<any> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/whatsapp-verification?locale=${locale}&profile_id=${profile_id}&type=validate_otp`,
      data: payload,
    });

    return response?.data;
  } catch (error: any) {
    throw error;
  }
}

export {
  getUserPreference,
  sendDeepLinkClickEvent,
  sendOTPInWhatsapp,
  submitUserPreferences,
  validateOTPForWhatsapp,
};
