import {NavigationProp, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getTimeZone} from 'react-native-localize';
import useLanguageStore from '../../../store/languageStore';
import {useAIReportStore} from '../../../store/smartReportStore';
import {MainStackParamList} from '../../../types/navigation';
import {QuestionnaireItem} from '../../../types/personalisedai';
import {
  convertToStringForSingleSelect,
  getCorrespondingSpanishAndEnglishAnswer,
} from '../../../utils/methods';
import {errorToast} from '../../../utils/toast';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import usePostAIQuestionnaire from '../../hooks/api/usePostAIQuestionnaire';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import useGetDeviceLocale from '../../hooks/useGetDeviceLocale';

const getOptions = (
  currentQuestionAnswers: QuestionnaireItem | undefined,
  isEnglish: boolean,
) => {
  if (!currentQuestionAnswers) {
    return [];
  }
  if (isEnglish) {
    return typeof currentQuestionAnswers?.eng_choices === 'string'
      ? JSON.parse(currentQuestionAnswers?.eng_choices || '')
      : [];
  }
  return typeof currentQuestionAnswers?.eng_choices === 'string'
    ? JSON.parse(currentQuestionAnswers?.spanish_choices || '')
    : [];
};

const ConclusionInformation = ({content}: any) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {isEnglish} = useGetDeviceLocale();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {setCurrentQuestionAnswers} = useAIReportStore();
  const currentQuestions = content;

  const {mutateAsync: postQuestionnaire} = usePostAIQuestionnaire({
    onMutate: showLoader,
    onError: () => {
      return errorToast(languages?.generic_error_message);
    },
    onSuccess: async (data, payload) => {
      if (payload.eng_choices === 'Yes') {
        setCurrentQuestionAnswers(data);
        return navigation.navigate('PersonalisedAI');
      }
      if (payload.eng_choices === 'Exit') {
        return navigateToHome();
      }
    },
    onSettled: hideLoader,
  });

  const navigateToHome = () => {
    navigation.navigate('HomepageStackScreens', {
      screen: 'Home',
    });
  };

  const submitQuestionnaire = async (answers?: any) => {
    let eng_choices = '';
    let spanish_choices = '';

    if (isEnglish) {
      eng_choices = convertToStringForSingleSelect(currentQuestions, answers);
      spanish_choices = convertToStringForSingleSelect(
        currentQuestions,
        getCorrespondingSpanishAndEnglishAnswer({
          currentQuestionAnswers: currentQuestions,
          isEnglish,
          selectedAnswer: [answers],
        }),
      );
    } else {
      eng_choices = convertToStringForSingleSelect(
        currentQuestions,
        getCorrespondingSpanishAndEnglishAnswer({
          currentQuestionAnswers: currentQuestions,
          isEnglish,
          selectedAnswer: [answers],
        }),
      );
      spanish_choices = convertToStringForSingleSelect(
        currentQuestions,
        answers,
      );
    }

    await postQuestionnaire(
      {
        q_id: currentQuestions?.q_id || '',
        answer_id: currentQuestions?.answer_id || '',
        eng_choices,
        spanish_choices,
        timestamp: moment().format('YYYY-MM-DD HH:mm'),
        timezone: getTimeZone(),
        path_type: currentQuestions?.path_type || '',
      },
      answers,
    );
  };

  const onOptionSelection = async (selectedOption: string) => {
    switch (true) {
      case ['Yes', 'Sí'].includes(selectedOption): {
        return await submitQuestionnaire(isEnglish ? 'Yes' : 'Sí');
      }
      case ['Exit', 'Salida']?.includes(selectedOption): {
        return await submitQuestionnaire(isEnglish ? 'Exit' : 'Salida');
      }

      default: {
        return navigateToHome();
      }
    }
  };

  return (
    <View className="mt-4 items-center justify-center flex-grow">
      <CustomText className="text-yankeesBlue text-lg font-isidoraSemiBold text-center mb-4">
        {/* {languages?.privacyRejectMessage} */}
        {isEnglish ? content?.eng_question : content?.spanish_question}
      </CustomText>

      {getOptions(content, isEnglish)?.map((option: string) => (
        <View className="items-center my-1" key={option}>
          <RoundedButton
            resetStyle
            style={styles.btnStyle}
            className="py-2 min-w-[182px] bg-[#D8E0FF]"
            onPress={() => onOptionSelection(option)}>
            <CustomText className="font-isidoraBold text-lg text-center text-black">
              {option}
            </CustomText>
          </RoundedButton>
        </View>
      ))}
    </View>
  );
};

export default ConclusionInformation;

const styles = StyleSheet.create({
  container: {},
  btnStyle: {},
});
