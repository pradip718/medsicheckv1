import React from 'react';
import {StyleSheet, View} from 'react-native';

import FindingItem from './FindingItem';
import {SymptomCheckerDetail} from '../../../../../../types/api_response';
import useLanguageStore from '../../../../../../store/languageStore';
import {REGULAR} from '../../../../../constants/Fonts';
import CustomText from '../../../../../components/Text';

const Findings = ({data}: {data: SymptomCheckerDetail}) => {
  const languages = useLanguageStore(store => store.languages);

  return (
    <View style={{gap: 16}}>
      {data?.first_hypothesis ? (
        <FindingItem
          name={data?.first_hypothesis?.first_hypothesis_name}
          index={1}
          text={data?.first_hypothesis?.first_hypothesis_text}
          percentage={data?.first_hypothesis?.first_hypothesis_percentage}
          level_risk={data?.first_hypothesis?.first_hypothesis_level_risk}
        />
      ) : null}

      {data?.second_hypothesis ? (
        <FindingItem
          name={data?.second_hypothesis?.second_hypothesis_name}
          index={2}
          text={data?.second_hypothesis?.second_hypothesis_text}
          percentage={data?.second_hypothesis?.second_hypothesis_percentage}
          level_risk={data?.second_hypothesis?.second_hypothesis_level_risk}
        />
      ) : null}

      {data?.third_hypothesis ? (
        <FindingItem
          name={data?.third_hypothesis?.third_hypothesis_name}
          index={3}
          text={data?.third_hypothesis?.third_hypothesis_text}
          percentage={data?.third_hypothesis?.third_hypothesis_percentage}
          level_risk={data?.third_hypothesis?.third_hypothesis_level_risk}
        />
      ) : null}

      {data?.fourth_hypothesis ? (
        <FindingItem
          name={data?.fourth_hypothesis?.fourth_hypothesis_name}
          index={4}
          text={data?.fourth_hypothesis?.fourth_hypothesis_text}
          percentage={data?.fourth_hypothesis?.fourth_hypothesis_percentage}
          level_risk={data?.fourth_hypothesis?.fourth_hypothesis_level_risk}
        />
      ) : null}

      <CustomText style={styles.text}>
        {languages?.hypothesis_disclaimer}
      </CustomText>
    </View>
  );
};

export default Findings;

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#63666C',
    fontFamily: REGULAR,
    marginTop: 16,
  },
});
