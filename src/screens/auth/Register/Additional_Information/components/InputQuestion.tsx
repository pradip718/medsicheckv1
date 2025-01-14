import React from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {ParseAndRenderText} from '../../../../../../utils/common';
import CustomText from '../../../../../components/Text';

export function InputQuestion({
  question,
  questionId,
  questionNumber,
  handleSelectedAnswers,
  value,
}: {
  question: string;
  questionId: string;
  questionNumber: number;
  handleSelectedAnswers: (answer: any) => void;
  value: string;
}) {
  return (
    <View className="h-full">
      <CustomText className=" font-isidoraSemiBold text-lg grow-[0.1]">
        {questionNumber}. {ParseAndRenderText(question)}
      </CustomText>
      <TextInput
        mode="outlined"
        textColor="black"
        value={'' + value ?? ''}
        className="mt-4 bg-transparent"
        onChangeText={txt => {
          handleSelectedAnswers({questionId, answer: txt});
        }}
      />
    </View>
  );
}
