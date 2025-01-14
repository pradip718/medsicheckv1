import axiosInstance from '..';
import useAuthStore from '../../../store/authStore';
import useUserProfileStore from '../../../store/profileStore';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import {
  QuestionnairePostResponse,
  QuestionnaireResponse,
  ResponseAnswerSet,
  RetrieveType,
  RetrieveTypeMap,
  SelectedAnswers,
} from '../../screens/auth/Register/Additional_Information/type';
import axiosSessionInstance from '../sessionConfiguration';

async function getQuestions<T extends keyof RetrieveTypeMap | undefined>(
  question_sequence?: number | null,
  retrieve_type?: RetrieveType,
): Promise<QuestionnaireResponse<T>> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const response = await activeAxiosInstance({
    method: 'GET',
    url: `v1/medsi-questionnaire-v2?${
      question_sequence ? `question_sequence=${question_sequence}&` : ''
    }${
      retrieve_type ? `retrieve_type=${retrieve_type}&` : ''
    }lang=${locale}&profile_id=${profile_id}`,
  });

  if (retrieve_type === 'completion_status') {
    return response?.data?.data || {};
  }

  return response?.data?.data?.[0] || {};
}

async function getAnswers({
  retrieve_type,
}: {
  retrieve_type?: 'all';
}): Promise<ResponseAnswerSet> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;
  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/medsi-questionnaire-v2?${
        retrieve_type ? `retrieve_type=${retrieve_type}&` : ''
      }lang=${locale}&user_history=true&profile_id=${profile_id}`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function postQuestions({
  hasAnswers,
  data,
  skip_flag,
  question_sequence,
  retrieve_type,
}: {
  hasAnswers: boolean;
  data: SelectedAnswers | null;
  skip_flag?: boolean;
  question_sequence: number;
  retrieve_type: 'previous' | 'latest';
}): Promise<QuestionnairePostResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    if (retrieve_type === 'previous') {
      const response = await activeAxiosInstance({
        method: 'GET',
        url: `v1/medsi-questionnaire-v2?${
          skip_flag ? 'skip_flag=true&' : ''
        }retrieve_type=${retrieve_type}&question_sequence=${question_sequence}&locale=${locale}&profile_id=${profile_id}`,
      });
      return response?.data?.data?.[0] || {};
    } else {
      const response = await activeAxiosInstance({
        method: hasAnswers ? 'PATCH' : 'POST',
        url: `v1/medsi-questionnaire-v2?${
          skip_flag ? 'skip_flag=true&' : ''
        }retrieve_type=${retrieve_type}&question_sequence=${question_sequence}&locale=${locale}&profile_id=${profile_id}`,
        data: {data: [data]},
      });
      return response?.data?.data?.[0] || {};
    }
  } catch (error) {
    throw error;
  }
}

export {getAnswers, getQuestions, postQuestions};
