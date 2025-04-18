import {Buffer} from 'buffer';
import RNFS from 'react-native-fs';
import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {
  InitiateVoiceScanPayload,
  ProcessVoiceRecordPayload,
  VoiceScanReportDetailPayload,
  VoiceUploadPayload,
} from '../../types/api_payload';
import {
  InitiateVoiceScanResponse,
  ProcessVoiceRecordResponse,
  VoiceScanImageDataResponse,
  VoiceScanReportDetailResponse,
  VoiceUploadResponse,
} from '../../types/api_response';
import {isValidJSON} from '../../utils/methods';
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

async function uploadVoiceRecording(
  payload: VoiceUploadPayload,
): Promise<VoiceUploadResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const base64Data = await RNFS.readFile(payload.audio_file, 'base64');

  const audioData = Buffer.from(base64Data, 'base64');

  const params = new URLSearchParams({
    action: 'upload_recording',
    profile_id: profile_id.toString(),
    session_id: payload?.session_id,
    format: 'm4a',
    duration: payload?.duration.toString(),
  });

  const response = await activeAxiosInstance.post(
    `${TEMPORARY_BASE_URL}v1/voice-scan?${params.toString()}`,
    audioData,
    {
      headers: {
        'Content-Type': 'audio/m4a',
        'Content-Length': audioData.length.toString(),
      },
    },
  );

  return response?.data;
}

async function processVoiceRecording(
  payload: ProcessVoiceRecordPayload,
): Promise<ProcessVoiceRecordResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    action: 'process_recording',
    profile_id: profile_id.toString(),
  });

  const response = await activeAxiosInstance.post(
    `${TEMPORARY_BASE_URL}v1/voice-scan?${params.toString()}`,
    payload,
  );

  return response?.data;
}

async function getVoiceScanReportList() {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    profile_id: profile_id.toString(),
  });

  const response = await activeAxiosInstance({
    method: 'GET',
    url: `v1/voice-report?${params}`,
  });

  return response?.data;
}

async function getVoiceScanReportDetail({
  sessoin_id,
}: VoiceScanReportDetailPayload): Promise<VoiceScanReportDetailResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    profile_id: profile_id.toString(),
  });

  if (sessoin_id) {
    // params.append('sessoin_id', sessoin_id);
    params.append('sessoin_id', 'a6bf1536-e1d2-460e-8a30-3401f69a2b37');
  }

  const response = await activeAxiosInstance({
    method: 'GET',
    url: `v1/voice-report?${params}`,
  });

  if (response?.data && isValidJSON(response?.data)) {
    return JSON.parse(response?.data);
  }

  return response?.data;
}

export {
  getVoiceScanImage,
  getVoiceScanReportDetail,
  getVoiceScanReportList,
  initiateVoiceScanSession,
  processVoiceRecording,
  uploadVoiceRecording,
};
