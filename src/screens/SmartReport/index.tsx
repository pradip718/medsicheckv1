import {
  DrawerActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {Image, View} from 'moti';
import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {useGetLabReportQuestionnaire} from '../../hooks/api/report';
import useGetAIQuestionnaire from '../../hooks/api/useGetAIQuestionnaire';
import useFullPageLoader from '../../hooks/useFullPageLoader';

const MenuItem = ({
  name,
  description,
  action,
  disabled,
}: {
  name: string;
  description: string;
  icon?: string;
  action: (() => void) | undefined;
  disabled: boolean;
}) => {
  return (
    <TouchableOpacity
      className={twMerge(
        'flex-row items-center px-4 pt-4 pb-8 justify-between space-x-2 border-b border-[#EBEEF2]',
      )}
      onPress={action}
      disabled={disabled}>
      <View className="h-full pt-1">
        <Icon name={'checkmark'} size={20} color={'#10A4B1'} />
      </View>
      <View className="flex-1">
        <CustomText
          className={twMerge(
            'text-base font-isidoraMedium text-[#303133]',
            disabled ? 'text-slate-400' : '',
          )}>
          {name}
        </CustomText>
        <CustomText
          className={twMerge(
            'text-sm text-[#8F9499]',
            disabled ? 'text-slate-400' : '',
          )}>
          {description}
        </CustomText>
      </View>
      <Icon name={'chevron-right'} size={20} color={'#10A4B1'} />
    </TouchableOpacity>
  );
};

const SmartReport = () => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {refetch: getAIQuestions} = useGetAIQuestionnaire({
    type: 'latest',
    gcTime: 0,
    staleTime: 0,
    enabled: false,
  });
  const {refetch: getLabReportQuestions} = useGetLabReportQuestionnaire({
    type: 'latest',
    gcTime: 0,
    staleTime: 0,
    enabled: false,
  });

  const MENU_ITEM = [
    {
      name: languages?.personal_health_report_description,
      icon: 'personal_report',
      description: languages?.personalized_health_assessment_description,
      action: async () => {
        showLoader();
        await getAIQuestions();
        navigation.navigate('PersonalisedAI');
        hideLoader();
      },
      disabled: false,
    },
    {
      name: languages?.interpret_lab_results,
      icon: 'lab_result',
      description: languages?.upload_test_results_description,
      action: async () => {
        showLoader();
        await getLabReportQuestions();
        navigation.navigate('LabReport');
        hideLoader();
      },
      disabled: false,
    },
  ];

  const handleBackClick = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };
  return (
    <View className="bg-white h-full">
      <SafeAreaScrollView contentContainerStyle={styles.contentContainer}>
        <View className="p-4">
          <Navbar onBackClick={handleBackClick} />
        </View>
        <CustomText className="text-xl font-isidoraBold text-center">
          {languages?.smart_report_title}
        </CustomText>

        <View className="flex-1 mt-4">
          <Image
            source={require('../../../assets/images/smart_report.png')}
            style={styles.imageStyle}
            from={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1000, type: 'timing'} as any}
          />
          <CustomText className="text-sm text-center mt-4 px-8">
            {languages?.smart_report_description}
          </CustomText>
          {MENU_ITEM?.map((eachMenu, idx) => (
            <View
              className="my-4"
              key={eachMenu?.name}
              from={{opacity: 0.5, translateY: 200}}
              animate={{opacity: 1, translateY: 0}}
              transition={
                {duration: 1000, type: 'timing', delay: idx * 100} as any
              }>
              <MenuItem
                name={eachMenu.name}
                description={eachMenu.description}
                icon={eachMenu.icon}
                action={eachMenu?.action}
                disabled={eachMenu?.disabled || false}
              />
            </View>
          ))}
        </View>
      </SafeAreaScrollView>
    </View>
  );
};

export default SmartReport;

const styles = StyleSheet.create({
  contentContainer: {},
  titleStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  imageStyle: {
    height: 250,
    resizeMode: 'contain',
    aspectRatio: '1/1',
    alignSelf: 'center',
  },
});
