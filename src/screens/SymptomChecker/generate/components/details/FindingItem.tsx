import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import useLanguageStore from '../../../../../../store/languageStore';
import Icon from '../../../../../components/Icon';
import {BOLD, REGULAR} from '../../../../../constants/Fonts';

interface FindingItemProps {
  name: string;
  text: string;
  percentage: string;
  level_risk?: string;
  index: number;
}

function extractPercentageValue(str: string): number {
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

const FindingItem = ({
  name,
  text,
  percentage,
  level_risk,
  index,
}: FindingItemProps) => {
  const languages = useLanguageStore(store => store.languages);

  const percentageValue = extractPercentageValue(percentage);

  const progressBarColor = useMemo(
    () =>
      percentageValue < 40
        ? '#1A80D9'
        : percentageValue <= 70
        ? '#FBBF24'
        : '#5EEAD4',
    [percentageValue],
  );

  const riskColor = useMemo(
    () =>
      level_risk
        ? level_risk === 'High'
          ? '#F43F5E'
          : level_risk === 'Medium'
          ? '#D97706'
          : '#14B8A6'
        : '#14B8A6',
    [level_risk],
  );
  return (
    <View style={{gap: 12}}>
      <Text style={styles.title}>
        {index}. {name}
      </Text>
      <View className="p-4 bg-white rounded-[20px]" style={{gap: 12}}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{gap: 8}}>
            <Icon name="target" size={24} color={progressBarColor} />
            <Text style={styles.percentage}>
              {percentage} {languages?.match}
            </Text>
          </View>

          {level_risk ? (
            <View
              className="px-2 py-1 border rounded-lg"
              style={{borderColor: riskColor}}>
              <Text
                // eslint-disable-next-line react-native/no-inline-styles
                style={[styles.text, {color: riskColor, fontSize: 14}]}>
                {level_risk}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressValue,
              {width: `${percentageValue}%`, backgroundColor: progressBarColor},
            ]}
          />
        </View>
      </View>

      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default FindingItem;

const styles = StyleSheet.create({
  title: {
    fontFamily: BOLD,
    fontSize: 16,
    color: '#4B5363',
    lineHeight: 22,
  },
  text: {
    fontFamily: REGULAR,
    color: '#4B5363',
    fontSize: 15,
    lineHeight: 22,
  },
  progressContainer: {
    backgroundColor: '#F3F4F6',
    height: 8,
    width: '100%',
    position: 'relative',
    borderRadius: 8,
  },
  progressValue: {
    height: 8,
    position: 'absolute',
    left: 0,
    borderRadius: 8,
  },
  percentage: {
    fontFamily: BOLD,
    fontSize: 17,
    lineHeight: 24,
    color: '#222A3D',
  },
});
