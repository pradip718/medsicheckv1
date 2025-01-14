import {UseMutationOptions, useMutation} from '@tanstack/react-query';
import {PostQuestionnairePayload} from '../../../types/personalisedai';
import {postAIQuestionnaire} from '../../api/personalisedai';

const usePostAIQuestionnaire = (
  props?: Omit<
    UseMutationOptions<any, Error, PostQuestionnairePayload, unknown>,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postAIQuestionnaire,
    ...props,
  });
};

export default usePostAIQuestionnaire;
