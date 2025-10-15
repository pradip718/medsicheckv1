import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  extractLabelAndComment,
  isSpanishLocale,
} from '../../../../../utils/methods';
import {SymptomCheckerParams} from '../../../../../types/symptom';
import {BOLD, REGULAR} from '../../../../constants/Fonts';

const SymptomCheckerQuestion = ({data}: {data: SymptomCheckerParams}) => {
  if (!data) {
    return null;
  }

  const isSpanish = isSpanishLocale();

  const {label, comment} = extractLabelAndComment(
    data?.[isSpanish ? 'spanish_question' : 'eng_question'] ?? '',
  );

  return (
    <View>
      <Text style={styles.title}>{label}</Text>
      {comment && <Text style={styles.infoText}>{comment}</Text>}
    </View>
  );
};

export default SymptomCheckerQuestion;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: BOLD,
    lineHeight: 28,
    color: '#222A3D',
  },

  infoText: {
    fontSize: 16,
    fontFamily: REGULAR,
    lineHeight: 24,
    color: '#222A3D',
    marginTop: 8,
  },
});
