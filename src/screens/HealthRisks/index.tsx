import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Image, View} from 'moti';
import React, {useEffect} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useHealthRiskStore from '../../../store/healthRisksStore';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {transformQuestionData} from '../../../utils/methods';
import {executeRiskEngine, getHealthRisks} from '../../api/healthRisks';
import AnimatedWrapper from '../../components/AnimatedWrapper';
import BackgroundImage from '../../components/BackgroundImage';
import {Loader} from '../../components/FullScreenLoader';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {EXECUTE_RISK_ENGINE, HYPERTENSION_RISK} from '../../constants/hooks';
import customColor from '../../theme/customColor';

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

type HealthRiskRouteProp = RouteProp<MainStackParamList, 'HealthRisks'>;

interface HealthRiskProps {
  route: HealthRiskRouteProp;
}

const HealthRisks = ({route}: HealthRiskProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {type} = route?.params ?? {type: ''};

  useEffect(() => {
    if (type === 'hypertension_risk' || type === 'diabetes_risk') {
      setEngineName(type);
      fetchHealthRisks({risk_type: type});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const {languages} = useLanguageStore();
  const {setCurrentQuestion, setEngineName, setViewRiskDetails} =
    useHealthRiskStore();

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

  const {mutateAsync: fetchHealthRisks, isPending} = useMutation({
    // onMutate: showLoader,
    mutationKey: [HYPERTENSION_RISK],
    mutationFn: getHealthRisks,
    // onSettled: hideLoader,
    onSuccess: async (riskDetails, variable) => {
      const {risk_type} = variable;
      if (riskDetails?.screen_name === 'questionnaire') {
        const updatedQuestions = transformQuestionData([riskDetails?.data]);
        setCurrentQuestion(updatedQuestions);
        navigation.navigate('HealthRisksQuestionnaire');
      }
      if (riskDetails?.screen_name === 'generate_risk_score') {
        await executeRiskEngineMutation({
          risk_type,
        });
      }
    },
    onError: error => {
      console.log('error', error);
    },
  });

  const MENU_ITEM = [
    {
      name: languages?.hypertension_risk_title,
      icon: 'personal_report',
      description: languages?.hypertension_risk_description,
      action: () => {
        setEngineName('hypertension_risk');
        fetchHealthRisks({risk_type: 'hypertension_risk'});
      },
      disabled: false,
    },
    {
      name: languages?.diabetes_risk_title,
      icon: 'lab_result',
      description: languages?.diabetes_risk_description,
      action: () => {
        setEngineName('diabetes_risk');
        fetchHealthRisks({risk_type: 'diabetes_risk'});
      },
      disabled: false,
    },
  ];

  const handleBackClick = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomepageStackScreens', {
        screen: 'Home',
      });
    }
  };

  if (isPending) {
    return (
      <AnimatedWrapper isTranslateY={false} className="h-full">
        <BackgroundImage className="grow justify-center items-center">
          <CustomText className="font-isidoraSemiBold text-lg">
            {languages?.health_risks_loading}
          </CustomText>
          <Loader name="6-dots" color={customColor.ultramarineBlue} />
        </BackgroundImage>
      </AnimatedWrapper>
    );
  }

  return (
    <View className="bg-white h-full">
      <SafeAreaScrollView contentContainerStyle={styles.contentContainer}>
        <View className="p-4">
          <Navbar onBackClick={handleBackClick} />
        </View>
        <CustomText className="text-xl font-isidoraBold text-center">
          {languages?.health_risks_report_title}
        </CustomText>

        <View className="flex-1 mt-4">
          <Image
            source={require('../../../assets/images/health_risks.png')}
            style={styles.imageStyle}
            from={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1000, type: 'timing'} as any}
          />
          <CustomText className="text-sm text-center mt-4 px-8">
            {languages?.health_risks_description}
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

export default HealthRisks;

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
