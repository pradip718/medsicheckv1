import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {RouteProp, useRoute} from '@react-navigation/native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MainStackParamList} from '../../../../types/navigation';
import useLanguageStore from '../../../../store/languageStore';
import {isSpanishLocale} from '../../../../utils/methods';
import useSymptomChecker from '../../../hooks/useSymptomChecker';
import {getBodyImage} from '../../../../utils/symptom';
import SymptomCheckerWrapper from './components/SymptomCheckerWrapper';
import CustomText from '../../../components/Text';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import PressableButton from './components/PressableButton';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import {units} from '../../../theme';

const SymptomCheckerBodyPart = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomSelectBody'>>();
  const {height} = useWindowDimensions();
  const {bottom} = useSafeAreaInsets();
  const languages = useLanguageStore(store => store.languages);

  const questionData = params;
  const isSpanish = isSpanishLocale();

  const {onSubmit, isLoading} = useSymptomChecker();

  const englishChoices = JSON.parse(questionData?.eng_choices || '');
  const spanishChoices = JSON.parse(questionData?.spanish_choices || '');

  const bodyParts = isSpanish ? spanishChoices : englishChoices;

  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(0);
  const [isOtherLoading, setIsOtherLoading] = useState(false);

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

      const enChoices = JSON.parse(params?.eng_choices || '');
      const esChoices = JSON.parse(params?.spanish_choices || '');
      const parts = isSpanish ? esChoices : enChoices;
      const bodyIndex = parts.findIndex(
        (option: string) => option === parsedAnswer?.[0],
      );
      setSelectedPartIndex(bodyIndex && bodyIndex >= 0 ? bodyIndex : 0);
    }
  }, [params, isSpanish]);

  const onNext = () => {
    onSubmit({
      eng_choices: JSON.stringify([englishChoices[selectedPartIndex]]),
      spanish_choices: JSON.stringify([spanishChoices[selectedPartIndex]]),
      questionData,
      isFromReportList: params?.isFromReportList || false,
    });
  };

  const onOtherSelect = () => {
    setIsOtherLoading(true);
    onSubmit({
      eng_choices: JSON.stringify(['other']),
      spanish_choices: JSON.stringify(['other']),
      questionData,
    });
  };

  const bodyImage = getBodyImage(englishChoices[selectedPartIndex]);

  return (
    <SymptomCheckerWrapper
      onNext={onNext}
      footer={
        <TouchableOpacity
          className="border border-gray-300 min-w-[50%] min-h-12 justify-center items-center mt-4 px-4 py-2 mb-4"
          onPress={onOtherSelect}
          style={{borderRadius: units.scale(100)}}>
          <CustomText className="font-isidoraSemiBold text-lg">
            {languages?.other}
          </CustomText>
        </TouchableOpacity>
      }
      disabled={isLoading}
      isLoading={isLoading && !isOtherLoading}
      isEdit={params?.isEdit}
      questionId={questionData?.q_id}>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={questionData} />

        <View className="flex-row items-center flex-1 gap-2 pr-4">
          <View className="w-2/3">
            <Image
              source={bodyImage}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <View className="w-1/3 gap-4" style={{height: height - 330 - bottom}}>
            <ScrollView
              // contentContainerClassName="gap-4 items-end"
              contentContainerStyle={{gap: 16, alignItems: 'flex-end'}}>
              {bodyParts.map((option: string, index: number) => {
                const isSelected = selectedPartIndex === index;
                return (
                  <PressableButton
                    isSelected={isSelected}
                    text={option}
                    key={option}
                    onPress={() => setSelectedPartIndex(index)}
                  />
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </SymptomCheckerWrapper>
  );
};
export default SymptomCheckerBodyPart;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
});
