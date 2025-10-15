import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {RouteProp, useRoute} from '@react-navigation/native';
import {MainStackParamList} from '../../../../types/navigation';
import {isSpanishLocale} from '../../../../utils/methods';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import SymptomCheckerKeyboardAvoidingWrapper from './components/SymptomCheckerKeyboardAvoidingWrapper';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import SymptomCheckerInput from './components/SymptomCheckerInput';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';

const SymptomCheckerAdditionalDetails = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomAdditionalDetails'>>();

  const questionData = params;
  const isSpanish = isSpanishLocale();

  const {onSubmit, isLoading} = useSymptomChecker();

  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (params?.user_eng_choices || params?.user_spanish_choices) {
      const selected =
        params?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
      setDetail(selected);
    }
  }, [params, isSpanish]);

  const onNext = () => {
    onSubmit({
      eng_choices: detail,
      spanish_choices: detail,
      questionData,
    });
  };

  return (
    <SymptomCheckerKeyboardAvoidingWrapper
      onNext={onNext}
      disabled={isLoading}
      isLoading={isLoading}
      isEdit={params?.isEdit}
      questionId={questionData?.q_id}>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={questionData} />

        <SymptomCheckerInput text={detail} onChangeText={setDetail} />
      </View>
    </SymptomCheckerKeyboardAvoidingWrapper>
  );
};
export default SymptomCheckerAdditionalDetails;

const styles = StyleSheet.create({
  container: {
    gap: 4,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
});
