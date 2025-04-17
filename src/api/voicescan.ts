import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {InitiateVoiceScanPayload} from '../../types/api_payload';
import {
  InitiateVoiceScanResponse,
  VoiceScanImageDataResponse,
} from '../../types/api_response';
import axiosSessionInstance from './sessionConfiguration';

const TEMPORARY_BASE_URL =
  'https://nb9c8cq7nk.execute-api.us-west-2.amazonaws.com/dev/';

async function getVoiceScanImage(): Promise<VoiceScanImageDataResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    action: 'get_image',
    profile_id: profile_id.toString(),
  });

  const response = await activeAxiosInstance({
    method: 'POST',
    url: `${TEMPORARY_BASE_URL}v1/voice-scan?${params.toString()}`,
  });

  return response?.data;
}

async function initiateVoiceScanSession({
  image_id,
}: InitiateVoiceScanPayload): Promise<InitiateVoiceScanResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    action: 'initiate',
    profile_id: profile_id.toString(),
  });

  const response = await activeAxiosInstance({
    method: 'POST',
    url: `${TEMPORARY_BASE_URL}v1/voice-scan?${params.toString()}`,
    data: {
      image_id,
    },
  });

  return response?.data;
}

export {getVoiceScanImage, initiateVoiceScanSession};
