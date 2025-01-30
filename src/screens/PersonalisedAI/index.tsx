import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {ImageBackground, Keyboard, StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getTimeZone} from 'react-native-localize';
import {SafeAreaView} from 'react-native-safe-area-context';
import {QuestionnaireBackground} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import {
  useAIReportFacescanStore,
  useAIReportStore,
} from '../../../store/smartReportStore';
import {MainStackParamList} from '../../../types/navigation';
import {QuestionnaireItem} from '../../../types/personalisedai';
import {
  convertToStringForSingleSelect,
  isValidJSON,
} from '../../../utils/methods';
import {errorToast} from '../../../utils/toast';
import {notifyApi} from '../../api/user';
import EtchedGlass from '../../components/EtchedGlass';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import {QuestionType} from '../../constants/enums';
import useGetAIQuestionnaire from '../../hooks/api/useGetAIQuestionnaire';
import usePostAIQuestionnaire from '../../hooks/api/usePostAIQuestionnaire';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import useGetDeviceLocale from '../../hooks/useGetDeviceLocale';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';
import QuestionAnswer from './QuestionAnswer';

const PersonalisedAI = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {setActionData} = useAIReportFacescanStore();

  const {startScan} = usePrepareFacescan();

  const [selectedAnswers, setSelectedAnswers] = useState<any>('');
  const {currentQuestionAnswers, setCurrentQuestionAnswers} =
    useAIReportStore();
  const {isEnglish} = useGetDeviceLocale();

  const {
    data: aiQuestions,
    isLoading,
    refetch: getAIQuestions,
  } = useGetAIQuestionnaire({
    type: 'latest',
    // gcTime: 0,
    staleTime: Infinity,
  });

  const {refetch: fetchPreviousAIQuestions} = useGetAIQuestionnaire({
    type: 'previous',
    q_id: currentQuestionAnswers?.q_id,
    staleTime: Infinity,
    enabled: false,
  });

  useEffect(() => {
    const initialPreventixQuestion = aiQuestions?.[0];
    if (
      initialPreventixQuestion &&
      (initialPreventixQuestion?.question_type === QuestionType.FinalMessage ||
        initialPreventixQuestion?.question_type === QuestionType.Submitted ||
        initialPreventixQuestion?.question_type === QuestionType.END)
    ) {
      return navigateToConclusion(initialPreventixQuestion);
    }
    if (initialPreventixQuestion) {
      setCurrentQuestionAnswers(initialPreventixQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiQuestions]);
  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const {mutateAsync: postQuestionnaire, isPending: isSubmittingQuery} =
    usePostAIQuestionnaire({
      onMutate: showLoader,
      onSuccess: (data: QuestionnaireItem, variables) => {
        const {path_type} = variables;
        setSelectedAnswers('');
        notifyApi('scan_ai_report', {
          question_id: currentQuestionAnswers?.q_id,
        });
        if (
          (data && data?.question_type === QuestionType.FinalMessage) ||
          data?.question_type === QuestionType.Submitted ||
          data?.question_type === QuestionType.END
        ) {
          return navigateToConclusion(data);
        }
        if (data) {
          setCurrentQuestionAnswers(data);
        }
        if (data && path_type !== 'config' && path_type !== 'no_scan_data') {
          updateSelectedQuestions({
            user_eng_choices: data.user_eng_choices || '',
            user_spanish_choices: data.user_spanish_choices || '',
            eng_choices: data.eng_choices || '',
            spanish_choices: data.spanish_choices || '',
          });
        }
      },
      onSettled: hideLoader,
    });

  const navigateToConclusion = (data: QuestionnaireItem) => {
    navigation.navigate('Conclusion', {
      content: data,
    });
  };

  const handleSelectedAnswers = (answers: any) => {
    setSelectedAnswers(answers);

    if (
      currentQuestionAnswers?.path_type !== 'config' &&
      currentQuestionAnswers?.path_type !== 'no_scan_data'
    ) {
      return;
    }

    switch (true) {
      case answers?.includes('Exit') || answers?.includes('Salida'): {
        return navigation.dispatch(
          StackActions.replace('HomepageStackScreens', {
            screen: 'Home',
          }),
        );
      }
      case answers?.includes('Initiate Scan') ||
        answers?.includes('Iniciar escaneo'): {
        setActionData({
          fromScreen: 'PersonalisedAI',
          action: async () => await submitQuestionnaire(answers),
        });
        return startScan();
      }
      default: {
        return submitQuestionnaire(answers);
      }
    }
  };

  const onBackPress = async () => {
    showLoader();
    const {
      data: previousQuestionAnswer,
      isSuccess,
      isError,
    } = await fetchPreviousAIQuestions();
    hideLoader();

    if (isSuccess) {
      updateSelectedQuestions({
        user_eng_choices: previousQuestionAnswer?.[0]?.user_eng_choices || '',
        user_spanish_choices:
          previousQuestionAnswer?.[0]?.user_spanish_choices || '',
        eng_choices: previousQuestionAnswer?.[0]?.eng_choices || '',
        spanish_choices: previousQuestionAnswer?.[0]?.spanish_choices || '',
      });
      setCurrentQuestionAnswers(previousQuestionAnswer?.[0]);
    }
    if (isError) {
      errorToast(languages?.generic_error_message);
    }
  };

  const updateSelectedQuestions = ({
    user_eng_choices,
    user_spanish_choices,
    eng_choices,
    spanish_choices,
  }: {
    user_eng_choices: string;
    user_spanish_choices: string;
    eng_choices: string;
    spanish_choices: string;
  }) => {
    let selectedEnglishChoice;
    let selectedSpanishChoice;

    const getEnglishChoice = () => {
      if (isValidJSON(user_eng_choices)) {
        return JSON.parse(user_eng_choices);
      }
      if (eng_choices && isValidJSON(eng_choices)) {
        return [user_eng_choices];
      }
      return user_eng_choices;
    };

    const getSpanishChoice = () => {
      if (isValidJSON(user_spanish_choices)) {
        return JSON.parse(user_spanish_choices);
      }
      if (spanish_choices && isValidJSON(spanish_choices)) {
        return [user_spanish_choices];
      }
      return user_spanish_choices;
    };

    selectedEnglishChoice = getEnglishChoice();
    selectedSpanishChoice = getSpanishChoice();

    handleSelectedAnswers(
      isEnglish ? selectedEnglishChoice : selectedSpanishChoice,
    );
  };

  const handleClose = async () => {
    showLoader();
    await getAIQuestions();
    navigation.navigate('HomepageStackScreens', {
      screen: 'Home',
    });
    hideLoader();
  };

  const getCorrespondingSpanishAndEnglishAnswer = (
    selectedAnswer: string | string[] | {name: string; text: string}[],
  ): string | string[] | {name: string; text: string}[] => {
    if (
      typeof selectedAnswer === 'string' ||
      (Array.isArray(selectedAnswer) && typeof selectedAnswer?.[0] === 'object')
    ) {
      return selectedAnswer;
    }
    const spanishOptions = currentQuestionAnswers?.spanish_choices
      ? JSON.parse(currentQuestionAnswers?.spanish_choices)
      : [];
    const englishOptions = currentQuestionAnswers?.eng_choices
      ? JSON.parse(currentQuestionAnswers?.eng_choices)
      : [];

    if (!englishOptions?.length && !spanishOptions?.length) {
      return selectedAnswer;
    }
    if (isEnglish) {
      return selectedAnswer?.map((selected, _) => {
        const englishIdx = englishOptions.findIndex(
          (english: string) => english === selected,
        );
        return spanishOptions[englishIdx] || '';
      });
    }
    return selectedAnswer.map(selected => {
      const spanishIdx = spanishOptions.findIndex(
        (spanish: string) => spanish === selected,
      );
      return englishOptions[spanishIdx] || '';
    });
  };

  const submitQuestionnaire = async (answers?: any) => {
    let eng_choices = '';
    let spanish_choices = '';

    const submittedAnswer = answers || selectedAnswers;

    if (isEnglish) {
      eng_choices = convertToStringForSingleSelect(
        currentQuestionAnswers,
        submittedAnswer,
      );
      spanish_choices = convertToStringForSingleSelect(
        currentQuestionAnswers,
        getCorrespondingSpanishAndEnglishAnswer(submittedAnswer),
      );
    } else {
      eng_choices = convertToStringForSingleSelect(
        currentQuestionAnswers,
        getCorrespondingSpanishAndEnglishAnswer(submittedAnswer),
      );
      spanish_choices = convertToStringForSingleSelect(
        currentQuestionAnswers,
        submittedAnswer,
      );
    }
    Keyboard.dismiss();

    await postQuestionnaire({
      q_id: currentQuestionAnswers?.q_id || '',
      answer_id: currentQuestionAnswers?.answer_id || '',
      eng_choices,
      spanish_choices,
      timestamp: moment().format('YYYY-MM-DD HH:mm'),
      timezone: getTimeZone(),
      path_type: currentQuestionAnswers?.path_type || '',
    });
  };

  const isSaveButtonDisabled =
    (!selectedAnswers ||
      (Array.isArray(selectedAnswers) &&
        (!selectedAnswers?.length || selectedAnswers?.every(ans => !ans)))) &&
    currentQuestionAnswers?.question_type !== QuestionType.Label &&
    currentQuestionAnswers?.question_type !== QuestionType.Welcome &&
    currentQuestionAnswers?.question_type !== QuestionType.FinalMessage &&
    currentQuestionAnswers?.question_type !== QuestionType.Submitted &&
    currentQuestionAnswers?.question_type !== QuestionType.END;

  const isSubmitBtnHidden = ['config', 'no_scan_data']?.includes(
    currentQuestionAnswers?.path_type || '',
  );

  return (
    <ImageBackground
      source={QuestionnaireBackground as any}
      className="h-full w-full"
      resizeMode="stretch">
      <SafeAreaView className="flex-grow pb-2">
        <KeyboardAwareScrollView
          contentContainerStyle={styles.keyboardAwareContentContainer}
          keyboardShouldPersistTaps="handled">
          <View className="p-4">
            <Navbar
              hasClose
              handleClose={handleClose}
              onBackClick={onBackPress}
              noBack={
                currentQuestionAnswers?.validation?.previous_flag === false
              }
            />
          </View>
          <EtchedGlass
            className="rounded-none justify-center p-0"
            cardContentContainerClassName="p-0 h-14 justify-center">
            <CustomText className="text-center font-isidoraSemiBold text-base text-yankeesBlue">
              {languages?.ai_report_header}
            </CustomText>
          </EtchedGlass>

          <EtchedGlass
            className="rounded-full my-4 mx-4"
            cardContentContainerClassName="py-2"
            cardContentClassName="justify-center items-center">
            <CustomText className="text-center font-isidoraMedium text-base text-yankeesBlue">
              {languages?.ai_report_info}
            </CustomText>
          </EtchedGlass>

          <View className="my-4 flex-grow">
            <QuestionAnswer
              details={currentQuestionAnswers}
              selectedAnswers={selectedAnswers}
              handleSelectedAnswers={handleSelectedAnswers}
            />
          </View>
          <View className={`px-4 ${isSubmitBtnHidden ? 'hidden' : ''}`}>
            <RoundedButton
              onPress={() => submitQuestionnaire()}
              disabled={isSaveButtonDisabled || isSubmittingQuery}>
              <CustomText className="text-lg text-white font-isidoraSemiBold">
                {languages?.save_btn_txt}
              </CustomText>
            </RoundedButton>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default PersonalisedAI;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    height: '100%',
    paddingBottom: 20,
  },
  keyboardAwareContentContainer: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
});
