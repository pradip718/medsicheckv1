import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Surface} from 'react-native-paper';
import {ParseAndRenderText} from '../../../../../../utils/common';
import {
  getSelectedStyles,
  isSpanishLocale,
} from '../../../../../../utils/methods';
import CustomText from '../../../../../components/Text';
import {Choice, Choices, Question, SelectedAnswers} from '../type';
import {RenderNestedOption} from './RenderNestedOption';

const getNestedObjectByLang = ({
  question,
  index,
}: {
  question: Question | undefined;
  index: number;
}) => {
  return {
    eng_choices: question?.eng_choices[index],
    spanish_choices: question?.spanish_choices[index],
  };
};

export function DropdownQuestion({
  question,
  data,
  questionId,
  questionNumber,
  handleSelectedAnswers,
  // multiSelect,
  selectedAnswers,
  handleSetAnswers,
  currentQuestion,
}: {
  question: string;
  // items: DropdownItem[];
  currentQuestion: Question | undefined;
  data: Choices;
  questionId: string;
  questionNumber: number;
  multiSelect: boolean;
  handleSelectedAnswers: (answer: {
    questionId: string;
    selectedItem: Choice;
    multiSelect: boolean;
  }) => void;
  handleSetAnswers: (answers: SelectedAnswers[]) => void;
  selectedAnswers: SelectedAnswers[];
}) {
  const isSpanish = isSpanishLocale();

  return (
    <View>
      <CustomText className=" font-isidoraSemiBold text-lg">
        {questionNumber}. {ParseAndRenderText(question)}
      </CustomText>
      {/* <KeyboardAwareScrollView> */}
      <Surface
        className="rounded-3xl px-2 shadow-lg border pb-4 mt-4"
        style={styles.dropdownContainer}>
        {data?.map((eachItem, idx) => {
          const {eng_choices, spanish_choices} = getNestedObjectByLang({
            question: currentQuestion,
            index: idx,
          });

          if (typeof eachItem === 'object') {
            if (!eng_choices || !spanish_choices) {
              return <></>;
            }

            const [[nestedItemKey, nestedItemValue]] =
              Object.entries(eng_choices);
            const [[nestedSpanishItemKey, nestedSpanishItemValue]] =
              Object.entries(spanish_choices);

            return (
              <View key={nestedItemKey}>
                <TouchableOpacity
                  style={getSelectedStyles({
                    isSpanish,
                    label: isSpanish ? nestedSpanishItemKey : nestedItemKey,
                    questionId,
                    selectedAnswers,
                  })}
                  className="my-2 rounded-3xl  shadow-2xl py-0 overflow-hidden"
                  onPress={() =>
                    handleSelectedAnswers({
                      selectedItem: {
                        [nestedItemKey]: [],
                        [nestedSpanishItemKey]: [],
                      },
                      multiSelect: currentQuestion?.multi_select || false,
                      questionId,
                    })
                  }>
                  <View className="items-center py-4 px-2">
                    <CustomText className="text-black text-base font-isidoraSemiBold text-center">
                      {ParseAndRenderText(
                        isSpanish ? nestedSpanishItemKey : nestedItemKey,
                      )}
                    </CustomText>
                  </View>
                </TouchableOpacity>
                <View className="px-6">
                  <RenderNestedOption
                    questionId={questionId}
                    nestedItemKey={nestedItemKey}
                    nestedItemValue={nestedItemValue}
                    nestedSpanishItemKey={nestedSpanishItemKey}
                    nestedSpanishItemValue={nestedSpanishItemValue}
                    selectedAnswers={selectedAnswers}
                    handleSelectedAnswers={handleSelectedAnswers}
                    handleSetAnswers={handleSetAnswers}
                  />
                </View>
              </View>
            );
          }
          return (
            <View key={eachItem}>
              <TouchableOpacity
                style={getSelectedStyles({
                  isSpanish,
                  label: eachItem,
                  questionId,
                  selectedAnswers,
                })}
                className="my-2 rounded-3xl  shadow-2xl py-0 overflow-hidden"
                onPress={() =>
                  handleSelectedAnswers({
                    selectedItem: eachItem,
                    questionId,
                    multiSelect: currentQuestion?.multi_select || false,
                  })
                }>
                <View className="items-center py-4 px-2">
                  <CustomText className="text-black text-base font-isidoraSemiBold text-center">
                    {ParseAndRenderText(eachItem)}
                  </CustomText>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </Surface>
      {/* </KeyboardAwareScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  dropdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
});
