import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {OtherOption, ValidationType} from '../../../../types/personalisedai';
import {errorToast} from '../../../../utils/toast';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {
  ENGLISH_NONE_OF_THE_ABOVE,
  ENGLISH_OTHER,
  SPANISH_NONE_OF_THE_ABOVE,
  SPANISH_OTHER,
} from '../../../constants/enums';
import useGetDeviceLocale from '../../../hooks/useGetDeviceLocale';
import customColor from '../../../theme/customColor';

interface RenderSelectProps {
  items: string[];
  handleSelectedAnswers: (answers: any) => void;
  selectedAnswers: any;
  isMultiSelect: boolean;
  validations: ValidationType;
}

const RenderSelect = ({
  items,
  isMultiSelect,
  handleSelectedAnswers,
  selectedAnswers,
  validations,
}: RenderSelectProps) => {
  const {languages} = useLanguageStore();
  const {isEnglish} = useGetDeviceLocale();

  if (!items) {
    return;
  }

  const getMultiSelectedOptions = (item: string) => {
    const isNoneOfTheAbove =
      item === SPANISH_NONE_OF_THE_ABOVE || item === ENGLISH_NONE_OF_THE_ABOVE;

    // Handle None of the Above
    if (isNoneOfTheAbove) {
      return item;
    }

    // Handle item removal
    if (selectedAnswers.includes(item)) {
      return selectedAnswers.filter((answer: string) => answer !== item);
    }

    // Check for maximum selections
    if (selectedAnswers?.length >= Number(validations?.max)) {
      errorToast(languages?.questionnaire_option_validation_max);
      return selectedAnswers;
    }

    // Add new item to selections
    return [...selectedAnswers, item];
  };

  const onSelectOption = (selectedItem: string) => {
    if (!isMultiSelect) {
      return handleSelectedAnswers([selectedItem]);
    }
    const updatedItems = getMultiSelectedOptions(selectedItem);
    handleSelectedAnswers(updatedItems);
  };

  const isItemSelected = (item: string | OtherOption) => {
    if (typeof selectedAnswers === 'number') {
      return false;
    }
    if (typeof item === 'string') {
      return (
        selectedAnswers?.includes(item) ||
        (Array.isArray(selectedAnswers) &&
          selectedAnswers?.some(
            (eachAns: string | OtherOption) =>
              typeof eachAns !== 'string' && eachAns?.name === item,
          ))
      );
    }
    return true;
  };

  const onChangeOthersTextInput = (txt: string) => {
    const ans = selectedAnswers?.map((eachItm: any) => {
      if (
        eachItm === ENGLISH_OTHER ||
        eachItm === SPANISH_OTHER ||
        eachItm?.name?.includes(ENGLISH_OTHER) ||
        eachItm?.name?.includes(SPANISH_OTHER)
      ) {
        return {
          name: isEnglish ? ENGLISH_OTHER : SPANISH_OTHER,
          text: txt,
        };
      }
      return eachItm;
    });
    handleSelectedAnswers(ans);
  };

  const hasOther = () => {
    if (!selectedAnswers || !Array.isArray(selectedAnswers)) {
      return false;
    }
    return selectedAnswers?.some((itm: any) => {
      if (itm?.name) {
        return (
          itm?.name?.includes(ENGLISH_OTHER) ||
          itm?.name?.includes(SPANISH_OTHER)
        );
      }
      return itm?.includes(ENGLISH_OTHER) || itm?.includes(SPANISH_OTHER);
    });
  };

  const otherTexts =
    (Array.isArray(selectedAnswers) &&
      selectedAnswers?.find(eachItm => eachItm?.text)?.text) ||
    '';

  return (
    <View className="items-center flex-grow justify-center">
      {items?.map((eachItem, idx) => (
        <RoundedButton
          key={`${eachItem}-${idx}}`}
          resetStyle
          style={styles(isItemSelected(eachItem))?.btnStyle}
          className="py-2 min-w-[182px] mt-4 px-2"
          onPress={() => {
            onSelectOption(eachItem);
          }}>
          <CustomText className="font-isidoraSemiBold text-lg text-center text-black">
            {eachItem}
          </CustomText>
        </RoundedButton>
      ))}

      {hasOther() && (
        <TextInput
          value={otherTexts}
          onChangeText={onChangeOthersTextInput}
          style={styles().borderHighlightedColor}
          multiline
          keyboardType={validations?.type ? validations?.type : 'default'}
          className={`my-4  text-black ${
            validations?.type && validations?.type !== 'default'
              ? ''
              : 'min-h-[10%] max-h-[80%]'
          }
        `}
          maxLength={validations?.max ? Number(validations?.max) : undefined}
        />
      )}
    </View>
  );
};

export default RenderSelect;

const styles = (isSelected?: boolean) =>
  StyleSheet.create({
    btnStyle: {
      backgroundColor: isSelected ? '#D8E0FF' : 'transparent',
      borderWidth: 1,
      borderColor: '#D8E0FF',
    },
    borderHighlightedColor: {
      borderWidth: 1,
      // minWidth: 175,
      width: '80%',
      borderRadius: 10,
      borderColor: 'rgba(0, 0, 0, 0.25)',
      textAlignVertical: 'top',
      padding: 10,
      color: customColor.black,
    },
  });
