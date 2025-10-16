import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {ENGLISH_YES, SPANISH_YES} from '../../../constants/enums';
import {MainStackParamList} from '../../../../types/navigation';
import useLanguageStore from '../../../../store/languageStore';
import {isSpanishLocale} from '../../../../utils/methods';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import SymptomCheckerKeyboardAvoidingWrapper from './components/SymptomCheckerKeyboardAvoidingWrapper';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import Icon from '../../../components/Icon';
import SymptomCheckerInput from './components/SymptomCheckerInput';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import {BOLD} from '../../../constants/Fonts';

const checkIsYes = (value: string) => {
  return [ENGLISH_YES.toLowerCase(), SPANISH_YES.toLowerCase(), 'sí'].includes(
    value.toLowerCase(),
  );
};

const SymptomCheckerStartedMedication = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomStartedMedication'>>();
  const languages = useLanguageStore(store => store.languages);

  const questionData = params;
  const isSpanish = isSpanishLocale();

  const {onSubmit, isLoading} = useSymptomChecker();

  const englishChoices = JSON.parse(questionData?.eng_choices || '');
  const spanishChoices = JSON.parse(questionData?.spanish_choices || '');

  const options = isSpanish ? spanishChoices : englishChoices;
  const formattedOptions = options.map((c: unknown) =>
    typeof c === 'string' ? c : Object.keys(c as any)[0],
  );

  const [selectedOption, setSelectedOption] = useState(formattedOptions[0]);
  const [medication, setMedication] = useState('');

  useEffect(() => {
    if (params?.user_eng_choices || params?.user_spanish_choices) {
      const selected =
        params?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
      let parsedAnswer = '';
      try {
        parsedAnswer = JSON.parse(selected);
      } catch (error) {
        console.log(error);
      }

      if (typeof parsedAnswer === 'string') {
        setMedication(parsedAnswer);
      } else {
        setSelectedOption(Object.keys(parsedAnswer)[0]);
        setMedication(Object.values(parsedAnswer)[0] as string);
      }
    }
  }, [params, isSpanish]);

  const onSelectOption = (option: string) => {
    setSelectedOption(option);
    setMedication('');
  };

  const onNext = () => {
    let englishChoice = '',
      spanishChoice = '';
    if (checkIsYes(selectedOption)) {
      englishChoice = JSON.stringify({[ENGLISH_YES]: medication});
      spanishChoice = JSON.stringify({[SPANISH_YES]: medication});
    } else {
      const index = isSpanish
        ? spanishChoices.indexOf(selectedOption)
        : englishChoices.indexOf(selectedOption);
      englishChoice = englishChoices[index];
      spanishChoice = spanishChoices[index];
    }

    onSubmit({
      eng_choices: englishChoice,
      spanish_choices: spanishChoice,
      questionData,
      isFromReportList: params?.isFromReportList || false,
    });
  };

  return (
    <SymptomCheckerKeyboardAvoidingWrapper
      onNext={onNext}
      disabled={
        isLoading ||
        !selectedOption ||
        ([ENGLISH_YES, SPANISH_YES].includes(selectedOption) && !medication)
      }
      isLoading={isLoading}
      questionId={questionData?.q_id}
      scrollHeight={30}>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={questionData} />

        <View className="flex-1 mb-8">
          <View className="flex-row gap-4">
            {formattedOptions.map((option: string, index: number) => {
              const isItemSelected = selectedOption === option;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={`${option}-${index}}`}
                  style={[
                    styles.optionBox,
                    isItemSelected && styles.selectedOptionBox,
                  ]}
                  onPress={() => {
                    onSelectOption(option);
                  }}>
                  <View className="items-end">
                    <Icon
                      name={
                        [ENGLISH_YES, SPANISH_YES].includes(option)
                          ? 'drug-container'
                          : 'shield-plus'
                      }
                      size={38}
                      color={isItemSelected ? '#3A77F5' : '#6B7280'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.option,
                      isItemSelected && styles.selectedOption,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {checkIsYes(selectedOption) && (
            <SymptomCheckerInput
              text={medication}
              onChangeText={setMedication}
              autoFocus={!params?.isEdit}
              maxLength={50}
              placeholder={languages?.medication_placeholder}
            />
          )}
        </View>
      </View>
    </SymptomCheckerKeyboardAvoidingWrapper>
  );
};
export default SymptomCheckerStartedMedication;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
  optionBox: {
    flex: 1,
    height: 164,
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'space-between',
  },
  selectedOptionBox: {
    borderColor: '#1A80D9',
    boxShadow: '0px 0px 0px 6px #1A80D94D',
    backgroundColor: '#D7EEFC',
  },
  option: {
    fontFamily: BOLD,
    fontSize: 18,
    lineHeight: 24,
  },
  selectedOption: {
    color: '#1A80D9',
  },
});
