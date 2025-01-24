import {UseMutationOptions, useMutation} from '@tanstack/react-query';
import {postQuestions} from '../../api/auth/questions';
import {
  QuestionnairePostResponse,
  RetrieveType,
  SelectedAnswers,
} from '../../screens/auth/Register/Additional_Information/type';

const usePostQuestions = (
  props?: Omit<
    UseMutationOptions<
      QuestionnairePostResponse,
      Error,
      {
        data: SelectedAnswers[] | null;
        retrieve_type?: RetrieveType;
        question_sequence?: number | null;
        skip?: boolean;
      },
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postQuestions,
    ...props,
  });
};

export default usePostQuestions;
