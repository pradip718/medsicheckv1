import axiosInstance from '..';
import useAuthStore from '../../../store/authStore';
import useUserProfileStore from '../../../store/profileStore';
import useQuestionStore from '../../../store/questionStore';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import {
  QuestionnairePostResponse,
  QuestionnaireResponse,
  ResponseAnswerSet,
  RetrieveType,
  SectionConfigurations,
  SelectedAnswers,
} from '../../screens/auth/Register/Additional_Information/type';
import axiosSessionInstance from '../sessionConfiguration';

async function getQuestions(
  question_sequence?: number | null,
  retrieve_type?: RetrieveType,
): Promise<QuestionnaireResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const {currentSection} = useQuestionStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    lang: locale,
    profile_id: profile_id.toString(),
  });

  if (question_sequence !== undefined && question_sequence !== null) {
    params.append('question_sequence', question_sequence.toString());
  }

  if (retrieve_type) {
    params.append('retrieve_type', retrieve_type);
  }

  if (currentSection?.section_number) {
    params.append('section_number', currentSection.section_number.toString());
  }

  const response = await activeAxiosInstance.get<QuestionnaireResponse>(
    `v1/medsi-questionnaire-v2?${params.toString()}`,
  );

  return response?.data;
}

async function getSectionConfiguration(): Promise<SectionConfigurations> {
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

  const response = await activeAxiosInstance.get<SectionConfigurations>(
    `v1/medsi-questionnaire-v2?${params.toString()}`,
  );

  return response?.data;
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
  data,
  retrieve_type,
  skip,
  question_sequence,
}: {
  data: SelectedAnswers[] | null;
  retrieve_type?: RetrieveType;
  skip?: boolean;
  question_sequence?: number | null;
}): Promise<QuestionnairePostResponse> {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const {currentSection} = useQuestionStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  const params = new URLSearchParams({
    lang: locale,
    profile_id: profile_id.toString(),
  });

  if (currentSection?.section_number) {
    params.append('section_number', currentSection.section_number.toString());
  }

  if (question_sequence !== undefined && question_sequence !== null) {
    params.append('question_sequence', question_sequence.toString());
  }

  if (retrieve_type) {
    params.append('retrieve_type', retrieve_type);
  }

  if (skip) {
    params.append('skip_flag', skip.toString());
  }

  const response = await activeAxiosInstance.post<QuestionnairePostResponse>(
    `v1/medsi-questionnaire-v2?${params.toString()}`,
    {data},
  );
  return response?.data || {};
}

export {getAnswers, getQuestions, getSectionConfiguration, postQuestions};
