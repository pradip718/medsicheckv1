import {useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';

import {Keyboard} from 'react-native';

import {
  NavigationProp,
  // StackActions,
  useNavigation,
} from '@react-navigation/native';
import {MainStackParamList} from '../../types/navigation';
import {
  usePostSymptomQuestion,
  useUpdateSymptomQuestion,
} from './api/symptomchecker';
import {SymptomQuestionResponse} from '../../types/api_response';
import {SymptomCheckerParams} from '../../types/symptom';
import {SymptomCodeScreenMapper} from '../../utils/symptom';
import {errorToast} from '../../utils/toast';

interface SubmitProps {
  questionData: SymptomCheckerParams;
  eng_choices: string;
  spanish_choices: string;
}

export default function useSymptomChecker() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();

  const [isUpdating, setIsUpdating] = useState(false);

  const {mutateAsync: postQuestion} = usePostSymptomQuestion();
  const {mutateAsync: updateQuestion} = useUpdateSymptomQuestion();

  const symptomCheckerNavigation = (
    response: SymptomQuestionResponse,
    isEdit?: boolean,
    isFromReportList?: boolean,
  ) => {
    if (response?.is_follow) {
      const questionItem = response?.data?.q_id ? response.data : null;

      if (questionItem?.code) {
        const nextRoute = SymptomCodeScreenMapper[questionItem.code];
        // navigation.dispatch(
        //   StackActions.replace(nextRoute, {...questionItem, isEdit}),
        // );
        return navigation.navigate(nextRoute, {
          ...questionItem,
          isEdit,
          isFromReportList,
        });
      }
      return;
    }

    if (response?.screen === 'review') {
      const nextRoute = SymptomCodeScreenMapper.review;
      return navigation.navigate(nextRoute, {
        data: response.data,
        isFromReportList,
      });
      // return navigation.dispatch(
      //   StackActions.replace(nextRoute, response.data),
      // );
    }

    const questionItem = response?.data?.q_id ? response.data : null;

    queryClient.invalidateQueries({
      queryKey: ['symptom-checker'],
    });

    if (isEdit) {
      return navigation.goBack();
    }

    if (questionItem?.code) {
      const nextRoute = SymptomCodeScreenMapper[questionItem.code];
      // navigation.dispatch(StackActions.replace(nextRoute, questionItem));
      return navigation.navigate(nextRoute, {
        ...questionItem,
        isFromReportList,
      });
    }
  };

  const onSubmit = async ({
    questionData,
    eng_choices,
    spanish_choices,
  }: SubmitProps) => {
    setIsUpdating(true);
    try {
      Keyboard.dismiss();
      const payloadData = {
        eng_choices,
        spanish_choices,
        answer_id: questionData?.answer_id || null,
        q_id: questionData?.q_id || '',
      };
      const res = questionData?.isEdit
        ? await updateQuestion(payloadData)
        : await postQuestion(payloadData);

      symptomCheckerNavigation(res, questionData?.isEdit);
    } catch (error) {
      console.log(error);
      errorToast();
    } finally {
      setIsUpdating(false);
    }
  };
  return {onSubmit, isLoading: isUpdating, symptomCheckerNavigation};
}
