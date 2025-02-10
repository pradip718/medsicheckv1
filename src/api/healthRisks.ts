import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {HealthRisksPayload} from '../../types/api_payload';
import {HealthRisksResponse} from '../../types/api_response';
import {
  PostQuestionnairePayload,
  PostQuestionnaireResponse,
} from '../../types/personalisedai';
import {getDeviceLocaleInformation} from '../../utils/methods';
import axiosSessionInstance from './sessionConfiguration';

async function getHealthRisks({
  risk_type,
}: HealthRisksPayload): Promise<HealthRisksResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();

  const response = await axiosInstance.get(
    `v1/ai_report?locale=${locale}&profile_id=${profile_id}&risk_type=${risk_type}`,
  );

  return response?.data;
}

async function postAIQuestionnaire(
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
      url: `v1/ai_report?locale=${locale}&profile_id=${profile_id}`,
      data: payload?.answer_id ? payload : restPayload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export {getHealthRisks, postAIQuestionnaire};
