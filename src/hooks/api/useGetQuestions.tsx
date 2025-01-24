import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {useCallback, useMemo} from 'react';
import {isValidJSON, transformQuestionData} from '../../../utils/methods';
import {getQuestions, getSectionConfiguration} from '../../api/auth/questions';
import {QUESTIONNAIRE_SECTION} from '../../constants/hooks';
import {
  Choices,
  ModifiedQuestionnaireResponse,
  Question,
  QuestionnaireGETReponse,
  QuestionnaireResponse,
  RetrieveType,
  SectionConfigurations,
} from '../../screens/auth/Register/Additional_Information/type';

interface GetQuestionsProps extends UseQueryOptions {}
interface GetQuestionsStatusProps extends UseQueryOptions {
  retrieve_type?: 'completion_status' | 'all';
  questionSequence?: number | null;
}

const getUserChoices = (
  userChoices: string | Choices | null | undefined,
): string | Choices => {
  if (!userChoices) {
    return ''; // Explicitly return null if input is falsy
  }
  if (typeof userChoices === 'string') {
    return isValidJSON(userChoices) ? JSON.parse(userChoices) : userChoices;
  }
  return userChoices; // Return as-is if it's already of type Choices
};

interface UseQuestionnaireOptions {
  question_sequence?: number | null;
  retrieve_type?: RetrieveType;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface UseSectionQuesionnaireOptions {
  question_sequence?: number | null;
  retrieve_type?: RetrieveType;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// const useGetQuestions = (props?: Omit<GetQuestionsProps, 'queryKey'>) => {
//   return useQuery({
//     queryKey: ['questions'],
//     queryFn: async () => {
//       const questions = await getQuestions();
//       console.log('questions', questions);
//       // const modifiedQuestions = {
//       //   ...questions,
//       //   userAnswers: questions?.userAnswers.map(answer => {
//       //     return {
//       //       ...answer,
//       //       eng_choices: isValidJSON(answer?.eng_choices)
//       //         ? JSON.parse(answer?.eng_choices)
//       //         : '',
//       //       spanish_choices: isValidJSON(answer?.spanish_choices)
//       //         ? JSON.parse(answer?.spanish_choices)
//       //         : '',
//       //       ...(answer.user_eng_choices && {
//       //         user_eng_choices: getUserChoices(answer.user_eng_choices),
//       //       }),
//       //       ...(answer.user_spanish_choices && {
//       //         user_spanish_choices: getUserChoices(answer.user_spanish_choices),
//       //       }),
//       //     };
//       //   }),
//       // };

//       // return modifiedQuestions;
//     },
//     ...props,
//   }) as UseQueryResult<ModifiedQuestionnaireResponse>;
// };

interface UseQuestionnaireOptions {
  question_sequence?: number | null;
  retrieve_type?: RetrieveType;
  uniqueKey?: string;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useGetQuestions({
  question_sequence,
  retrieve_type,
  uniqueKey,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  cacheTime = 0,
}: UseQuestionnaireOptions = {}) {
  const queryKey = useMemo(
    () => ['questions', {question_sequence, retrieve_type, uniqueKey}] as const,
    [question_sequence, retrieve_type, uniqueKey],
  );

  const queryFn = useCallback(async () => {
    const response = await getQuestions(question_sequence, retrieve_type);

    return transformQuestionData(response?.data);
  }, [question_sequence, retrieve_type]);

  return useQuery<ModifiedQuestionnaireResponse, Error>({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnMount: true,
  });
}

export default useGetQuestions;

export function useGetQuestionnaireSection({
  enabled = true,
  staleTime = 5 * 60 * 1000,
  cacheTime = 30 * 60 * 1000,
}: UseSectionQuesionnaireOptions = {}) {
  return useQuery<SectionConfigurations, Error>({
    queryKey: [QUESTIONNAIRE_SECTION],
    queryFn: getSectionConfiguration,
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnMount: true,
  });
}

export const useGetQuestionsMutations = (
  props?: Omit<
    UseMutationOptions<Question, Error, {question_sequence: number}, unknown>,
    'mutationFn'
  >,
): UseMutationResult<Question, Error, {question_sequence: number}, unknown> => {
  return useMutation({
    mutationKey: ['questions-mutations'],
    mutationFn: async ({question_sequence}) => {
      let questionsResponse = await getQuestions(question_sequence, 'latest');
      const questions: Question = {
        ...questionsResponse,
        eng_choices: isValidJSON(questionsResponse?.eng_choices)
          ? JSON.parse(questionsResponse?.eng_choices)
          : [],
        spanish_choices: isValidJSON(questionsResponse?.spanish_choices)
          ? JSON.parse(questionsResponse?.spanish_choices)
          : [],
      };
      return questions;
    },
    ...props,
  });
};
