import {
  CommonActions,
  NavigationProp,
  RouteProp,
  // StackActions,
  useNavigation,
} from '@react-navigation/native';
import _, {isEmpty} from 'lodash';
import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../../store/languageStore';
import {MainStackParamList} from '../../../../../types/navigation';
import {isSpanishLocale, isValidJSON} from '../../../../../utils/methods';
import {errorToast} from '../../../../../utils/toast';
// import {notifyApi} from '../../../../api/user';
import BackgroundImage from '../../../../components/BackgroundImage';
import Navbar from '../../../../components/Navbar';
import RoundedButton from '../../../../components/RoundedButton';
import {QuestionnaireSkeleton} from '../../../../components/Skeleton';
import CustomText from '../../../../components/Text';
import {
  ENGLISH_NONE_OF_THE_ABOVE,
  SPANISH_NONE_OF_THE_ABOVE,
} from '../../../../constants/enums';
// import useGetOnboarding from '../../../../hooks/api/useGetOnboarding';
import useGetQuestions, {
  useCheckQuestinnaireStatus,
} from '../../../../hooks/api/useGetQuestions';
import usePostOnboardingSteps from '../../../../hooks/api/usePostOnboardingSteps';
import usePostQuestions from '../../../../hooks/api/usePostQuestions';
import useFullPageLoader from '../../../../hooks/useFullPageLoader';
// import {OnboardingResponse} from '../../Login/type';
import {DropdownQuestion} from './components/DropDownQuestion';
import {InputQuestion} from './components/InputQuestion';
import QuestionnaireSummary from './Summary';
import {Choice, Question, SelectedAnswers} from './type';

const isNoneOfTheAbove = (item: Choice) => {
  return (
    item === ENGLISH_NONE_OF_THE_ABOVE || item === SPANISH_NONE_OF_THE_ABOVE
  );
};

const handleNoneOfTheAboveSelection = (questionId: string): SelectedAnswers => {
  const updatedValue: SelectedAnswers = {
    question_id: questionId,
    choice_value: [ENGLISH_NONE_OF_THE_ABOVE],
    spanish_choice_value: [SPANISH_NONE_OF_THE_ABOVE],
  };

  return updatedValue;
};

const removeNoneOfTheAboveIfOtherSelected = (
  selectedAnswer: SelectedAnswers,
): SelectedAnswers => {
  return {
    ...selectedAnswer,
    choice_value: _.castArray(selectedAnswer.choice_value).filter(
      option => option !== ENGLISH_NONE_OF_THE_ABOVE,
    ),
    spanish_choice_value: _.castArray(
      selectedAnswer.spanish_choice_value,
    ).filter(option => option !== SPANISH_NONE_OF_THE_ABOVE),
  };
};

const updateAnswer = (
  selectedAnswers: SelectedAnswers,
  currentSelectedEnglishOption: Choice,
  currentSelectedSpanishOption: Choice,
) => {
  const updatedAnswer = _.cloneDeep(selectedAnswers);

  const updateValues = (key: string, currentSelectedOption: Choice) => {
    const values = _.castArray(_.get(updatedAnswer, key, []));

    const exists = values.some(option => {
      if (_.isObject(option) && _.isObject(currentSelectedOption)) {
        const optionKey = Object.keys(option)[0];
        const currentSelectedOptionKey = Object.keys(currentSelectedOption)[0];
        return optionKey === currentSelectedOptionKey;
      }
      return _.isEqual(option, currentSelectedOption);
    });

    return exists
      ? values.filter(option => {
          if (_.isObject(option) && _.isObject(currentSelectedOption)) {
            const optionKey = Object.keys(option)[0];
            const currentSelectedOptionKey = Object.keys(
              currentSelectedOption,
            )[0];
            return optionKey !== currentSelectedOptionKey;
          }
          return !_.isEqual(option, currentSelectedOption);
        })
      : [...values, currentSelectedOption];
  };

  updatedAnswer.choice_value = updateValues(
    'choice_value',
    currentSelectedEnglishOption,
  );
  updatedAnswer.spanish_choice_value = updateValues(
    'spanish_choice_value',
    currentSelectedSpanishOption,
  );

  return updatedAnswer;
};

// const isMilestoneCompleted = (
//   onboarding: OnboardingResponse | undefined,
//   milestone: string,
// ) => {
//   if (!onboarding) {
//     return false;
//   }
//   return _.some(onboarding?.data, {milestone_tag: milestone});
// };

type AdditionalDetailRoute = RouteProp<MainStackParamList, 'AdditionalDetail'>;

interface AdditionalDetailProps {
  route: AdditionalDetailRoute;
}

const AdditionalDetails = ({route}: AdditionalDetailProps) => {
  const {isNewUser} = route?.params || {};
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const isSpanish = isSpanishLocale();

  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>();
  const [isEditing, setIsEditing] = useState(false);
  const [shouldShowSummary, setShouldShowSummary] = useState(false);

  const {
    data: status,
    isLoading: isStatusLoading,
    refetch: getQuestionnaireStatus,
  } = useCheckQuestinnaireStatus({
    questionSequence: null,
    retrieve_type: 'completion_status',
  });

  const {data: questions, isLoading} = useGetQuestions({
    enabled: status?.completionFlag === false,
  });
  const {mutateAsync: postOnboardingStep} = usePostOnboardingSteps();
  const {mutateAsync: postAdditionalQuestions, isPending: isSavingQuestions} =
    usePostQuestions({
      onMutate: showLoader,
      onSuccess: async data => {
        if (isEmpty(data) && isNewUser) {
          return navigation.navigate('FaceScan');
        }

        if (isEmpty(data) || isEditing) {
          return onChangeEditing(true);
        }

        if (status?.startFlag === false) {
          getQuestionnaireStatus();
          if (isNewUser) {
            await postOnboardingStep({milestone: 'questionair'});
          }
        }

        const updatedQuestion = {
          created_at: data?.created_at,
          lastmodified_at: data?.lastmodified_at,
          q_id: data?.q_id,
          eng_question: data?.eng_question,
          spanish_question: data?.spanish_question,
          question_type: data?.question_type,
          multi_select: data?.multi_select,
          question_sequence: data?.question_sequence,
          eng_choices: isValidJSON(data?.eng_choices)
            ? JSON.parse(data?.eng_choices)
            : [],
          spanish_choices: isValidJSON(data?.spanish_choices)
            ? JSON.parse(data?.spanish_choices)
            : [],
        };
        setCurrentQuestion(updatedQuestion);

        if (data?.user_eng_choices || data?.user_spanish_choices) {
          let choice_value = '';
          let spanish_choice_value = '';

          if (!data?.skip_flag) {
            choice_value = isValidJSON(data?.user_eng_choices)
              ? JSON.parse(data?.user_eng_choices)
              : data?.user_eng_choices;
            spanish_choice_value = isValidJSON(data?.user_spanish_choices)
              ? JSON.parse(data?.user_spanish_choices)
              : data?.user_spanish_choices;
          }
          setSelectedAnswers({
            question_id: data.q_id,
            answer_id: data?.answer_id,
            choice_value,
            spanish_choice_value,
          });
        } else {
          setSelectedAnswers(undefined);
        }
      },
      onError: () => {
        errorToast('Failed to save questions. Please try again.');
      },
      onSettled: hideLoader,
    });

  useEffect(() => {
    if (questions) {
      setCurrentQuestion(questions);
    }
  }, [questions]);

  useEffect(() => {
    if (status?.completionFlag) {
      setShouldShowSummary(status?.completionFlag);
    }
  }, [status]);

  const getOptionsInEnglishAndSpanish = ({
    selectedItem,
  }: {
    selectedItem: Choice;
  }) => {
    if (!currentQuestion) {
      return {
        currentEnglishOptions: [],
        currentSpanishOptions: [],
        selectedOptionIdx: null,
      };
    }

    const findOptionIndex = (choices: any[], item: any) =>
      choices.findIndex(
        each =>
          each === item ||
          (typeof each === 'object' &&
            typeof item === 'object' &&
            Object.keys(each)?.[0] === Object.keys(item)?.[isSpanish ? 1 : 0]),
      );

    const selectedOptionIdx = isSpanish
      ? findOptionIndex(currentQuestion.spanish_choices, selectedItem)
      : findOptionIndex(currentQuestion.eng_choices, selectedItem);

    const getFirstItemIfArray = (option: Choice) => {
      if (_.isObject(option)) {
        const key = Object.keys(option)[0];
        const value = option[key];
        if (Array.isArray(value)) {
          return {[key]: [value[0]]};
        }
      }
      return option;
    };

    return {
      currentSelectedEnglishOption: getFirstItemIfArray(
        currentQuestion.eng_choices[selectedOptionIdx],
      ),
      currentSelectedSpanishOption: getFirstItemIfArray(
        currentQuestion.spanish_choices[selectedOptionIdx],
      ),
    };
  };

  const handleSetAnswers = (ans: any) => {
    let updatedAns = ans;
    if (selectedAnswers?.answer_id) {
      updatedAns = {
        ...updatedAns,
        answer_id: selectedAnswers?.answer_id,
      };
    }
    setSelectedAnswers(updatedAns);
  };

  const handleDropdownSelectedAnswers = ({
    questionId,
    selectedItem,
    multiSelect,
  }: {
    questionId: string;
    selectedItem: Choice;
    multiSelect: boolean;
  }) => {
    const {currentSelectedEnglishOption, currentSelectedSpanishOption} =
      getOptionsInEnglishAndSpanish({
        selectedItem,
      });

    if (!currentSelectedEnglishOption || !currentSelectedSpanishOption) {
      return;
    }

    let updatedAnswers = _.cloneDeep(selectedAnswers);

    if (isNoneOfTheAbove(selectedItem)) {
      updatedAnswers = handleNoneOfTheAboveSelection(questionId);
    } else {
      if (!updatedAnswers || !multiSelect) {
        updatedAnswers = {
          question_id: questionId,
          choice_value: [currentSelectedEnglishOption],
          spanish_choice_value: [currentSelectedSpanishOption],
        };
      } else if (multiSelect) {
        updatedAnswers = updateAnswer(
          updatedAnswers,
          currentSelectedEnglishOption,
          currentSelectedSpanishOption,
        );
      }
      updatedAnswers = removeNoneOfTheAboveIfOtherSelected(updatedAnswers);
    }

    if (selectedAnswers?.answer_id) {
      updatedAnswers.answer_id = selectedAnswers?.answer_id;
    }

    setSelectedAnswers(updatedAnswers);
  };

  const handleInputAnswers = ({
    questionId,
    answer,
  }: {
    questionId: string;
    answer: string;
  }) => {
    setSelectedAnswers({
      ...selectedAnswers,
      question_id: questionId,
      choice_value: answer,
      spanish_choice_value: answer,
    });
  };

  const handleSave = async () => {
    if (
      typeof currentQuestion?.question_sequence !== 'number' ||
      !selectedAnswers
    ) {
      return errorToast(languages?.generic_error_message);
    }
    await postAdditionalQuestions({
      hasAnswers: !!selectedAnswers?.answer_id,
      data: selectedAnswers,
      question_sequence: currentQuestion?.question_sequence,
      retrieve_type: 'latest',
    });
  };

  const handlePrevious = async () => {
    if (typeof currentQuestion?.question_sequence !== 'number') {
      return errorToast(languages?.generic_error_message);
    }
    await postAdditionalQuestions({
      hasAnswers: !!selectedAnswers?.answer_id,
      data: null,
      question_sequence: currentQuestion?.question_sequence,
      retrieve_type: 'previous',
    });
  };

  const handleSkip = async () => {
    if (typeof currentQuestion?.question_sequence !== 'number') {
      return errorToast(languages?.generic_error_message);
    }
    let payload: SelectedAnswers = {
      question_id: currentQuestion?.q_id,
      choice_value: selectedAnswers?.answer_id
        ? selectedAnswers?.choice_value
        : '',
      spanish_choice_value: selectedAnswers?.answer_id
        ? selectedAnswers?.spanish_choice_value
        : '',
    };
    if (selectedAnswers?.answer_id) {
      payload.answer_id = selectedAnswers?.answer_id;
    }
    await postAdditionalQuestions({
      hasAnswers: !!selectedAnswers?.answer_id,
      data: payload,
      question_sequence: currentQuestion?.question_sequence,
      skip_flag: true,
      retrieve_type: 'latest',
    });
  };

  const renderQuestionAnswer = (ques: Question, questionNumber: number) => {
    if (ques.question_type === 'textbox') {
      return (
        <InputQuestion
          question={isSpanish ? ques.spanish_question : ques?.eng_question}
          questionNumber={questionNumber}
          questionId={ques.q_id}
          handleSelectedAnswers={handleInputAnswers}
          value={
            !Array.isArray(selectedAnswers?.choice_value)
              ? selectedAnswers?.choice_value ?? ''
              : ''
          }
        />
      );
    }
    if (ques.question_type === 'dropdown') {
      return (
        <DropdownQuestion
          currentQuestion={ques}
          question={isSpanish ? ques.spanish_question : ques?.eng_question}
          data={isSpanish ? ques.spanish_choices : ques?.eng_choices}
          questionNumber={questionNumber}
          questionId={ques.q_id}
          multiSelect={ques.multi_select}
          handleSelectedAnswers={handleDropdownSelectedAnswers}
          handleSetAnswers={handleSetAnswers}
          selectedAnswers={selectedAnswers}
        />
      );
    }
    return <></>;
  };

  const changeCurrentQuestion = (question: Question) => {
    setCurrentQuestion(question);
  };

  const onChangeEditing = (editing: boolean) => {
    setIsEditing(!editing);
    setShouldShowSummary(editing);
  };

  const onUpdateSelectedAnswers = (updatedAnswers: SelectedAnswers) => {
    setSelectedAnswers(updatedAnswers);
  };

  if (isLoading || isStatusLoading) {
    return (
      <SafeAreaView className="h-full">
        <View className="p-4">
          <Navbar />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.contentContainer}>
          <QuestionnaireSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (shouldShowSummary) {
    return (
      <QuestionnaireSummary
        changeCurrentQuestion={changeCurrentQuestion}
        onChangeEditing={onChangeEditing}
        onUpdateSelectedAnswers={onUpdateSelectedAnswers}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView className="h-full">
        <View className="p-4">
          <Navbar />
        </View>
        <View className="flex-1 items-center justify-center">
          <CustomText className="text-xl font-isidoraSemiBold">
            {languages?.['No Questions']}
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <BackgroundImage className="flex-1 p-4">
      <SafeAreaView className="h-full">
        <Navbar
          noBack={isNewUser === true}
          hasClose={isNewUser === true}
          handleClose={async () => {
            showLoader();
            await postOnboardingStep({milestone: 'questionair'});
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'FaceScan'}],
              }),
            );
            hideLoader();
          }}
        />
        <View style={styles.keyboardAwareContentContainer}>
          <View className="mb-4 mt-10 flex-1">
            {renderQuestionAnswer(
              currentQuestion,
              currentQuestion?.question_sequence,
            )}
          </View>

          {isEditing ? (
            <View className="flex-row space-x-4 justify-center">
              <RoundedButton
                resetStyle
                className="bg-ultramarineBlue py-2 px-10"
                onPress={() => onChangeEditing(true)}>
                <CustomText className="text-lg text-white font-isidoraSemiBold">
                  {languages?.goBackTxt}
                </CustomText>
              </RoundedButton>
              <RoundedButton
                resetStyle
                className="bg-ultramarineBlue py-2 px-10"
                onPress={handleSave}
                disabled={
                  isSavingQuestions ||
                  isEmpty(selectedAnswers?.choice_value) ||
                  isEmpty(selectedAnswers?.spanish_choice_value)
                }>
                <CustomText className="text-lg text-white font-isidoraSemiBold">
                  {languages?.update}
                </CustomText>
              </RoundedButton>
            </View>
          ) : (
            <>
              <View className="flex-row space-x-4 justify-center">
                <RoundedButton
                  resetStyle
                  className="bg-ultramarineBlue py-2 px-10"
                  onPress={handlePrevious}
                  disabled={
                    isSavingQuestions ||
                    currentQuestion?.question_sequence === 1
                  }>
                  <CustomText className="text-lg text-white font-isidoraSemiBold">
                    {languages?.previous}
                  </CustomText>
                </RoundedButton>
                <RoundedButton
                  resetStyle
                  className="bg-ultramarineBlue py-2 px-10"
                  onPress={handleSave}
                  disabled={
                    isSavingQuestions ||
                    isEmpty(selectedAnswers?.choice_value) ||
                    isEmpty(selectedAnswers?.spanish_choice_value)
                  }>
                  <CustomText className="text-lg text-white font-isidoraSemiBold">
                    {languages?.next}
                  </CustomText>
                </RoundedButton>
              </View>
              <RoundedButton
                resetStyle
                className="bg-transparent my-2 self-center px-10 py-2"
                onPress={handleSkip}
                disabled={isSavingQuestions}>
                <CustomText className="text-lg  text-gray-700 font-isidoraSemiBold underline">
                  {languages?.skip}
                </CustomText>
              </RoundedButton>
            </>
          )}
        </View>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default AdditionalDetails;

const styles = StyleSheet.create({
  container: {},
  dropdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  contentContainer: {alignItems: 'center'},
  keyboardAwareContentContainer: {
    // height: '100%',
    flexGrow: 1,
  },
});
