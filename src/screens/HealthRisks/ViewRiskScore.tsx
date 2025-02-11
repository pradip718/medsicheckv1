import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {PropsWithChildren, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Card} from 'react-native-paper';
import {twMerge} from 'tailwind-merge';
import {MainStackParamList} from '../../../types/navigation';
import {isAndroid} from '../../../utils';
import AnimatedWrapper from '../../components/AnimatedWrapper';
import BasicContainer from '../../components/BasicContainer';
import Icon from '../../components/Icon';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';

type CollapsibleCardProps = {
  title: string;
  iconName: string;
  classNameValue?: string;
};

const CollapsibleCard = ({
  children,
  title,
  iconName,
  classNameValue,
}: PropsWithChildren<CollapsibleCardProps>) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <Card className={twMerge('p-4 bg-white', classNameValue)}>
      <TouchableOpacity
        className="flex-row justify-between items-center"
        onPress={() => setIsExpanded(!isExpanded)}>
        <View className="space-x-2 flex-row items-center">
          {!!iconName && <Icon name={iconName} size={20} />}
          <CustomText className="font-isidoraSemiBold text-base">
            {title}
          </CustomText>
        </View>
        <Icon name={isExpanded ? 'expand' : 'collapse'} size={12} />
      </TouchableOpacity>
      {isExpanded && <View className="pt-4">{children}</View>}
    </Card>
  );
};

const ViewRiskScore = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  return (
    <BasicContainer className="grow">
      <StatusBar backgroundColor="#242E49" barStyle="light-content" />
      <SafeAreaView className="bg-[#242E49] rounded-b-[32px]">
        <View className={twMerge('px-4 pt-10', !isAndroid && 'pt-2')}>
          {navigation?.canGoBack() && (
            <TouchableOpacity
              className="bg-[#3D4966] self-start p-4 rounded-lg"
              onPress={navigation.goBack}>
              <Icon name="back" color="#fff" size={16} />
            </TouchableOpacity>
          )}
          <CustomText className="text-white text-3xl font-isidoraSemiBold mt-6">
            Hypertension Risk
          </CustomText>

          <View className="flex-row space-x-4 my-4">
            <AnimatedWrapper
              isTranslateY={false}
              className="bg-[#FFE4E6] p-2 rounded-lg flex-row items-center space-x-2">
              <Icon name="heart" color="#9f1239" size={20} />
              <CustomText className="text-[#9f1239] font-isidoraMedium">
                High Risk
              </CustomText>
            </AnimatedWrapper>
            <AnimatedWrapper
              isTranslateY={false}
              className="bg-[#fef3c7] p-2 rounded-lg flex-row items-center space-x-2">
              <Icon name="heart" color="#9f1239" size={20} />
              <CustomText className="text-[#92400e] font-isidoraMedium">
                48% chances
              </CustomText>
            </AnimatedWrapper>
          </View>
        </View>
      </SafeAreaView>
      <SafeAreaView className="bg-[#f2f5f9] flex-1">
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <CollapsibleCard title="Result" iconName="heart">
            <CustomText className="text-sm">
              [Name of Patient], your likelihood of currently suffering from
              prehypertension and/or of developing hypertension within the next
              4 years is [High/Very High/Extremely High]. This indicates a
              significant risk of sustained elevated blood pressure, which can
              have serious effects on various organs and systems. However, with
              prompt action and lifestyle changes, you can greatly reduce your
              risk and improve your health.
            </CustomText>
          </CollapsibleCard>

          <CollapsibleCard
            title="Medical Referrals"
            iconName="heart"
            classNameValue="mt-8">
            <View className="flex-row">
              <CheckBox />
              <CustomText className="text-sm">
                Schedule a check-up with your primary care physician within the
                next week to develop a risk management plan.
              </CustomText>
            </View>
            <View className="flex-row mt-2">
              <CheckBox />
              <CustomText className="text-sm">
                Book an appointment with a cardiologist for a thorough
                cardiovascular evaluation.
              </CustomText>
            </View>
          </CollapsibleCard>

          <CollapsibleCard
            title="Lab Tests"
            iconName="heart"
            classNameValue="mt-8">
            <CustomText className="text-sm border-b border-b-[#E5E7EB] pb-4">
              Complete a Comprehensive Metabolic Panel (CMP) and lipid profile
              twice a year to monitor blood glucose sugar, cholesterol, and
              kidney function, especially if your health status changes.
            </CustomText>
            <CustomText className="text-sm pt-4">
              Remember you can upload your lab test results into MedsiCheck for
              record keeping and to generate a smart report with a personalized
              interpretation.  
            </CustomText>
          </CollapsibleCard>
          <CollapsibleCard
            title="Periodic Monitoring"
            iconName="heart"
            classNameValue="mt-8">
            <CustomText className="text-sm">
              Use MedsiCheck daily to monitor your Blood Pressure, Hemoglobin
              A1C, and Stress Levels. This frequent monitoring will help ensure
              these metrics remain within healthy ranges. If readings are above
              160/100mmHg consult your physician as soon as possible.
            </CustomText>
            <RoundedButton text="Measure Now" className="mt-4" />
          </CollapsibleCard>

          <CollapsibleCard
            title="Lifestyle Recommendations"
            iconName="heart"
            classNameValue="mt-8">
            <Card className="p-4 bg-[#F3F4F6]">
              <View className="flex-row items-center justify-between">
                <Icon name="heart" size={20} />
                <CustomText className="font-isidoraSemiBold text-base">
                  Diet
                </CustomText>
              </View>
              <CustomText className="text-sm text-[#4B5363] pt-4">
                Follow the DASH or Mediterranean diet strictly. Focus on whole,
                minimally processed foods, and limit alcohol to one drink per
                day.
              </CustomText>
            </Card>
            <Card className="mt-4 p-4 bg-[#F3F4F6]">
              <View className="flex-row items-center justify-between">
                <Icon name="heart" size={20} />
                <CustomText className="font-isidoraSemiBold text-base">
                  Exercise
                </CustomText>
              </View>
              <CustomText className="text-sm text-[#4B5363] pt-4">
                Follow the DASH or Mediterranean diet strictly. Focus on whole,
                minimally processed foods, and limit alcohol to one drink per
                day.
              </CustomText>
            </Card>
          </CollapsibleCard>

          <Card className="bg-[#222B45] mt-4">
            <CustomText className="text-white font-isidoraMedium p-4 text-sm">
              By taking these steps, you can work towards maintaining a
              healthier, more comfortable lifestyle. Prompt action will make a
              significant difference!
            </CustomText>
          </Card>
          <CollapsibleCard
            title="How did we calculate this?"
            iconName="heart"
            classNameValue="mt-4">
            <CustomText className="text-sm text-[#4B5363] pt-4">
              to be filled...
            </CustomText>
          </CollapsibleCard>

          <Card className="mt-4 p-4 bg-white">
            <CustomText className="font-isidoraSemiBold text-base text-center">
              Rate Our Report
            </CustomText>
            <CustomText className="text-base text-center text-[#4B5563] pt-2">
              Help us improve our platform by giving an honest feedback.
            </CustomText>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default ViewRiskScore;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
