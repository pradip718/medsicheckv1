import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {QuestionnaireItem, ValidationType} from '../../../types/personalisedai';
import {ParseAndRenderText} from '../../../utils/common';
import CustomText from '../../components/Text';
import {QuestionType} from '../../constants/enums';
import useGetDeviceLocale from '../../hooks/useGetDeviceLocale';
import RenderFileUpload from './components/RenderFileUpload';
import RenderSelect from './components/RenderSelect';
import RenderTextInput from './components/RenderTextInput';

const Question = ({
  question,
  details,
}: {
  question: string;
  details: QuestionnaireItem;
}) => {
  return (
    <View className="items-center px-10">
      <CustomText className="text-lg text-black font-isidoraSemiBold text-center">
        {ParseAndRenderText(question)}
      </CustomText>
      {!!details?.linked_image && (
        <View className="items-center my-2">
          <Image
            source={{uri: details?.linked_image}}
            className="w-[197px] h-[167px]"
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const Answer = ({
  details,
  handleSelectedAnswers,
  selectedAnswers,
}: {
  details: QuestionnaireItem;
  handleSelectedAnswers: (
    answers:
      | string
      | {
          type: string;
          file: DocumentPickerResponse;
        },
  ) => void;
  selectedAnswers: any;
}) => {
  const {isEnglish} = useGetDeviceLocale();
  switch (details?.question_type) {
    case QuestionType.SingleSelect:
    case QuestionType.MultiSelect:
      const items = JSON.parse(
        (isEnglish ? details?.eng_choices : details?.spanish_choices) || '',
      );
      return (
        <RenderSelect
          items={items}
          isMultiSelect={details?.question_type === 'multi-select'}
          handleSelectedAnswers={handleSelectedAnswers}
          selectedAnswers={selectedAnswers}
          validations={details?.validation as ValidationType}
        />
      );

    case QuestionType.Text:
      return (
        <RenderTextInput
          handleSelectedAnswers={handleSelectedAnswers}
          selectedAnswers={selectedAnswers}
          validations={(details?.validation as ValidationType) || {}}
        />
      );

    case QuestionType.FileUpload:
      return (
        <RenderFileUpload
          handleSelectedAnswers={handleSelectedAnswers}
          selectedAnswers={selectedAnswers}
          validations={(details?.validation as ValidationType) || {}}
        />
      );

    default:
      return <></>;
  }
};

interface QuestionAnswerProps {
  details: QuestionnaireItem | undefined;
  selectedAnswers: any;
  handleSelectedAnswers: (
    answers:
      | string
      | {
          type: string;
          file: DocumentPickerResponse;
        },
  ) => void;
}

const QuestionAnswer = ({
  details,
  selectedAnswers,
  handleSelectedAnswers,
}: QuestionAnswerProps) => {
  const {isEnglish} = useGetDeviceLocale();
  if (!details) {
    return;
  }
  return (
    <View className="flex-grow " style={styles.container}>
      <Question
        question={isEnglish ? details?.eng_question : details?.spanish_question}
        details={details}
      />

      <Answer
        details={details}
        selectedAnswers={selectedAnswers}
        handleSelectedAnswers={handleSelectedAnswers}
      />

      <View />
    </View>
  );
};

export default QuestionAnswer;

const styles = StyleSheet.create({
  container: {},
  btnStyle: {
    backgroundColor: 'rgba(239, 130, 179, 1)',
  },
});
