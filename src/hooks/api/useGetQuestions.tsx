import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {isValidJSON} from '../../../utils/methods';
import {getQuestions} from '../../api/auth/questions';
import {
  Question,
  QuestionStatus,
} from '../../screens/auth/Register/Additional_Information/type';

interface GetQuestionsProps extends UseQueryOptions {}
interface GetQuestionsStatusProps extends UseQueryOptions {
  retrieve_type?: 'completion_status' | 'all';
  questionSequence?: number | null;
}

const useGetQuestions = (props?: Omit<GetQuestionsProps, 'queryKey'>) => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      let questions = await getQuestions();
      questions = {
        ...questions,
        eng_choices: isValidJSON(questions?.eng_choices)
          ? JSON.parse(questions?.eng_choices)
          : [],
        spanish_choices: isValidJSON(questions?.spanish_choices)
          ? JSON.parse(questions?.spanish_choices)
          : [],
      };
      return questions;
    },
    ...props,
  }) as UseQueryResult<Question>;
};

export default useGetQuestions;

export const useCheckQuestinnaireStatus = (
  props: Omit<GetQuestionsStatusProps, 'queryKey'>,
) => {
  const {questionSequence, retrieve_type} = props;
  return useQuery({
    queryKey: ['questions-status'],
    queryFn: async () => {
      let status = await getQuestions(questionSequence, retrieve_type);
      return status;
    },
    ...props,
  }) as UseQueryResult<QuestionStatus>;
};

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
