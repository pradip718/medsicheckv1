import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useHealthRiskStore from '../../store/healthRisksStore';
import useUserProfileStore from '../../store/profileStore';
import {HealthRisksPayload} from '../../types/api_payload';
import {HealthRisksResponse} from '../../types/api_response';
import {getDeviceLocaleInformation} from '../../utils/methods';
import {SelectedAnswers} from '../screens/auth/Register/Additional_Information/type';
import axiosSessionInstance from './sessionConfiguration';

async function getHealthRisks({
  risk_type,
}: HealthRisksPayload): Promise<HealthRisksResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();

  const params = new URLSearchParams({
    profile_id: profile_id.toString(),
    engine_name: risk_type,
    locale,
  });

  const response = await axiosInstance.get(
    `v1/risk-engine?${params.toString()}`,
  );

  return response?.data;
}

async function postHealthRisksQuestions({
  data,
}: {
  data: SelectedAnswers[] | null;
}): Promise<HealthRisksResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const {engine_name} = useHealthRiskStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    lang: locale,
    profile_id: profile_id.toString(),
  });

  if (engine_name) {
    params.append('engine_name', engine_name.toString());
  }

  const response = await activeAxiosInstance.post<HealthRisksResponse>(
    `v1/risk-engine?${params.toString()}`,
    {data: data?.[0]},
  );
  return response?.data || {};
}

async function executeRiskEngine({
  risk_type,
}: HealthRisksPayload): Promise<HealthRisksResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();

  const params = new URLSearchParams({
    profile_id: profile_id.toString(),
    engine_name: risk_type,
    locale,
  });

  const response = await axiosInstance.get<HealthRisksResponse>(
    `v1/execute-risk-engine?${params.toString()}`,
  );

  return response?.data;
}

export {executeRiskEngine, getHealthRisks, postHealthRisksQuestions};
