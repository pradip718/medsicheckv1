import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {isString} from 'lodash';
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
import useHealthRiskStore from '../../../store/healthRisksStore';
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
        <Icon
          name={isExpanded ? 'expand' : 'collapse'}
          size={12}
          color="#000"
        />
      </TouchableOpacity>
      {isExpanded && <View className="pt-4">{children}</View>}
    </Card>
  );
};

const ViewRiskScore = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const {engine_name, viewRiskDetails} = useHealthRiskStore();

  const ResultInfo = viewRiskDetails?.report_info?.result;
  const MedicalReferralInfo = viewRiskDetails?.report_info?.medical_referral;
  const LabTestInfo = viewRiskDetails?.report_info?.lab_test;
  const PeriodicMonitoringInfo =
    viewRiskDetails?.report_info?.periodic_monitoring;
  const LifeStyleInfo = viewRiskDetails?.report_info?.lifestyle_recommendation;
  const FooterInfo = viewRiskDetails?.report_info?.footer;
  const scoreInfo = viewRiskDetails?.score_info;

  console.log('ResultInfos', ResultInfo);

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
            {engine_name === 'hypertension_risk' && 'Hypertension Risk'}
            {engine_name === 'diabetes_risk' && 'Diabetes Risk'}
          </CustomText>

          <View className="flex-row space-x-4 my-4">
            {viewRiskDetails?.score_info?.risk_level && (
              <AnimatedWrapper
                isTranslateY={false}
                className="bg-[#FFE4E6] p-2 rounded-lg flex-row items-center space-x-2"
                style={{
                  backgroundColor: scoreInfo?.category_color ?? '#FFE4E6',
                }}>
                <Icon name="risk" color="#9f1239" size={20} />
                <CustomText className="text-[#9f1239] font-isidoraMedium">
                  {scoreInfo?.risk_level}
                </CustomText>
              </AnimatedWrapper>
            )}
            {isString(scoreInfo?.probability) && scoreInfo?.probability && (
              <AnimatedWrapper
                isTranslateY={false}
                className="bg-[#fef3c7] p-2 rounded-lg flex-row items-center space-x-2">
                <Icon name="heart" color="#9f1239" size={20} />
                <CustomText className="text-[#92400e] font-isidoraMedium">
                  {viewRiskDetails?.score_info?.probability}% chances
                </CustomText>
              </AnimatedWrapper>
            )}
          </View>
        </View>
      </SafeAreaView>
      <SafeAreaView className="bg-[#f2f5f9] flex-1">
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {ResultInfo && (
            <CollapsibleCard title={ResultInfo?.name} iconName="result">
              <CustomText className="text-sm">
                {ResultInfo?.body ?? ''}
              </CustomText>
            </CollapsibleCard>
          )}

          {MedicalReferralInfo && (
            <CollapsibleCard
              title="Medical Referrals"
              iconName="medical"
              classNameValue="mt-8">
              {MedicalReferralInfo?.list?.map(eachInfo => (
                <View className="flex-row mb-2 space-x-2" key={eachInfo}>
                  <CheckBox
                    style={styles.checkBox}
                    value={true}
                    boxType="square"
                    tintColor="#00B3C1"
                    tintColors={{true: '#00B3C1', false: '#00B3C1'}}
                    onFillColor="#00B3C1"
                    onCheckColor="white"
                    onTintColor="transparent"
                  />
                  <CustomText className="text-sm shrink">
                    Schedule a check-up with your primary care physician within
                    the next week to develop a risk management plan.
                  </CustomText>
                </View>
              ))}
            </CollapsibleCard>
          )}

          {LabTestInfo && (
            <CollapsibleCard
              title={LabTestInfo?.name}
              iconName="lab"
              classNameValue="mt-8">
              {LabTestInfo?.list?.map((eachInfo, idx) => (
                <CustomText
                  className={twMerge(
                    'text-sm border-b border-b-[#E5E7EB] pb-4',
                    idx + 1 >= LabTestInfo?.list?.length && 'border-b-0',
                  )}
                  key={eachInfo}>
                  {eachInfo}
                </CustomText>
              ))}
            </CollapsibleCard>
          )}

          {PeriodicMonitoringInfo && (
            <CollapsibleCard
              title={PeriodicMonitoringInfo?.name}
              iconName="monitoring"
              classNameValue="mt-8">
              <CustomText className="text-sm">
                {PeriodicMonitoringInfo?.body}
              </CustomText>
              {PeriodicMonitoringInfo?.action_name && (
                <RoundedButton
                  text={PeriodicMonitoringInfo?.action_name}
                  className="mt-4"
                />
              )}
            </CollapsibleCard>
          )}

          {LifeStyleInfo && (
            <CollapsibleCard
              title={LifeStyleInfo?.name}
              iconName="lifestyle"
              classNameValue="mt-8">
              {LifeStyleInfo?.list?.map(eachInfo => (
                <Card className="p-4 bg-[#F3F4F6] mb-4" key={eachInfo?.name}>
                  <View className="flex-row items-center justify-between">
                    <Icon name={eachInfo?.name?.toLowerCase()} size={20} />
                    <CustomText className="font-isidoraSemiBold text-base">
                      {eachInfo?.name}
                    </CustomText>
                  </View>
                  <CustomText className="text-sm text-[#4B5363] pt-4">
                    Follow the DASH or Mediterranean diet strictly. Focus on
                    whole, minimally processed foods, and limit alcohol to one
                    drink per day.
                  </CustomText>
                </Card>
              ))}
            </CollapsibleCard>
          )}

          {FooterInfo && (
            <Card className="bg-[#222B45] mt-4">
              <CustomText className="text-white font-isidoraMedium p-4 text-sm">
                {FooterInfo?.body}
              </CustomText>
            </Card>
          )}
          {/* <CollapsibleCard
            title="How did we calculate this?"
            iconName="heart"
            classNameValue="mt-4">
            <CustomText className="text-sm text-[#4B5363] pt-4">
              to be filled...
            </CustomText>
          </CollapsibleCard> */}

          {/* <Card className="mt-4 p-4 bg-white">
            <CustomText className="font-isidoraSemiBold text-base text-center">
              Rate Our Report
            </CustomText>
            <CustomText className="text-base text-center text-[#4B5563] pt-2">
              Help us improve our platform by giving an honest feedback.
            </CustomText>
          </Card> */}
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
  checkBox: {
    transform: isAndroid
      ? [{scaleX: 1}, {scaleY: 1}]
      : [{scaleX: 0.7}, {scaleY: 0.7}],
  },
});
