import React, {useEffect, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {ValidationType} from '../../../../types/personalisedai';
import EtchedGlass from '../../../components/EtchedGlass';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

interface RenderTextInputProps {
  handleSelectedAnswers: (answers: string) => void;
  selectedAnswers: any;
  validations: ValidationType;
}

const TextBoxSize = {
  small: '40',
  medium: '100',
  large: '150',
};

const RenderTextInput = ({
  selectedAnswers,
  handleSelectedAnswers,
  validations,
}: RenderTextInputProps) => {
  const {languages} = useLanguageStore();
  const [localText, setLocalText] = useState(selectedAnswers);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    setLocalText(selectedAnswers);
  }, [selectedAnswers]);

  const onChangeText = (text: string) => {
    setLocalText(text);
    if (
      (validations?.max && Number(text) > Number(validations.max)) ||
      (validations?.min && Number(text) < Number(validations.min))
    ) {
      handleSelectedAnswers('');
      return setErrorText(languages?.input_validations);
    }

    setErrorText('');
    return handleSelectedAnswers(text);
  };

  return (
    <View style={styles.container} className="flex-1 h-full justify-center">
      <EtchedGlass
        className="mx-10 p-0"
        cardContentContainerClassName="p-0"
        cardContentClassName="p-0">
        <TextInput
          value={'' + localText}
          placeholder={languages?.text_input_placeholder}
          placeholderTextColor="#8BA2FF"
          onChangeText={onChangeText}
          style={styles.borderHighlightedColor}
          multiline
          keyboardType={validations?.type ? validations?.type : 'default'}
          className={`h-[${TextBoxSize[validations?.size]}]  text-black w-full`}
        />
      </EtchedGlass>
      <View className="items-end w-[80%]">
        {!!validations?.min && (
          <CustomText className="font-isidoraSemiBold text-gray-400 text-sm">
            {languages?.minimum_character}: {validations?.min}
          </CustomText>
        )}
        {!!validations?.max && (
          <CustomText className="font-isidoraSemiBold text-gray-400 text-sm">
            {languages?.maxmimum_character}: {validations?.max}
          </CustomText>
        )}
      </View>
      <View>
        <CustomText className="text-red-400 font-isidoraMedium text-base">
          {errorText}
        </CustomText>
      </View>
    </View>
  );
};

export default RenderTextInput;

const styles = StyleSheet.create({
  container: {},
  borderHighlightedColor: {
    // borderWidth: 1,
    // minWidth: 175,
    // width: '80%',
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    textAlignVertical: 'top',
    padding: 10,
    color: customColor.black,
    outlineStyle: 'none',
  },
});
