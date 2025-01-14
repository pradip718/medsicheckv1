import axiosInstance from '.';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {
  PatchCreateTicket,
  PostCreateCommunication,
  PostCreateCommunicationResponse,
  PostCreateTicket,
  PostCreateTicketResponse,
} from '../../types/helpdesk';
import {
  convertDataWithFilesToFormData,
  getDeviceLocaleInformation,
} from '../../utils/methods';
import axiosSessionInstance from './sessionConfiguration';

async function getHelpdeskDetails(event_type?: string, ticket_id?: string) {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/helpdesk_management?locale=${locale}&profile_id=${profile_id}${
        event_type ? '&event_type=' + event_type : ''
      }${ticket_id ? '&ticket_id=' + ticket_id : ''}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function postCreateTicket(
  payload: PostCreateTicket,
): Promise<PostCreateTicketResponse> {
  const {files, ...restProps} = payload;
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const formData = convertDataWithFilesToFormData(restProps, files);

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/helpdesk_management?locale=${locale}&profile_id=${profile_id}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

async function patchCreateTicket(
  payload: PatchCreateTicket & {ticket_id: string},
): Promise<any> {
  const {files, ticket_id, ...restProps} = payload;
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const formData = convertDataWithFilesToFormData(restProps, files);

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/helpdesk_management?locale=${locale}&profile_id=${profile_id}&ticket_id=${ticket_id}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

async function postCreateCommunication(
  payload: PostCreateCommunication & {
    ticket_id: string;
    event_type: 'communication';
  },
): Promise<PostCreateCommunicationResponse> {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const locale = getDeviceLocaleInformation();
  const {event_type, ticket_id, files, ...restPayload} = payload;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const formData = convertDataWithFilesToFormData(restPayload, files);

  try {
    const response = await activeAxiosInstance({
      method: 'POST',
      url: `v1/helpdesk_management?locale=${locale}&profile_id=${profile_id}${
        event_type ? '&event_type=' + event_type : ''
      }${ticket_id ? '&ticket_id=' + ticket_id : ''}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function deleteTicket(ticket_id: string[]) {
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'DELETE',
      url: `v1/helpdesk_management?profile_id=${profile_id}&ticket_id=${ticket_id}`,
      data: {ticket_id: ticket_id},
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export {
  deleteTicket,
  getHelpdeskDetails,
  patchCreateTicket,
  postCreateCommunication,
  postCreateTicket,
};
