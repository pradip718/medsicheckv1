import {RouteProp} from '@react-navigation/native';
import {ScrollView} from 'moti';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MainStackParamList} from '../../../../types/navigation';
import {ParseAndRenderText} from '../../../../utils/common';
import {isValidJSON} from '../../../../utils/methods';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import useGetDeviceLocale from '../../../hooks/useGetDeviceLocale';

type LabQuestionnaireDetailRouteProp = RouteProp<
  MainStackParamList,
  'LabQuestionnaireDetails'
>;

interface LabQuestionnaireDetailProps {
  route: LabQuestionnaireDetailRouteProp;
}

const RenderSelect = ({choice}: {choice: string[]}) => {
  if (!choice || !Array.isArray(choice)) {
    return <></>;
  }
  return (
    <View>
      {choice?.map((eachChoice, idx) => (
        <View key={`${eachChoice}-${idx}`} className=" mt-2">
          <CustomText className="text-lg font-isidoraMedium">
            {idx + 1}. {typeof eachChoice === 'string' ? eachChoice : ''}
          </CustomText>
        </View>
      ))}
    </View>
  );
};

const RenderText = ({choice}: {choice: string}) => {
  if (!choice) {
    return <></>;
  }

  return (
    <View>
      <CustomText className="text-base font-isidoraMedium text-black">
        - {choice}
      </CustomText>
    </View>
  );
};

const LabQuestionnaireDetails = ({route}: LabQuestionnaireDetailProps) => {
  const {questionnaire} = route?.params || {};
  const {isEnglish} = useGetDeviceLocale();

  if (!questionnaire && !Array.isArray(questionnaire)) {
    return;
  }

  const getCorrespondingAnswer = (q_id: string) => {
    const selectedQuestion = questionnaire?.find(
      question => question.q_id === q_id,
    );
    if (!selectedQuestion) {
      return <></>;
    }
    let {eng_choices, spanish_choices} = selectedQuestion;

    const isValidJson = isValidJSON(eng_choices.replace(/'/g, '"'));
    if (isValidJson) {
      eng_choices = JSON.parse(eng_choices.replace(/'/g, '"'));
      spanish_choices = JSON.parse(spanish_choices.replace(/'/g, '"'));
      return (
        <RenderSelect
          choice={isEnglish ? (eng_choices as any) : (spanish_choices as any)}
        />
      );
    }
    return (
      <View className="mt-2">
        <RenderText choice={isEnglish ? eng_choices : spanish_choices} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View className="p-4">
        <Navbar />
      </View>
      <ScrollView
        className="px-4"
        contentContainerStyle={styles.contentContainer}
        from={{translateX: 50, opacity: 0.5}}
        animate={{translateX: 0, opacity: 1}}
        exit={{
          opacity: 0,
        }}>
        {questionnaire?.map((question, index) => (
          <View key={`${question.q_id}-${index}`} className="mt-4">
            <CustomText className="text-lg font-isidoraSemiBold">
              {index + 1}:{' '}
              {ParseAndRenderText(
                !isEnglish
                  ? question?.spanish_question
                  : question?.eng_question,
              )}
            </CustomText>
            {getCorrespondingAnswer(question.q_id)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LabQuestionnaireDetails;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {paddingBottom: 100},
});
