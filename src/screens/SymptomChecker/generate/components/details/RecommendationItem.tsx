import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SymptomCheckerImmediateRecommendation} from '../../../../../../types/api_response';
import useLanguageStore from '../../../../../../store/languageStore';
import Icon from '../../../../../components/Icon';
import {BOLD, REGULAR} from '../../../../../constants/Fonts';

const ImmediateRecommendations = ({
  data,
}: {
  data: SymptomCheckerImmediateRecommendation;
}) => {
  const languages = useLanguageStore(store => store.languages);
  return (
    <View style={{gap: 16}}>
      {data?.restrictions ? (
        <View style={styles.card}>
          <View className="flex-row items-center" style={{gap: 8}}>
            <Icon name="close-filled" size={32} color="#F43F5E" />
            <Text style={styles.title} className="pb-1">
              {languages?.restrictions}
            </Text>
          </View>
          <Text style={styles.text}>{data?.restrictions}</Text>
        </View>
      ) : null}

      {data?.hygiene ? (
        <View style={styles.card}>
          <View className="flex-row items-center" style={{gap: 8}}>
            <Icon name="sanitizer" size={32} color="#218DFC" />
            <Text style={styles.title}>{languages?.hygiene}</Text>
          </View>
          <Text style={styles.text}>{data?.hygiene}</Text>
        </View>
      ) : null}

      {data?.home_remedies ? (
        <View style={styles.card}>
          <View className="flex-row items-center" style={{gap: 12}}>
            <Icon name="home1" size={34} color="#9D568C" />
            <Text style={styles.title} className="pb-1">
              {languages?.home_remedies}
            </Text>
          </View>
          <Text style={styles.text}>{data?.home_remedies}</Text>
        </View>
      ) : null}
      <Text style={styles.text}>{data?.justification}</Text>
    </View>
  );
};

export default ImmediateRecommendations;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 17,
    lineHeight: 30,
    fontFamily: BOLD,
    color: '#4B5363',
  },
  text: {
    fontFamily: REGULAR,
    color: '#4B5363',
    fontSize: 15,
    lineHeight: 22,
  },
});
