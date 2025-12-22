import axios from 'axios';
import axiosInstance from '..';
import useAuthStore from '../../../store/authStore';
import useLanguageStore from '../../../store/languageStore';
import useUserProfileStore from '../../../store/profileStore';
import {MiscellanousFilesResponse} from '../../../types/api_response';
import {SCAN_SESSION_STATUS} from '../../../types/readings';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import axiosSessionInstance from '../sessionConfiguration';

async function getReportReading(page?: number, reading_id?: string) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/health-report?locale=${locale}&profile_id=${profile_id}${
        page ? '&page_number=' + page + '&page_size=10' : ''
      }${reading_id ? '&reading_id=' + reading_id : ''}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getReportReadingById(readingId: string) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    if (!readingId) {
      return Promise.reject(
        useLanguageStore.getState().languages?.generic_error_message,
      );
    }
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/health-report?locale=${locale}&profile_id=${profile_id}&reading_id=${readingId}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getAIReportList(
  token?: string | null,
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
      url: `v1/ai_report_details?${
        token ? 'token_id=' + token : ''
      }&locale=${locale}&profile_id=${profile_id}${
        page ? '&page_number=' + page + '&page_size=10' : ''
      }`,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getLabReportList(
  token?: string | null,
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
      url: `v1/lab_report_details?${
        token ? 'token_id=' + token : ''
      }&locale=${locale}&profile_id=${profile_id}${
        page ? '&page_number=' + page + '&page_size=10' : ''
      }`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getMiscellanousFileDetails(
  page?: number,
): Promise<MiscellanousFilesResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;
  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/miscellanous_file_details?&locale=${locale}&profile_id=${profile_id}${
        page ? '&page_number=' + page + '&page_size=10' : ''
      }`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function preReading(params?: {
  longitude?: number;
  latitude?: number;
  altitude?: number;
}) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const queryParams = new URLSearchParams({
      locale,
      profile_id: profile_id.toString(),
    });

    if (params?.longitude !== undefined) {
      queryParams.append('longitude', params.longitude.toString());
    }
    if (params?.latitude !== undefined) {
      queryParams.append('latitude', params.latitude.toString());
    }
    if (params?.altitude !== undefined) {
      queryParams.append('altitude', params.altitude.toString());
    }

    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/health-pre-reading?${queryParams.toString()}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function syncScanSession(
  status: SCAN_SESSION_STATUS,
  payload?: any,
): Promise<any> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  const session_id = useAuthStore.getState().deeplinkAuth?.session_id || '';
  const activeAxiosInstance = session_id ? axiosSessionInstance : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: status === 'ongoing_session' ? 'GET' : 'PATCH',
      url: `v1/scan-session?locale=${locale}&profile_id=${profile_id}${
        session_id ? '&session_id=' + session_id : ''
      }&status=${status}`,
      data: payload,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function syncWebScan(
  status: SCAN_SESSION_STATUS,
  readingId: string,
  payload?: any,
): Promise<any> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  try {
    const response = await axiosInstance({
      method: status === 'ongoing_session' ? 'GET' : 'PATCH',
      url: `v1/scan-session?&locale=${locale}&profile_id=${profile_id}${
        readingId ? '&session_id=' + readingId : ''
      }&status=${status}`,
      data: payload,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function postReading({payload}: any) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;
  const {geo_location} = payload;

  const params = new URLSearchParams({
    locale: locale,
    profile_id: profile_id.toString(),
  });

  if (geo_location?.longitude) {
    params.append('longitude', geo_location.longitude.toString());
  }
  if (geo_location?.latitude) {
    params.append('latitude', geo_location.latitude.toString());
  }
  if (geo_location?.altitude) {
    params.append('altitude', geo_location.altitude.toString());
  }

  const response = await activeAxiosInstance.post(
    `v1/health-report?${params}`,
    payload,
  );

  return response?.data;
}

/**
 * Gets a presigned URL for uploading user scan image
 * @param reading_id - The reading ID
 * @param isZip - Whether the file is a zip file
 * @returns Response containing presigned URL with upload_url field
 */
async function getUserScanImagePresignedUrl(
  reading_id: string,
  isZip: boolean = false,
): Promise<{upload_url: string}> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    // Determine content type based on file type
    const contentType = isZip ? 'application/zip' : 'image/jpeg';

    const response = await activeAxiosInstance({
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      url: `v1/user_scan_image?reading_id=${reading_id}&locale=${locale}&profile_id=${profile_id}`,
      data: {}, // Empty data to get presigned URL
    });

    return response?.data;
  } catch (error) {
    console.log('error getting presigned URL', error);
    throw error;
  }
}

/**
 * Uploads binary data to a presigned URL using PUT request
 * @param uploadUrl - The presigned URL to upload to
 * @param binaryData - The binary data (Buffer) to upload
 * @param contentType - The content type (e.g., 'application/zip' or 'image/jpeg')
 * @returns Response from the upload
 */
async function uploadToPresignedUrl(
  uploadUrl: string,
  binaryData: Buffer,
  contentType: string = 'application/zip',
): Promise<any> {
  try {
    // Use axios directly without interceptors for presigned URL
    // Presigned URLs already contain authentication in the URL
    const response = await axios.put(uploadUrl, binaryData, {
      headers: {
        'Content-Type': contentType,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response;
  } catch (error) {
    console.log('error uploading to presigned URL', error);
    throw error;
  }
}

async function captureUserImage(payload: any) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    console.log('payload', payload);
    // Determine content type based on payload type
    // If payload.isZip is true, use application/zip, otherwise use image/jpeg
    const contentType = payload?.isZip ? 'application/zip' : 'image/jpeg';

    const response = await activeAxiosInstance({
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      url: `v1/user_scan_image?reading_id=${payload?.reading_id}&locale=${locale}&profile_id=${profile_id}`,
      data: payload?.data,
    });

    return response?.data;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

async function deleteReports(payload: {reading_id: string[]}) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'DELETE',
      url: `v1/health-report?profile_id=${profile_id}`,
      data: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function deletePersonalisedAIReports(token_id: string[]) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'DELETE',
      url: `v1/ai_report_details?profile_id=${profile_id}`,
      data: {token_id: token_id},
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export {
  captureUserImage,
  deletePersonalisedAIReports,
  deleteReports,
  getAIReportList,
  getLabReportList,
  getMiscellanousFileDetails,
  getReportReading,
  getReportReadingById,
  getUserScanImagePresignedUrl,
  postReading,
  preReading,
  syncScanSession,
  uploadToPresignedUrl,
};
