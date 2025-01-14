import {isArray, isString} from 'lodash';
import {View} from 'moti';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../../store/languageStore';
import {ParseAndRenderText} from '../../../../../utils/common';
import {isSpanishLocale} from '../../../../../utils/methods';
import BackgroundImage from '../../../../components/BackgroundImage';
import Icon from '../../../../components/Icon';
import Navbar from '../../../../components/Navbar';
import {QuestionnaireSkeleton} from '../../../../components/Skeleton';
import CustomText from '../../../../components/Text';
import {MEDSI_QUESTIONNAIRE_ANSWERS_SUMMARY} from '../../../../constants/hooks';
import useGetAnswers from '../../../../hooks/api/useGetAnswers';
import customColor from '../../../../theme/customColor';
import {AnswerSet, AnswerSetData, Question, SelectedAnswers} from './type';

type QuestionnaireSummaryProps = {
  changeCurrentQuestion: (question: Question) => void;
  onChangeEditing: (editing: boolean) => void;
  onUpdateSelectedAnswers: (answer: SelectedAnswers) => void;
};

const QuestionnaireSummary = ({
  changeCurrentQuestion,
  onChangeEditing,
  onUpdateSelectedAnswers,
}: QuestionnaireSummaryProps) => {
  const isSpanish = isSpanishLocale();
  const {languages} = useLanguageStore();

  const {data: answers, isLoading: isSummaryLoading} = useGetAnswers({
    queryKey: [MEDSI_QUESTIONNAIRE_ANSWERS_SUMMARY],
    retrieve_type: 'all',
  });

  const onEditQuestion = async (question: AnswerSetData) => {
    changeCurrentQuestion(question);

    onUpdateSelectedAnswers({
      question_id: question.q_id,
      answer_id: question?.answer_id,
      choice_value: question?.skip_flag ? '' : question?.user_eng_choices,
      spanish_choice_value: question?.skip_flag
        ? ''
        : question?.user_spanish_choices,
    });
    onChangeEditing(false);
  };

  const renderAnswer = (answer: AnswerSetData) => {
    if (answer?.skip_flag) {
      return (
        <Text className="text-base italic text-slate-400">
          {languages?.not_answered}
        </Text>
      );
    }
    if (answer?.question_type === 'textbox') {
      return (
        <CustomText className="text-base font-isidoraMedium">
          {isSpanish ? answer?.user_spanish_choices : answer?.user_eng_choices}
        </CustomText>
      );
    }

    if (answer?.question_type === 'dropdown') {
      const answerBasedOnLanguage = isSpanish
        ? answer?.user_spanish_choices
        : answer?.user_eng_choices;
      if (!isArray(answerBasedOnLanguage)) {
        return (
          <CustomText className="text-base font-isidoraMedium">
            {answerBasedOnLanguage}
          </CustomText>
        );
      }
      return answerBasedOnLanguage?.map((ans, index) => (
        <CustomText
          key={`${ans}-${index}`}
          className="text-base font-isidoraMedium mr-2">
          {isString(ans)
            ? ParseAndRenderText(ans)
            : `${Object.keys(ans)[0]}: ${Object.values(ans)[0]}`}
        </CustomText>
      ));
    }
  };

  if (isSummaryLoading) {
    return (
      <SafeAreaView className="h-full">
        <View className="p-4">
          <Navbar />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.contentContainer}>
          <QuestionnaireSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <BackgroundImage className="flex-1 py-4">
      <SafeAreaView className="h-full">
        <View className="px-4">
          <Navbar />
        </View>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          {answers?.data?.map((answer, index) => (
            <View
              key={`${answer?.answer_id}-${index}`}
              className={twMerge(
                'flex-grow mt-8 border-b border-b-lightGrey pb-4 px-4',
                index === answers?.data?.length - 1 ? 'border-b-0' : '',
              )}>
              <CustomText className="text-lg font-isidoraMedium">
                {answer?.question_sequence}
                {'. '}
                {ParseAndRenderText(
                  isSpanish ? answer?.spanish_question : answer?.eng_question,
                )}
              </CustomText>

              <View className="flex-row mt-4 items-center">
                <TouchableOpacity
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  className="mr-2"
                  onPress={() => {
                    onEditQuestion(answer);
                  }}>
                  <Icon
                    name="edit"
                    color={customColor.ultramarineBlue}
                    size={16}
                  />
                </TouchableOpacity>
                <View>{renderAnswer(answer)}</View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default QuestionnaireSummary;

const styles = StyleSheet.create({
  contentContainer: {alignItems: 'center'},
});
