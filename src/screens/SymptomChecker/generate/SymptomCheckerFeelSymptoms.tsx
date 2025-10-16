import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {RouteProp, useRoute} from '@react-navigation/native';
import {MainStackParamList} from '../../../../types/navigation';
import {isSpanishLocale} from '../../../../utils/methods';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import {ENGLISH_OTHER, SPANISH_OTHER} from '../../../constants/enums';
import SymptomCheckerKeyboardAvoidingWrapper from './components/SymptomCheckerKeyboardAvoidingWrapper';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import SymptomCheckerInput from './components/SymptomCheckerInput';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import {SEMIBOLD} from '../../../constants/Fonts';
import {color} from '../../../theme';

const SymptomCheckerFeelSymptoms = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomFeelSymptoms'>>();

  const questionData = params;
  const isSpanish = isSpanishLocale();

  const {onSubmit, isLoading} = useSymptomChecker();

  const englishChoices = JSON.parse(questionData?.eng_choices || '');
  const spanishChoices = JSON.parse(questionData?.spanish_choices || '');

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [other, setOther] = useState('');

  const options = isSpanish ? spanishChoices : englishChoices;
  const formattedOptions = options.map((c: unknown) =>
    typeof c === 'string' ? c : Object.keys(c as any)[0],
  );

  useEffect(() => {
    if (params?.user_eng_choices || params?.user_spanish_choices) {
      const selected =
        params?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
      let parsedAnswer = [];
      try {
        parsedAnswer = JSON.parse(selected);
      } catch (error) {
        console.log(error);
      }

      const formattedAnswers: string[] = [];
      parsedAnswer.forEach((option: string) => {
        if (typeof option === 'string') {
          formattedAnswers.push(option);
        } else {
          const entry = Object.entries(option);
          if (entry?.length) {
            formattedAnswers.push(entry[0][0]);
            setOther(entry[0][1] as string);
          }
        }
      });

      setSelectedSymptoms(formattedAnswers);
    }
  }, [params, isSpanish]);

  const onSelect = (option: string) => {
    let selected = [...selectedSymptoms];
    if (selectedSymptoms.includes(option)) {
      selected = selected.filter(c => c !== option);
    } else {
      selected.push(option);
    }
    setSelectedSymptoms(selected);
    if (!selected.includes(isSpanish ? SPANISH_OTHER : ENGLISH_OTHER)) {
      setOther('');
    }
  };

  const onNext = () => {
    const formattedSelected = selectedSymptoms.includes(
      isSpanish ? SPANISH_OTHER : ENGLISH_OTHER,
    )
      ? selectedSymptoms.map(option => {
          if ([ENGLISH_OTHER, SPANISH_OTHER].includes(option)) {
            return {[option]: other};
          }

          return option;
        })
      : selectedSymptoms;
    const otherLangSymptoms = formattedSelected.map(option => {
      if (typeof option !== 'string') {
        return {[isSpanish ? ENGLISH_OTHER : SPANISH_OTHER]: other};
      }

      const index = formattedOptions.indexOf(option);
      return isSpanish ? englishChoices[index] : spanishChoices[index];
    });
    const englishOptions = isSpanish ? otherLangSymptoms : formattedSelected;
    const spanishOptions = isSpanish ? formattedSelected : otherLangSymptoms;

    onSubmit({
      eng_choices: JSON.stringify(englishOptions),
      spanish_choices: JSON.stringify(spanishOptions),
      questionData,
      isFromReportList: params?.isFromReportList || false,
    });
  };

  return (
    <SymptomCheckerKeyboardAvoidingWrapper
      onNext={onNext}
      disabled={!selectedSymptoms.length || isLoading}
      isLoading={isLoading}
      isEdit={params?.isEdit}
      questionId={questionData?.q_id}
      scrollHeight={20}>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={questionData} />
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-4">
            {formattedOptions.map((option: string) => {
              const isSelected = selectedSymptoms.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  style={[
                    styles.optionContainer,
                    isSelected && styles.selectedOptionContainer,
                  ]}
                  onPress={() => onSelect(option)}>
                  <Text
                    style={[
                      styles.option,
                      isSelected && styles.selectedOption,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedSymptoms.includes(
            isSpanish ? SPANISH_OTHER : ENGLISH_OTHER,
          ) && (
            <SymptomCheckerInput
              text={other}
              onChangeText={setOther}
              autoFocus={!params?.isEdit}
            />
          )}
        </View>
      </View>
    </SymptomCheckerKeyboardAvoidingWrapper>
  );
};
export default SymptomCheckerFeelSymptoms;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
  optionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  selectedOptionContainer: {
    backgroundColor: color.ultramarineBlue,
  },
  option: {
    fontSize: 14,
    fontFamily: SEMIBOLD,
    color: '#222A3D',
    lineHeight: 18,
  },
  selectedOption: {
    color: '#fff',
  },
});
