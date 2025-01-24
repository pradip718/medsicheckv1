import _ from 'lodash';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {ParseAndRenderText} from '../../../../../../utils/common';
import {
  getSelectedStyles,
  isSpanishLocale,
} from '../../../../../../utils/methods';
import CustomText from '../../../../../components/Text';
import {Choice, NestedChoice, SelectedAnswers} from '../type';

const getNestedValue = (nestedChoice: NestedChoice, nestedItemKey: string) => {
  const nestedValue = nestedChoice?.[nestedItemKey];
  return _.isArray(nestedValue) ? _.join(nestedValue, ', ') : nestedValue ?? '';
};

export const RenderNestedOption = ({
  nestedItemKey,
  nestedItemValue,
  nestedSpanishItemKey,
  nestedSpanishItemValue,
  selectedAnswers,
  questionId,
  handleSetAnswers,
}: {
  nestedItemKey: string;
  nestedItemValue: string[] | string;
  nestedSpanishItemKey: string;
  nestedSpanishItemValue: string[] | string;
  selectedAnswers: SelectedAnswers[];
  questionId: string;
  handleSelectedAnswers: (answer: {
    questionId: string;
    selectedItem: Choice;
    multiSelect: boolean;
  }) => void;
  handleSetAnswers: (answer: SelectedAnswers[]) => void;
}) => {
  const isSpanish = isSpanishLocale();
  const nestedValues = isSpanish ? nestedSpanishItemValue : nestedItemValue;
  const selectedAnswer = selectedAnswers?.find(
    ans => ans?.question_id === questionId,
  );
  if (
    typeof selectedAnswer?.choice_value === 'string' ||
    typeof selectedAnswer?.spanish_choice_value === 'string'
  ) {
    return;
  }
  const nestedEnglishChoice = selectedAnswer?.choice_value?.find(
    choiceValue =>
      choiceValue !== 'string' && Object.keys(choiceValue)[0] === nestedItemKey,
  ) as NestedChoice;
  const nestedSpanishChoice = selectedAnswer?.spanish_choice_value?.find(
    choiceValue =>
      choiceValue !== 'string' &&
      Object.keys(choiceValue)[0] === nestedSpanishItemKey,
  ) as NestedChoice;

  const onSelectNestedOption = (selectedNestedValueIdx: number) => {
    if (
      (!nestedEnglishChoice &&
        !Array.isArray(nestedEnglishChoice[nestedItemKey])) ||
      (!nestedSpanishChoice &&
        !Array.isArray(nestedSpanishChoice[nestedSpanishItemKey]))
    ) {
      return;
    }

    let updatedNestedEnglishChoice;
    let updatedNestedSpanishChoice;

    if (
      (nestedEnglishChoice[nestedItemKey] as string[])?.includes(
        nestedItemValue[selectedNestedValueIdx],
      ) ||
      (nestedSpanishChoice[nestedSpanishItemKey] as string[])?.includes(
        nestedSpanishItemValue[selectedNestedValueIdx],
      )
    ) {
      updatedNestedEnglishChoice = {
        [nestedItemKey]: (
          nestedEnglishChoice[nestedItemKey] as string[]
        )?.filter(
          (each: string) => each !== nestedItemValue[selectedNestedValueIdx],
        ),
      };
      updatedNestedSpanishChoice = {
        [nestedSpanishItemKey]: (
          nestedSpanishChoice[nestedSpanishItemKey] as string[]
        )?.filter(
          (each: string) =>
            each !== nestedSpanishItemValue[selectedNestedValueIdx],
        ),
      };
    } else {
      updatedNestedEnglishChoice = {
        [nestedItemKey]: [
          // ...nestedEnglishChoice[nestedItemKey],
          nestedItemValue[selectedNestedValueIdx],
        ],
      };
      updatedNestedSpanishChoice = {
        [nestedSpanishItemKey]: [
          // ...nestedSpanishChoice[nestedSpanishItemKey],
          nestedSpanishItemValue[selectedNestedValueIdx],
        ],
      };
    }
    const updatedAnswers = selectedAnswers.map(ans =>
      ans.question_id === questionId
        ? {
            ...ans,
            choice_value:
              typeof ans.choice_value !== 'string'
                ? ans.choice_value.map(choiceValue =>
                    typeof choiceValue !== 'string' &&
                    Object.keys(choiceValue)[0] === nestedItemKey
                      ? updatedNestedEnglishChoice
                      : choiceValue,
                  )
                : ans.choice_value,
            spanish_choice_value:
              typeof ans.spanish_choice_value !== 'string'
                ? ans.spanish_choice_value.map(choiceValue =>
                    typeof choiceValue !== 'string' &&
                    Object.keys(choiceValue)[0] === nestedSpanishItemKey
                      ? updatedNestedSpanishChoice
                      : choiceValue,
                  )
                : ans.spanish_choice_value,
          }
        : ans,
    );

    handleSetAnswers(updatedAnswers);
  };

  const onChangeText = (txt: string) => {
    const updatedAnswers = selectedAnswers.map(ans =>
      ans.question_id === questionId
        ? {
            ...ans,
            choice_value:
              typeof ans.choice_value !== 'string'
                ? ans.choice_value.map(choiceValue =>
                    typeof choiceValue === 'object' &&
                    Object.keys(choiceValue)[0] === nestedItemKey
                      ? {
                          [nestedItemKey]: txt,
                        }
                      : choiceValue,
                  )
                : ans.choice_value,
            spanish_choice_value:
              typeof ans.spanish_choice_value !== 'string'
                ? ans.spanish_choice_value.map(choiceValue =>
                    typeof choiceValue === 'object' &&
                    Object.keys(choiceValue)[0] === nestedSpanishItemKey
                      ? {
                          [nestedSpanishItemKey]: txt,
                        }
                      : choiceValue,
                  )
                : '',
          }
        : ans,
    );
    handleSetAnswers(updatedAnswers);
  };

  if (
    Array.isArray(nestedValues) &&
    ((nestedEnglishChoice &&
      Object.keys(nestedEnglishChoice)[0] === nestedItemKey) ||
      (nestedSpanishChoice &&
        Object.keys(nestedSpanishChoice)[0] === nestedItemKey))
  ) {
    return nestedValues?.map((eachNestedItem, idx) => (
      <TouchableOpacity
        key={eachNestedItem}
        style={getSelectedStyles({
          isSpanish,
          label: eachNestedItem,
          nestedItemKey: isSpanish ? nestedSpanishItemKey : nestedItemKey,
          questionId,
          selectedAnswers,
        })}
        className="my-2 rounded-3xl  shadow-2xl overflow-hidden py-4 px-2"
        onPress={() => onSelectNestedOption(idx)}>
        <CustomText className="text-black text-base font-isidoraSemiBold text-center">
          {ParseAndRenderText(eachNestedItem)}
        </CustomText>
      </TouchableOpacity>
    ));
  }

  if (
    typeof nestedValues === 'string' &&
    ((nestedEnglishChoice &&
      Object.keys(nestedEnglishChoice)[0] === nestedItemKey) ||
      (nestedSpanishChoice &&
        Object.keys(nestedSpanishChoice)[0] === nestedItemKey))
  ) {
    return (
      <TextInput
        mode="outlined"
        textColor="black"
        placeholder={nestedValues}
        value={getNestedValue(
          isSpanish ? nestedSpanishChoice : nestedEnglishChoice,
          isSpanish ? nestedSpanishItemKey : nestedItemKey,
        )}
        className={'mt-4 bg-transparent'}
        onChangeText={onChangeText}
      />
    );
  }
  return <></>;
};
