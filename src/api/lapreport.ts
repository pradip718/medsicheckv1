import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {LabReportFileUploadJsonResponse} from '../../types/jsons';
import {
  PostQuestionnairePayload,
  PostQuestionnaireResponse,
} from '../../types/personalisedai';
// import {isAndroid} from '../../../utils';
import {getDeviceLocaleInformation} from '../../utils/methods';
import axiosSessionInstance from './sessionConfiguration';

async function getLabReportQuestionnaire(type: string, q_id?: string) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/lab_report?locale=${locale}&type=${type}&profile_id=${profile_id}${
        q_id ? '&q_id=' + q_id : ''
      }`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function postLabReportFileUpload(
  payload: any,
): Promise<LabReportFileUploadJsonResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf',
      },
      url: `v1/lab_report_file_upload?locale=${locale}&profile_id=${profile_id}`,
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function postLabReportQuestionnaire(
  payload: PostQuestionnairePayload,
): Promise<PostQuestionnaireResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  const {answer_id, ...restPayload} = payload;
  console.log({answer_id});
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/lab_report?locale=${locale}&profile_id=${profile_id}`,
      data: payload?.answer_id ? payload : restPayload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function deleteLabReport(token_id: string[]) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;
  try {
    const response = await activeAxiosInstance({
      method: 'DELETE',
      url: `v1/lab_report_details?profile_id=${profile_id}`,
      data: {token_id: token_id},
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export {
  deleteLabReport,
  getLabReportQuestionnaire,
  postLabReportFileUpload,
  postLabReportQuestionnaire,
};
