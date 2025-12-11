import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {isNumber, isString} from 'lodash';
import {Image} from 'moti';
import React, {PropsWithChildren, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Card} from 'react-native-paper';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {twMerge} from 'tailwind-merge';
import useHealthRiskStore from '../../../store/healthRisksStore';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {isAndroid} from '../../../utils';
import AnimatedWrapper from '../../components/AnimatedWrapper';
import BasicContainer from '../../components/BasicContainer';
import Icon from '../../components/Icon';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import usePrepareFacescan from '../../hooks/usePrepareFacescan';

type CollapsibleCardProps = {
  title: string;
  icon_url: string;
  classNameValue?: string;
};

const CollapsibleCard = ({
  children,
  title,
  icon_url,
  classNameValue,
}: PropsWithChildren<CollapsibleCardProps>) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <Card className={twMerge('p-4 bg-white', classNameValue)}>
      <TouchableOpacity
        className="flex-row justify-between items-center"
        onPress={() => setIsExpanded(!isExpanded)}>
        <View className="space-x-2 flex-row items-center">
          {!!icon_url && (
            <Image
              source={{uri: icon_url}}
              className="w-8 h-6"
              resizeMode="contain"
            />
          )}
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

const InfoCard = ({
  info,
  iconColor,
  icon_url,
  textColor,
}: {
  info: string | number;
  icon_url: string;
  iconColor: string;
  textColor: string | undefined;
}) => {
  if (!isNumber(info) && !isString(info)) {
    return <></>;
  }
  return (
    <AnimatedWrapper
      isTranslateY={false}
      className="p-2 rounded-lg flex-row items-center space-x-2 mr-2 mb-2 h-8"
      style={{
        backgroundColor: iconColor ?? '#FFE4E6',
      }}>
      <Image
        source={{uri: icon_url}}
        className="w-5 h-full"
        resizeMode="cover"
      />
      <CustomText
        className="font-isidoraMedium"
        style={{color: textColor ?? '#000'}}>
        {info}
      </CustomText>
    </AnimatedWrapper>
  );
};

const ViewRiskScore = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {bottom, top} = useSafeAreaInsets();

  const {engine_name, viewRiskDetails} = useHealthRiskStore();
  const {languages} = useLanguageStore();
  const {startScan} = usePrepareFacescan();

  const ResultInfo = viewRiskDetails?.report_info?.result;
  const MedicalReferralInfo = viewRiskDetails?.report_info?.medical_referral;
  const LabTestInfo = viewRiskDetails?.report_info?.lab_test;
  const PeriodicMonitoringInfo =
    viewRiskDetails?.report_info?.periodic_monitoring;
  const LifeStyleInfo = viewRiskDetails?.report_info?.lifestyle_recommendation;
  const FooterInfo = viewRiskDetails?.report_info?.footer;
  const scoreInfo = viewRiskDetails?.score_info;

  return (
    <BasicContainer className="grow">
      <StatusBar backgroundColor="#242E49" barStyle="light-content" />
      <View className="bg-[#242E49] rounded-b-[32px]" style={{paddingTop: top}}>
        <View className={twMerge('px-4', !isAndroid && 'pt-2')}>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-[#3D4966]  p-4 rounded-lg"
              onPress={() => navigation.navigate('HealthRisks')}>
              <Icon name="back" color="#fff" size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              className="justify-center px-2"
              onPress={() =>
                navigation.navigate('HomepageStackScreens', {
                  screen: 'Home',
                })
              }>
              <Icon name="close" color="#fff" size={24} />
            </TouchableOpacity>
          </View>
          <CustomText className="text-white text-3xl font-isidoraSemiBold mt-6">
            {engine_name === 'hypertension_risk' &&
              languages?.hypertension_risk_title}
            {engine_name === 'diabetes_risk' && languages?.diabetes_risk_title}
          </CustomText>

          <View className="flex-row my-4 shrink flex-wrap">
            {scoreInfo?.show_info !== false && (
              <>
                {!!scoreInfo?.risk_level && (
                  <InfoCard
                    info={scoreInfo?.risk_level ?? ''}
                    icon_url={scoreInfo?.risk_level_img_url ?? ''}
                    iconColor={scoreInfo?.category_color ?? ''}
                    textColor={scoreInfo?.category_text_color}
                  />
                )}
                {!!scoreInfo?.probability && (
                  <InfoCard
                    info={
                      scoreInfo?.probability
                        ? `${scoreInfo?.probability}% chances`
                        : ''
                    }
                    icon_url={scoreInfo?.probability_img_url ?? ''}
                    iconColor={scoreInfo?.probability_color ?? ''}
                    textColor={scoreInfo?.probability_text_color}
                  />
                )}
                {!!scoreInfo?.pre_diabetes_probability && (
                  <InfoCard
                    info={
                      scoreInfo?.pre_diabetes_probability
                        ? `${scoreInfo?.pre_diabetes_probability}% chances`
                        : ''
                    }
                    icon_url={scoreInfo?.pre_diabetes_probability_img_url ?? ''}
                    iconColor={scoreInfo?.pre_diabetes_probability_color ?? ''}
                    textColor={scoreInfo?.pre_diabetes_probability_text_color}
                  />
                )}
                {!!scoreInfo?.diabetes_type_2_probability && (
                  <InfoCard
                    info={
                      scoreInfo?.diabetes_type_2_probability
                        ? `${scoreInfo?.diabetes_type_2_probability}% chances`
                        : ''
                    }
                    icon_url={
                      scoreInfo?.diabetes_type_2_probability_img_url ?? ''
                    }
                    iconColor={
                      scoreInfo?.diabetes_type_2_probability_color ?? ''
                    }
                    textColor={
                      scoreInfo?.diabetes_type_2_probability_text_color
                    }
                  />
                )}
              </>
            )}
          </View>
        </View>
      </View>
      <View className="bg-[#f2f5f9] flex-1" style={{paddingBottom: bottom}}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {ResultInfo && (
            <CollapsibleCard
              title={ResultInfo?.name}
              icon_url={ResultInfo?.image_url ?? ''}>
              <CustomText className="text-sm">
                {ResultInfo?.body ?? ''}
              </CustomText>
            </CollapsibleCard>
          )}

          {MedicalReferralInfo && (
            <CollapsibleCard
              title={MedicalReferralInfo?.name}
              classNameValue="mt-8"
              icon_url={MedicalReferralInfo?.image_url ?? ''}>
              {!!MedicalReferralInfo?.body && (
                <CustomText className="text-sm">
                  {MedicalReferralInfo?.body}
                </CustomText>
              )}
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
                    disabled={true}
                  />
                  <CustomText className="text-sm shrink">{eachInfo}</CustomText>
                </View>
              ))}
            </CollapsibleCard>
          )}

          {LabTestInfo && (
            <CollapsibleCard
              title={LabTestInfo?.name}
              classNameValue="mt-8"
              icon_url={LabTestInfo?.image_url ?? ''}>
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
              icon_url={PeriodicMonitoringInfo?.image_url ?? ''}
              classNameValue="mt-8">
              <CustomText className="text-sm">
                {PeriodicMonitoringInfo?.body}
              </CustomText>
              {PeriodicMonitoringInfo?.action_name && (
                <RoundedButton
                  onPress={startScan}
                  text={PeriodicMonitoringInfo?.action_name}
                  className="mt-4"
                />
              )}
            </CollapsibleCard>
          )}

          {LifeStyleInfo && (
            <CollapsibleCard
              title={LifeStyleInfo?.name}
              icon_url={LifeStyleInfo?.image_url ?? ''}
              classNameValue="mt-8">
              {LifeStyleInfo?.list?.map(eachInfo => (
                <Card className="p-4 bg-[#F3F4F6] mb-4" key={eachInfo?.name}>
                  <View className="flex-row items-center justify-between">
                    <Image
                      source={{uri: eachInfo?.image_url}}
                      className="w-8 h-6"
                      resizeMode="contain"
                    />
                    <CustomText className="font-isidoraSemiBold text-base">
                      {eachInfo?.name}
                    </CustomText>
                  </View>
                  <CustomText className="text-sm pt-4">
                    {eachInfo?.body}
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
            icon_url="heart"
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
      </View>
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
