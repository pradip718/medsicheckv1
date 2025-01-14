import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {Questionnaire} from '../../../types/personalisedai';
import {getAIQuestionnaire} from '../../api/personalisedai';
import {GET_PREVENTIX_PERSONALISED_AI} from '../../constants/hooks';

interface GetAIQuestionnaireProps extends UseQueryOptions {
  type: string;
  q_id?: string;
}

const useGetAIQuestionnaire = ({
  type,
  q_id,
  ...restProps
}: Omit<GetAIQuestionnaireProps, 'queryKey'>) => {
  return useQuery({
    queryKey: [GET_PREVENTIX_PERSONALISED_AI],
    queryFn: async () => await getAIQuestionnaire(type, q_id),
    ...restProps,
  }) as UseQueryResult<Questionnaire>;
};

export default useGetAIQuestionnaire;
