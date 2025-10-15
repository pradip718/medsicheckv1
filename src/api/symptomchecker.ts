import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {
  GetSymptomParams,
  SymptomQuestionPayload,
  SymptomQuestionResponse,
} from '../../types/api_response';
import {getDeviceLocaleInformation} from '../../utils/methods';
import axiosSessionInstance from './sessionConfiguration';

export async function getSymptomReport(
  token_id?: string | null,
  page?: number | undefined,
) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/symptom-checker-report-details?${
        token_id ? 'token_id=' + token_id : ''
      }&locale=${locale}&profile_id=${profile_id}${
        page ? '&page_number=' + page + '&page_size=10' : ''
      }`,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
}

export const getSymptomQuestion = async (symptomParams: GetSymptomParams) => {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    lang: locale,
    profile_id: profile_id.toString(),
    ...symptomParams,
  });

  const response = await activeAxiosInstance.get<SymptomQuestionResponse>(
    `v1/symptom-checker?${params.toString()}`,
  );

  return response?.data;
};

export const postSymptomQuestion = async (data: SymptomQuestionPayload) => {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    lang: locale,
    profile_id: profile_id.toString(),
    type: data?.type || 'question',
  });
  if (data?.email_flag) {
    params.append('email_flag', data.email_flag);
  }

  const response = await activeAxiosInstance.post(
    `v1/symptom-checker?${params.toString()}`,
    data,
  );
  return response?.data || {};
};

export const updateSymptomQuestion = async (data: SymptomQuestionPayload) => {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    lang: locale,
    profile_id: profile_id.toString(),
  });

  const response = await activeAxiosInstance.patch(
    `v1/symptom-checker?${params.toString()}`,
    data,
  );
  return response?.data || {};
};

export const postSymptomFileUpload = async (data: FormData) => {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const response = await activeAxiosInstance({
    method: 'POST',
    url: `v1/symptom_checker_file_upload?locale=${locale}&profile_id=${profile_id}`,
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response?.data;
};

export async function deleteSymptomReports(token_id: string[]) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'DELETE',
      url: `v1/symptom-checker-report-details?profile_id=${profile_id}`,
      data: {token_id: token_id},
    });
    return response;
  } catch (error) {
    throw error;
  }
}
