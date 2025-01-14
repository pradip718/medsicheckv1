import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {Buffer} from 'buffer';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {ImageBackground, Keyboard, StyleSheet, View} from 'react-native';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getTimeZone} from 'react-native-localize';
import {SafeAreaView} from 'react-native-safe-area-context';
import RNFetchBlob from 'rn-fetch-blob';
import {QuestionnaireBackground} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {QuestionnaireItem} from '../../../types/personalisedai';
import {isAndroid} from '../../../utils';
import {
  convertToStringForSingleSelect,
  isValidJSON,
} from '../../../utils/methods';
import {errorToast} from '../../../utils/toast';
import EtchedGlass from '../../components/EtchedGlass';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import {QuestionType} from '../../constants/enums';
import {
  useGetLabReportQuestionnaire,
  usePostLabReportQuestionnaire,
  useUploadLabReportFile,
} from '../../hooks/api/report';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import useGetDeviceLocale from '../../hooks/useGetDeviceLocale';
import QuestionAnswer from './QuestionAnswer';

const LabReport = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();
  const [selectedAnswers, setSelectedAnswers] = useState<any>('');
  const [currentQuestionAnswers, setCurrentQuestionAnswers] =
    useState<QuestionnaireItem>();
  const {isEnglish} = useGetDeviceLocale();

  const {
    data: aiQuestions,
    isLoading,
    refetch: getAIQuestions,
  } = useGetLabReportQuestionnaire({
    type: 'latest',
    // gcTime: 0,
    staleTime: Infinity,
  });

  const {refetch: fetchPreviousAIQuestions} = useGetLabReportQuestionnaire({
    type: 'previous',
    q_id: currentQuestionAnswers?.q_id,
    staleTime: Infinity,
    enabled: false,
  });

  const {mutateAsync: postLabReportFileUpload, isPending: isPostingAnswers} =
    useUploadLabReportFile({
      onMutate: showLoader,
      onSuccess: async labReportResponse => {
        await postAnswers({
          eng_choices: labReportResponse?.token_id,
          spanish_choices: labReportResponse?.token_id,
        });
      },
      onSettled: hideLoader,
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
    usePostLabReportQuestionnaire({
      onMutate: showLoader,
      onSuccess: (data: QuestionnaireItem) => {
        setSelectedAnswers('');
        if (
          (data && data?.question_type === QuestionType.FinalMessage) ||
          data?.question_type === QuestionType.Submitted ||
          data?.question_type === QuestionType.END
        ) {
          return navigateToConclusion(data);
        }
        if (data) {
          setCurrentQuestionAnswers(data);
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
    navigation.navigate('LabReportConclusion', {
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
        return navigation?.navigate('FaceScanCamera', {
          fromScreen: 'PersonalisedAI',
          action: async () => await submitQuestionnaire(answers),
        });
      }
      default:
        return submitQuestionnaire(answers);
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

  const handleFileUpload = async ({file}: {file: DocumentPickerResponse}) => {
    if (!file) {
      errorToast(languages?.select_document);
      return;
    }
    try {
      let filePath = file.uri;
      if (!isAndroid) {
        RNFetchBlob.fetch('GET', `file://${filePath}`)
          .then(res => {
            const base64Data = res.base64();
            const binaryData = Buffer.from(base64Data, 'base64');
            return postLabReportFileUpload(binaryData);
          })
          .catch(err => {
            console.error('Error reading file:', err);
          });
      } else {
        const base64Data = await RNFetchBlob.fs.readFile(filePath, 'base64');
        const binaryData = Buffer.from(base64Data, 'base64');
        await postLabReportFileUpload(binaryData);
      }
    } catch (error) {
      errorToast(languages?.generic_error_message);
    }
  };

  const postAnswers = async ({
    eng_choices,
    spanish_choices,
  }: {
    eng_choices: string;
    spanish_choices: string;
  }) => {
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

  const submitQuestionnaire = async (answers?: any) => {
    if (selectedAnswers?.type === 'file') {
      return handleFileUpload({file: selectedAnswers?.file});
    }

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
    await postAnswers({eng_choices, spanish_choices});
  };

  const isSaveButtonDisabled =
    !selectedAnswers ||
    (Array.isArray(selectedAnswers) &&
      (!selectedAnswers?.length || selectedAnswers?.every(ans => !ans))) ||
    isPostingAnswers ||
    isSubmittingQuery;

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
              {languages?.lab_report_header}
            </CustomText>
          </EtchedGlass>

          {currentQuestionAnswers?.question_type !==
            QuestionType.FileUpload && (
            <EtchedGlass
              className="rounded-full my-4 mx-4"
              cardContentContainerClassName="py-2"
              cardContentClassName="justify-center items-center">
              <CustomText className="text-center font-isidoraMedium text-base text-yankeesBlue">
                {languages?.lab_report_info}
              </CustomText>
            </EtchedGlass>
          )}

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

export default LabReport;

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
