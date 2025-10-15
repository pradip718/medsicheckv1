import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import useLanguageStore from '../../../../../../store/languageStore';
import Icon from '../../../../../components/Icon';
import {EMOTION_ICON_COLORS} from '../../../../../constants/Colors';
import {BOLD, REGULAR} from '../../../../../constants/Fonts';

const emotionIcons = ['depressed', 'sad', 'neutral', 'happy', 'overjoyed'];

const SymptomRateApp = () => {
  const languages = useLanguageStore(store => store.languages);

  const [selectedRating, setSelectedRating] = useState<number>();

  const onRate = (index: number) => {
    setSelectedRating(prev => (prev === index ? undefined : index));
  };

  return (
    <View className="bg-[#F3F4F6] p-4 rounded-[20px] gap-2 mt-0.5">
      <Text style={styles.title}>{languages?.rate_our_app}</Text>
      <Text style={styles.subTitle}>{languages?.feedback_request}</Text>
      <View
        className="flex-row p-4 mt-2 bg-white justify-evenly rounded-[20px]"
        style={{gap: 16}}>
        {emotionIcons.map((icon, index) => (
          <Icon
            name={icon}
            key={icon}
            size={35}
            color={
              index === selectedRating ? EMOTION_ICON_COLORS[index] : '#CBD5E1'
            }
            onPress={() => onRate(index)}
          />
        ))}
      </View>
    </View>
  );
};

export default SymptomRateApp;

const styles = StyleSheet.create({
  title: {
    fontFamily: BOLD,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    flexWrap: 'wrap',
    flex: 1,
  },
  subTitle: {
    fontFamily: REGULAR,
    color: '#4B5363',
    fontSize: 14,
    lineHeight: 20,
  },
});
