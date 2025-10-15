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

const SymptomCheckerOtherBodyPart = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomOtherBodyPart'>>();
  const questionData = params;
  const isSpanish = isSpanishLocale();

  const [bodyPart, setBodyPart] = useState('');

  useEffect(() => {
    if (params?.user_eng_choices || params?.user_spanish_choices) {
      const selected =
        params?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
      setBodyPart(selected || '');
    }
  }, [isSpanish, params]);

  const {onSubmit, isLoading} = useSymptomChecker();

  const onNext = () => {
    onSubmit({
      eng_choices: bodyPart,
      spanish_choices: bodyPart,
      questionData,
    });
  };

  return (
    <SymptomCheckerKeyboardAvoidingWrapper
      onNext={onNext}
      disabled={isLoading || !bodyPart}
      isLoading={isLoading}
      isEdit={params?.isEdit}
      questionId={questionData?.q_id}>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={params} />

        <View className="flex-1">
          <SymptomCheckerInput
            text={bodyPart}
            onChangeText={setBodyPart}
            maxLength={50}
            containerStyle={styles.inputContainer}
            autoFocus={!params?.isEdit}
          />
        </View>
      </View>
    </SymptomCheckerKeyboardAvoidingWrapper>
  );
};
export default SymptomCheckerOtherBodyPart;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
  inputContainer: {marginTop: 8},
});
