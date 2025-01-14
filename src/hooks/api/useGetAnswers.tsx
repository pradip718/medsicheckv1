/* eslint-disable no-eval */
import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {getAnswers} from '../../api/auth/questions';
import {MEDSI_QUESTIONNAIRE_ANSWERS} from '../../constants/hooks';
import {AnswerSet} from '../../screens/auth/Register/Additional_Information/type';

interface GetQuestionsProps extends UseQueryOptions {
  retrieve_type?: 'all';
}

function isValidExpression(expression: string | undefined): boolean {
  if (!expression) {
    return false;
  }
  try {
    eval(expression);
    return true;
  } catch (error) {
    return false;
  }
}

const useGetAnswers = (props?: GetQuestionsProps) => {
  return useQuery({
    queryKey: [MEDSI_QUESTIONNAIRE_ANSWERS],
    queryFn: async () => {
      const answers = await getAnswers({retrieve_type: props?.retrieve_type});
      const updatedAnswers = {
        ...answers,
        data: answers?.data?.map(answer => ({
          ...answer,
          eng_choices: isValidExpression(answer?.eng_choices)
            ? eval(answer?.eng_choices)
            : answer?.eng_choices,
          spanish_choices: isValidExpression(answer?.spanish_choices)
            ? eval(answer?.spanish_choices)
            : answer?.spanish_choices,
          user_eng_choices: isValidExpression(answer?.user_eng_choices)
            ? eval(answer?.user_eng_choices)
            : answer?.user_eng_choices,
          user_spanish_choices: isValidExpression(answer?.user_spanish_choices)
            ? eval(answer?.user_spanish_choices)
            : answer?.user_spanish_choices,
        })),
      } as AnswerSet;
      return updatedAnswers;
    },
    ...props,
  }) as UseQueryResult<AnswerSet>;
};

export default useGetAnswers;
