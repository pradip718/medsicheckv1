import {AxiosError} from 'axios';
import moment from 'moment';
import axiosInstance from '..';
import useAuthStore from '../../../store/authStore';
import useBinahConfigStore from '../../../store/binahConfigStore';
import useUserProfileStore from '../../../store/profileStore';
import {USER_ACTIVITY} from '../../../types/readings';
import {
  Family,
  FeedbackPayload,
  PostFamilyAttributesFailureResponse,
  PostFamilyAttributesSuccessResponse,
  User,
} from '../../../types/users/user';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import axiosSessionInstance from '../sessionConfiguration';

async function getUserAttributes() {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;
  if (!profile_id) {
    return new Error('Profile ID not found');
  }

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/family-member-attributes?profile_id=${profile_id}&locale=${locale}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getMembers() {
  try {
    const locale = getDeviceLocaleInformation();
    const {deeplinkAuth} = useAuthStore.getState();
    const activeAxiosInstance = deeplinkAuth?.session_id
      ? axiosSessionInstance
      : axiosInstance;

    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/get-member-details?locale=${locale}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getFamilyAttributes(profileId: string) {
  try {
    const locale = getDeviceLocaleInformation();
    const {deeplinkAuth} = useAuthStore.getState();
    const activeAxiosInstance = deeplinkAuth?.session_id
      ? axiosSessionInstance
      : axiosInstance;

    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/family-member-attributes?profile_id=${profileId}&locale=${locale}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getRescanConfigurations() {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/rescan?profile_id=${profile_id}&locale=${locale}&client_name=medsi_check`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function postUserAttributes(payload: User) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: payload.user_id ? 'PATCH' : 'POST',
      url: `v1/user-attributes?${
        profile_id ? 'profile_id=' + profile_id : ''
      }&locale=${locale}`,
      data: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function postFamilyAttributes(
  payload: Family,
): Promise<
  PostFamilyAttributesSuccessResponse | PostFamilyAttributesFailureResponse
> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: payload.profile_id ? 'PATCH' : 'POST',
      url: `v1/family-member-attributes?${
        profile_id ? 'profile_id=' + profile_id : ''
      }&locale=${locale}`,
      data: payload,
    });
    return response?.data as PostFamilyAttributesSuccessResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error?.response?.data as PostFamilyAttributesFailureResponse;
    }
    throw error;
  }
}

async function postCaptureUserActivity(payload: {
  user_activity: string;
  includeBinahKey?: boolean;
}) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {user_activity, includeBinahKey = false, ...restPayload} = payload;
  const locale = getDeviceLocaleInformation();
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  let additionalParameter = {};
  if (includeBinahKey) {
    additionalParameter = {
      ...additionalParameter,
      binaah_key: useBinahConfigStore.getState()?.binahConfig?.sdk_value,
    };
  }
  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/capture_user_activity?${
        profile_id ? 'profile_id=' + profile_id : ''
      }&locale=${locale}&activity_type=${user_activity}&
      client_name=medsi_check`,
      data: {
        timestamp: moment().format('YYYY-MM-DD HH:mm'),
        ...additionalParameter,
        ...restPayload,
      },
    });
    return response;
  } catch (error) {
    console.log('error', error);
  }
}

async function postUsersFeedback(payload: FeedbackPayload) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/user_feedback?${
        profile_id ? 'profile_id=' + profile_id : ''
      }&locale=${locale}&
      client_name=medsi_check`,
      data: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function deleteFamilyMembersAttributes(payload: {profile_ids: string[]}) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'DELETE',
      url: `v1/family-member-attributes?profile_id=${profile_id}&locale=${locale}`,
      data: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export const notifyApi = async (
  user_activity: USER_ACTIVITY,
  ...payload: any
) => {
  await postCaptureUserActivity({
    user_activity,
    ...payload,
  });
};

export {
  deleteFamilyMembersAttributes,
  getFamilyAttributes,
  getMembers,
  getRescanConfigurations,
  getUserAttributes,
  postCaptureUserActivity,
  postFamilyAttributes,
  postUserAttributes,
  postUsersFeedback,
};
