import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import _, {isEmpty} from 'lodash';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import useHealthRiskStore from '../../../../store/healthRisksStore';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {
  isSpanishLocale,
  transformQuestionData,
} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {
  executeRiskEngine,
  postHealthRisksQuestions,
} from '../../../api/healthRisks';
import BackgroundImage from '../../../components/BackgroundImage';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import {
  ENGLISH_NONE_OF_THE_ABOVE,
  SPANISH_NONE_OF_THE_ABOVE,
} from '../../../constants/enums';
import {EXECUTE_RISK_ENGINE} from '../../../constants/hooks';
import useFullPageLoader from '../../../hooks/useFullPageLoader';
import {DropdownQuestion} from '../../auth/Register/Additional_Information/components/DropDownQuestion';
import {InputQuestion} from '../../auth/Register/Additional_Information/components/InputQuestion';
import {NextButton} from '../../auth/Register/Additional_Information/components/QuestionnaireButtons';
import {
  Choice,
  Question,
  SelectedAnswers,
} from '../../auth/Register/Additional_Information/type';
import FaceScan from './FaceScan';

const isNoneOfTheAbove = (item: Choice) => {
  return (
    item === ENGLISH_NONE_OF_THE_ABOVE || item === SPANISH_NONE_OF_THE_ABOVE
  );
};

const handleNoneOfTheAboveSelection = (
  questionId: string,
  selectedAnswers: SelectedAnswers[],
): SelectedAnswers[] => {
  const updatedAnswers = _.cloneDeep(selectedAnswers);
  const index = updatedAnswers.findIndex(
    answer => answer.question_id === questionId,
  );
  const updatedValue: SelectedAnswers = {
    question_id: questionId,
    choice_value: [ENGLISH_NONE_OF_THE_ABOVE],
    spanish_choice_value: [SPANISH_NONE_OF_THE_ABOVE],
  };

  if (index > -1) {
    updatedAnswers[index] = updatedValue;
  } else {
    updatedAnswers.push(updatedValue);
  }
  return updatedAnswers;
};

const removeNoneOfTheAboveIfOtherSelected = (
  selectedAnswers: SelectedAnswers[],
): SelectedAnswers[] => {
  return selectedAnswers.map(selectedAnswer => ({
    ...selectedAnswer,
    // Handle choice_value if it's a string or array
    choice_value:
      typeof selectedAnswer.choice_value === 'string'
        ? selectedAnswer.choice_value // If it's a string, return it as is
        : _.castArray(selectedAnswer.choice_value).filter(
            option => option !== ENGLISH_NONE_OF_THE_ABOVE,
          ),
    // Handle spanish_choice_value if it's a string or array
    spanish_choice_value:
      typeof selectedAnswer.spanish_choice_value === 'string'
        ? selectedAnswer.spanish_choice_value // If it's a string, return it as is
        : _.castArray(selectedAnswer.spanish_choice_value).filter(
            option => option !== SPANISH_NONE_OF_THE_ABOVE,
          ),
  }));
};

const addNewAnswer = (
  selectedAnswers: SelectedAnswers[],
  questionId: string,
  currentSelectedEnglishOption: Choice,
  currentSelectedSpanishOption: Choice,
) => {
  return [
    ...selectedAnswers,
    {
      question_id: questionId,
      choice_value: [currentSelectedEnglishOption],
      spanish_choice_value: [currentSelectedSpanishOption],
    },
  ];
};

const updateAnswer = (
  selectedAnswers: SelectedAnswers[],
  currentSelectedEnglishOption: Choice,
  currentSelectedSpanishOption: Choice,
  questionId: string,
): SelectedAnswers[] => {
  const updatedAnswers = _.cloneDeep(selectedAnswers);

  const index = updatedAnswers.findIndex(
    answer => answer.question_id === questionId,
  );

  const updateValues = (
    key: string,
    currentSelectedOption: Choice,
    answer: SelectedAnswers,
  ) => {
    const values = _.castArray(_.get(answer, key, []));

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

  if (index > -1) {
    // Update the existing answer
    updatedAnswers[index].choice_value = updateValues(
      'choice_value',
      currentSelectedEnglishOption,
      updatedAnswers[index],
    );
    updatedAnswers[index].spanish_choice_value = updateValues(
      'spanish_choice_value',
      currentSelectedSpanishOption,
      updatedAnswers[index],
    );
  } else {
    // Add a new answer for the questionId
    updatedAnswers.push({
      question_id: questionId,
      choice_value: [currentSelectedEnglishOption],
      spanish_choice_value: [currentSelectedSpanishOption],
    });
  }

  return updatedAnswers;
};

const HealthRisksQuestionnaire = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const isSpanish = isSpanishLocale();

  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers[]>();
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>();

  const {
    currentQuestion: questions,
    setCurrentQuestion,
    engine_name,
    setViewRiskDetails,
  } = useHealthRiskStore();

  const {mutateAsync: executeRiskEngineMutation} = useMutation({
    mutationKey: [EXECUTE_RISK_ENGINE],
    mutationFn: executeRiskEngine,
    onSuccess: riskEngineDetails => {
      if (riskEngineDetails?.screen_name === 'view_risk_score') {
        setViewRiskDetails(riskEngineDetails?.data);
        navigation.navigate('ViewRiskScore');
      }
    },
  });

  const {mutateAsync: postAdditionalQuestions, isPending: isSavingQuestions} =
    useMutation({
      onMutate: showLoader,
      mutationFn: postHealthRisksQuestions,
      onSuccess: async healthRiskResponse => {
        const {screen_name, data: questionState} = healthRiskResponse;
        if (screen_name === 'generate_risk_score') {
          await executeRiskEngineMutation({risk_type: engine_name ?? ''});
          return;
        }
        if (screen_name === 'questionnaire') {
          const updatedQuestions = transformQuestionData([questionState]);
          setCurrentQuestion(updatedQuestions);

          if (
            questionState?.user_eng_choices ||
            questionState?.user_spanish_choices
          ) {
            const answer = updatedQuestions
              .filter(question => question.answer_id)
              .map(question => ({
                question_id: question.q_id,
                answer_id: question.answer_id,
                choice_value: question?.user_eng_choices ?? [],
                spanish_choice_value: question?.user_spanish_choices ?? [],
              }));

            setSelectedAnswers(answer);
          } else {
            setSelectedAnswers([]);
          }
        }
      },
      onError: () => {
        errorToast('Failed to save questions. Please try again.');
      },
      onSettled: hideLoader,
    });

  useEffect(() => {
    if (questions) {
      setCurrentQuestions(questions);
      setSelectedAnswers(
        questions
          .filter(question => question.answer_id)
          .map(question => ({
            question_id: question.q_id,
            answer_id: question.answer_id,
            choice_value: question?.user_eng_choices ?? [],
            spanish_choice_value: question?.user_spanish_choices ?? [],
          })),
      );
    }
  }, [questions]);

  const getOptionsInEnglishAndSpanish = ({
    selectedItem,
    question,
  }: {
    selectedItem: Choice;
    question: Question | undefined;
  }) => {
    if (!question) {
      return {
        currentEnglishOptions: [],
        currentSpanishOptions: [],
        selectedOptionIdx: null,
      };
    }

    const indexBasedOnLanguage = isSpanish ? 1 : 0;

    const findOptionIndex = (choices: any[], item: any) => {
      return choices.findIndex(each => {
        if (each === item) {
          return true;
        }

        if (typeof each === 'object' && typeof item === 'object') {
          const eachKey = Object.keys(each)[0];
          const itemKey = Object.keys(item)[indexBasedOnLanguage];
          return eachKey === itemKey;
        }

        return false;
      });
    };

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

    const selectedOptionIdx = isSpanish
      ? findOptionIndex(question.spanish_choices, selectedItem)
      : findOptionIndex(question.eng_choices, selectedItem);

    return {
      currentSelectedEnglishOption: getFirstItemIfArray(
        question.eng_choices[selectedOptionIdx],
      ),
      currentSelectedSpanishOption: getFirstItemIfArray(
        question.spanish_choices[selectedOptionIdx],
      ),
    };
  };

  const handleSetAnswers = (ans: any) => {
    let updatedAns = ans;
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
    const question = currentQuestions?.find(
      eachQuestion => eachQuestion.q_id === questionId,
    );

    const {currentSelectedEnglishOption, currentSelectedSpanishOption} =
      getOptionsInEnglishAndSpanish({
        selectedItem,
        question: question,
      });

    if (!currentSelectedEnglishOption || !currentSelectedSpanishOption) {
      return;
    }

    const index = selectedAnswers?.findIndex(
      answer => answer.question_id === questionId,
    );
    let updatedAnswers = _.cloneDeep(selectedAnswers) ?? [];

    if (isNoneOfTheAbove(selectedItem)) {
      updatedAnswers = handleNoneOfTheAboveSelection(
        questionId,
        selectedAnswers ?? [],
      );
    } else {
      if (index === -1) {
        updatedAnswers = addNewAnswer(
          updatedAnswers ?? [],
          questionId,
          currentSelectedEnglishOption,
          currentSelectedSpanishOption,
        );
      } else if (multiSelect) {
        updatedAnswers = updateAnswer(
          updatedAnswers ?? [],
          currentSelectedEnglishOption,
          currentSelectedSpanishOption,
          questionId,
        );
      } else {
        if (index !== undefined && selectedAnswers) {
          updatedAnswers[index] = {
            ...selectedAnswers[index],
            question_id: questionId,
            choice_value: [currentSelectedEnglishOption],
            spanish_choice_value: [currentSelectedSpanishOption],
          };
        }
      }
      updatedAnswers = removeNoneOfTheAboveIfOtherSelected(
        updatedAnswers ?? [],
      );
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
    setSelectedAnswers(prevAnswers => {
      const updatedAnswers = _.cloneDeep(prevAnswers || []);

      const answerIndex = updatedAnswers.findIndex(
        ans => ans.question_id === questionId,
      );

      if (answerIndex !== -1) {
        updatedAnswers[answerIndex].choice_value = answer;
        updatedAnswers[answerIndex].spanish_choice_value = answer;
      } else {
        updatedAnswers.push({
          question_id: questionId,
          choice_value: answer,
          spanish_choice_value: answer,
        });
      }

      return updatedAnswers;
    });
  };

  const handleSave = async () => {
    if (!selectedAnswers) {
      return errorToast(languages?.generic_error_message);
    }
    let payload = selectedAnswers;
    await postAdditionalQuestions({
      data: payload,
    });
  };

  const submitFacescan = async (choice: string) => {
    if (!choice) {
      return errorToast(languages?.generic_error_message);
    }

    const {currentSelectedEnglishOption, currentSelectedSpanishOption} =
      getOptionsInEnglishAndSpanish({
        selectedItem: choice,
        question: currentQuestions?.[0],
      });

    console.log({
      currentSelectedEnglishOption,
      currentSelectedSpanishOption,
    });

    await postAdditionalQuestions({
      data: [
        {
          question_id: currentQuestions?.[0]?.q_id ?? '',
          //@ts-ignore
          choice_value: currentSelectedEnglishOption ?? '',
          //@ts-ignore
          spanish_choice_value: currentSelectedSpanishOption,
        },
      ],
      scanFlag: true,
    });
  };

  const renderQuestionAnswer = (
    ques: Question,
    questionNumber: number | null,
  ) => {
    if (ques.question_type === 'textbox') {
      const answer = selectedAnswers?.find(
        currentAns => currentAns.question_id === ques.q_id,
      );
      return (
        <InputQuestion
          question={isSpanish ? ques.spanish_question : ques?.eng_question}
          questionNumber={questionNumber}
          questionId={ques.q_id}
          handleSelectedAnswers={handleInputAnswers}
          value={
            !Array.isArray(answer?.choice_value)
              ? answer?.choice_value ?? ''
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
          selectedAnswers={selectedAnswers ?? []}
        />
      );
    }

    if (ques.question_type === 'action') {
      return (
        <FaceScan
          question={isSpanish ? ques.spanish_question : ques?.eng_question}
          //@ts-ignore
          choices={isSpanish ? ques.spanish_choices : ques?.eng_choices}
          submitFacescan={submitFacescan}
        />
      );
    }
    return <></>;
  };

  if (!currentQuestions) {
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
          handleClose={async () => {
            showLoader();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'FaceScan'}],
              }),
            );
            hideLoader();
          }}
        />

        <KeyboardAwareScrollView
          className="mt-10"
          contentContainerStyle={styles.keyboardAwareContentContainer}>
          {currentQuestions?.map((question, index) => (
            <View key={`${question.q_id}-${index + 1}`} className="flex-1">
              <View className="mb-4 mt-2 grow">
                {renderQuestionAnswer(question, null)}
              </View>
            </View>
          ))}
        </KeyboardAwareScrollView>

        <NextButton
          onPress={handleSave}
          disabled={isSavingQuestions || isEmpty(selectedAnswers)}
        />
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default HealthRisksQuestionnaire;

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
