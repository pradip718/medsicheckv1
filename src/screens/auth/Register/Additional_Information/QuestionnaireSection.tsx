import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Image} from 'moti';
import React from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import useLanguageStore from '../../../../../store/languageStore';
import useQuestionStore from '../../../../../store/questionStore';
import {MainStackParamList} from '../../../../../types/navigation';
import BackgroundImage from '../../../../components/BackgroundImage';
import EtchedGlass from '../../../../components/EtchedGlass';
import Icon from '../../../../components/Icon';
import Navbar from '../../../../components/Navbar';
import RoundedButton from '../../../../components/RoundedButton';
import SafeAreaScrollView from '../../../../components/SafeAreaScrollView';
import {QuestionnaireSkeleton} from '../../../../components/Skeleton';
import CustomText from '../../../../components/Text';
import {useGetQuestionnaireSection} from '../../../../hooks/api/useGetQuestions';
import usePostOnboardingSteps from '../../../../hooks/api/usePostOnboardingSteps';
import useFullPageLoader from '../../../../hooks/useFullPageLoader';
import {SectionStats} from './type';

type QuestionnaireSectionRoute = RouteProp<
  MainStackParamList,
  'QuestionnaireSection'
>;

interface QuestionnaireSectionProps {
  route: QuestionnaireSectionRoute;
}

const getProgressValue = ({
  total_questions,
  total_answered,
}: {
  total_questions: number;
  total_answered: number;
}) => (total_questions > 0 ? total_answered / total_questions : 0);

const QuestionnaireSection = ({route}: QuestionnaireSectionProps) => {
  const {isNewUser} = route?.params || {};
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const {showLoader, hideLoader} = useFullPageLoader();

  const {languages} = useLanguageStore();
  const {setCurrentSection, setCurrentConfiguration} = useQuestionStore();

  const {data: questions, isLoading} = useGetQuestionnaireSection({
    cacheTime: 0,
    staleTime: isNewUser ? Infinity : 0,
  });

  const {mutateAsync: postOnboardingStep} = usePostOnboardingSteps();

  const {mutateAsync: onContinuePress} = useMutation({
    onMutate: showLoader,
    mutationFn: async () => {
      await postOnboardingStep({milestone: 'questionair'});
    },
    onSuccess: () => {
      return navigation.navigate('FaceScan');
    },
    onSettled: hideLoader,
  });

  const isAllAnswered = questions?.sectionStats?.every(
    section => section.total_answered === section.total_questions,
  );

  const completedSections = questions?.sectionStats.filter(
    section => section.total_answered === section.total_questions,
  ).length;

  const handleSectionSelection = (section: SectionStats) => {
    setCurrentSection(section);
    if (questions?.questionnaireSetting) {
      setCurrentConfiguration(questions?.questionnaireSetting);
    }
    navigation.navigate('AdditionalDetail');
  };

  const getProgressMessage = () => {
    switch (completedSections) {
      case 1:
        return languages?.['1_section_completion_message'];
      case 2:
        return languages?.['2_section_completion_message'];
      case 3:
        return languages?.['3_section_completion_message'];
      case 4:
        return languages?.['4_section_completion_message'];
      default:
        return `${languages?.questionnaire_section_header_1}\n\n${languages?.questionnaire_section_header_2}`;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="h-full">
        <View className="p-4">
          <Navbar noBack={isNewUser} />
        </View>
        <QuestionnaireSkeleton />
      </SafeAreaView>
    );
  }
  return (
    <BackgroundImage className="flex-1">
      <SafeAreaScrollView>
        <View className="p-4">
          <Navbar />
        </View>

        <EtchedGlass
          className="rounded-none"
          cardContentContainerClassName="py-4">
          <CustomText className="font-isidoraSemiBold text-base text-center text-midnight">
            {languages?.additional_info_header}
          </CustomText>
        </EtchedGlass>
        <View className="mt-4 px-10">
          <CustomText className="text-sm text-center text-midnight font-isidoraSemiBold ">
            {getProgressMessage()}
          </CustomText>
        </View>
        <View className="px-6 mt-8">
          {questions?.sectionStats?.map((section, idx) => (
            <TouchableOpacity
              key={`${section.section_name}-${idx}`}
              className="mb-8"
              activeOpacity={0.4}
              onPress={() => handleSectionSelection(section)}>
              <EtchedGlass
                className="px-0 rounded-b-none"
                cardContentContainerClassName="px-0 py-0 pt-4"
                cardContentClassName="px-0">
                <View className="flex-row items-center space-x-2 px-6 py-4 ">
                  <View className="w-4/5 flex-row space-x-2">
                    <Image
                      source={{uri: section?.icon_url ?? ''}}
                      className="w-6"
                      resizeMode="contain"
                      from={{translateX: -100}}
                      animate={{translateX: 0}}
                      transition={{type: 'timing', duration: 1000} as any}
                    />
                    <CustomText className="text-lg text-[#1E3180] font-isidoraSemiBold">
                      {section.section_name}
                    </CustomText>
                  </View>
                  <View className="flex-grow	items-end">
                    {section.total_answered === section?.total_questions ? (
                      <Icon name="checkmark" color="#01A35F" size={32} />
                    ) : (
                      <CustomText>
                        {section.total_answered}/{section?.total_questions}
                      </CustomText>
                    )}
                  </View>
                </View>

                <View className="flex-grow">
                  <ProgressBar
                    progress={getProgressValue({
                      total_questions: section?.total_questions,
                      total_answered: section?.total_answered,
                    })}
                    color={'#01A35F'}
                    className="h-2 bg-slate-300"
                  />
                </View>
              </EtchedGlass>
            </TouchableOpacity>
          ))}
        </View>
        {isNewUser && (
          <View className="px-10 items-center space-x-4">
            {!isAllAnswered && (
              <View className="flex-row items-center space-x-2 my-2">
                <Icon name="information" className="text-slate-500" />
                <Text className="text-sm italic text-slate-500">
                  {languages?.questionnaire_footer_note}
                </Text>
              </View>
            )}
            <RoundedButton
              disabled={!isAllAnswered}
              onPress={() => onContinuePress()}>
              <CustomText className="text-white font-isidoraSemiBold text-base">
                {languages?.continue}
              </CustomText>
            </RoundedButton>
          </View>
        )}
      </SafeAreaScrollView>
    </BackgroundImage>
  );
};

export default QuestionnaireSection;
