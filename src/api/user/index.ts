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
import {
  identifyUserAndSetProperties,
  prepareUserProperties,
  setUserProperties,
} from '../../services/analytics';
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

/**
 * Update analytics with admin user properties
 * Identifies user and sets properties for Mixpanel Users tab
 * Runs in background (non-blocking)
 * Works for both new users and admin detail updates
 */
async function updateAnalyticsWithAdminAttributes(): Promise<void> {
  try {
    const {data: members} = await getMembers();
    if (!members || !Array.isArray(members)) {
      return;
    }

    const admin = members.find(member => member?.relation === 'Admin');
    if (!admin) {
      return;
    }

    const adminProfileId = admin.profile_id || admin.user_id;
    if (!adminProfileId) {
      return;
    }

    const adminAttributes = await getFamilyAttributes(adminProfileId);
    if (!adminAttributes) {
      return;
    }

    // Prepare user properties from admin attributes
    const userProperties = prepareUserProperties(
      adminAttributes as Record<string, unknown>,
    );

    // Use user_id for identification (account-level, stays same across profiles)
    // This ensures the user appears in Mixpanel Users tab
    const userId = (adminAttributes as any).user_id;
    if (userId) {
      // Identify user and set properties together
      // This ensures user is properly identified and properties are set in Mixpanel
      identifyUserAndSetProperties(userId, userProperties);

      if (__DEV__) {
        console.log(
          '[Analytics] Identified and updated user properties from admin attributes:',
          {
            userId,
            profileId: userProperties.profile_id,
            hasEmail: !!userProperties.email,
          },
        );
      }
    } else {
      // Fallback: just set properties if user_id not available
      // This shouldn't happen, but handle gracefully
      if (__DEV__) {
        console.warn(
          '[Analytics] No user_id found in admin attributes, only setting properties',
        );
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[Analytics] Failed to fetch admin attributes in background:',
        error,
      );
    }
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

    // Update analytics with admin attributes immediately (blocking for identification)
    // This ensures user is identified before any more events are tracked
    if (response?.data) {
      // Run synchronously to ensure identification happens before returning
      // This is critical so subsequent events use user_id instead of device_id
      await updateAnalyticsWithAdminAttributes();
    }

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
    const responseData = response?.data as PostFamilyAttributesSuccessResponse;
    // Update user properties in analytics after successful save
    if (responseData) {
      const userProperties = prepareUserProperties(payload);
      setUserProperties(userProperties);
    }
    return responseData;
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
