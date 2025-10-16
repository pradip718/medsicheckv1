import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MainStackParamList} from '../../../../types/navigation';
import {
  extractLabelAndComment,
  isSpanishLocale,
} from '../../../../utils/methods';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import SymptomCheckerWrapper from './components/SymptomCheckerWrapper';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import {BOLD, SEMIBOLD} from '../../../constants/Fonts';

const SymptomCheckerSymptomDuration = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomSymptomsDuration'>>();

  const questionData = params;
  const isSpanish = isSpanishLocale();

  const {onSubmit, isLoading} = useSymptomChecker();

  const englishChoices = JSON.parse(questionData?.eng_choices || '');
  const spanishChoices = JSON.parse(questionData?.spanish_choices || '');

  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = useMemo(
    () => (isSpanish ? spanishChoices : englishChoices),
    [englishChoices, isSpanish, spanishChoices],
  );

  useEffect(() => {
    if (params?.user_eng_choices || params?.user_spanish_choices) {
      const selected =
        params?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
      const index = options.indexOf(selected);
      setSelectedIndex(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, isSpanish]);

  const onNext = () => {
    const englishChoice = englishChoices[selectedIndex];
    const spanishChoice = spanishChoices[selectedIndex];

    onSubmit({
      eng_choices: englishChoice,
      spanish_choices: spanishChoice,
      questionData,
      isFromReportList: params?.isFromReportList || false,
    });
  };

  return (
    <SymptomCheckerWrapper
      onNext={onNext}
      disabled={isLoading}
      isLoading={isLoading}
      isEdit={params?.isEdit}
      questionId={params?.q_id}>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={questionData} />

        <View className="flex-1">
          <View className="flex-row flex-wrap flex-1 gap-4">
            {options.map((option: string, index: number) => {
              const isSelected = index === selectedIndex;
              const {label, comment} = extractLabelAndComment(option);
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.8}
                  style={[
                    styles.optionContainer,
                    isSelected && styles.selectedOptionContainer,
                  ]}
                  onPress={() => {
                    setSelectedIndex(index);
                  }}>
                  <Text
                    style={[
                      styles.option,
                      isSelected && styles.selectedOption,
                    ]}>
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDesc,
                      isSelected && styles.selectedOption,
                    ]}>
                    {comment}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </SymptomCheckerWrapper>
  );
};
export default SymptomCheckerSymptomDuration;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
  optionContainer: {
    height: 140,
    width: '45%',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  selectedOptionContainer: {
    borderColor: '#1A80D9',
    boxShadow: '0px 0px 0px 6px #1A80D94D',
    backgroundColor: '#D7EEFC',
  },
  option: {
    fontFamily: BOLD,
    fontSize: 18,
    lineHeight: 24,
    color: '#222A3D',
  },
  optionDesc: {
    fontFamily: SEMIBOLD,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5363',
  },
  selectedOption: {
    color: '#1A80D9',
  },
});
