import {UseMutationOptions, useMutation} from '@tanstack/react-query';
import {postQuestions} from '../../api/auth/questions';
import {
  QuestionnairePostResponse,
  SelectedAnswers,
} from '../../screens/auth/Register/Additional_Information/type';

const usePostQuestions = (
  props?: Omit<
    UseMutationOptions<
      QuestionnairePostResponse,
      Error,
      {hasAnswers: boolean; data: SelectedAnswers | null},
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
