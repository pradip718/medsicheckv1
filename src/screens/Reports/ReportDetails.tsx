import {RouteProp} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {Image, Linking, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {getColorForValue} from '../../../utils/methods';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import ReportBlockScale from '../../components/ReportScale/ReportBlockScale';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {useGetUserReadingDetail} from '../../hooks/api/readings';
import customColor from '../../theme/customColor';
import BorderGradient from '../FaceScan/BorderGradient';

type ReportDetailsRouteProp = RouteProp<MainStackParamList, 'ReportDetails'>;

interface ReportDetailsProps {
  route: ReportDetailsRouteProp;
}

const ReportDetails = ({route}: ReportDetailsProps) => {
  const {vitalKey, reportId} = route.params;
  const {languages} = useLanguageStore();
  const {data: reportData} = useGetUserReadingDetail({
    staleTime: Infinity,
    reading_id: reportId,
  });

  const color_value = reportData?.col_val;
  const config = reportData?.config;
  const reading = reportData?.readings;

  const readingData = reading?.reading_data?.[vitalKey];

  const bloodPressureReadingData = reading?.reading_data?.BLOOD_PRESSURE || {};

  const category =
    vitalKey === 'systolic'
      ? reading?.reading_data?.BLOOD_PRESSURE?.systolic?.category
      : reading?.reading_data?.[vitalKey]?.category || '';

  const healthMetricsValue =
    vitalKey === 'systolic'
      ? `${reading?.reading_data?.BLOOD_PRESSURE?.systolic?.value}`
      : reading?.reading_data?.[vitalKey]?.value;

  const selectedColor = getColorForValue(
    healthMetricsValue,
    config?.[vitalKey]?.color_range || [],
  );

  const systolicScaleType = reportData?.config?.systolic?.scale_type || 1;
  const diastolicScaleType = reportData?.config?.diastolic?.scale_type || 1;

  const parseAndRenderLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const boldRegex = /<b>(.*?)<\/b>/g;
    const linkRegex = /<link>(.*?)<\/link>/g;

    const handleMatch = (match: string, content: string, index: number) => {
      parts.push(
        <CustomText key={parts.length}>
          {text.substring(lastIndex, index)}
        </CustomText>,
      );
      parts.push(
        <CustomText
          key={parts.length}
          style={match.startsWith('<b>') ? {fontWeight: 'bold'} : {}}>
          {content}
        </CustomText>,
      );
      lastIndex = index + match.length;
    };

    text.replace(
      boldRegex,
      (match: string, content: string, index: number): string => {
        handleMatch(match, content, index);
        return '';
      },
    );

    text.replace(
      linkRegex,
      (match: string, url: string, index: number): string => {
        parts.push(
          <CustomText key={parts.length}>
            {text.substring(lastIndex, index)}
          </CustomText>,
        );
        parts.push(
          <CustomText
            key={parts.length}
            className="text-ultramarineBlue underline"
            onPress={() => Linking.openURL(url)}>
            {url}
          </CustomText>,
        );
        lastIndex = index + match.length;
        return '';
      },
    );

    parts.push(
      <CustomText key={parts.length}>{text.substring(lastIndex)}</CustomText>,
    );

    return parts;
  };

  const imageUrl =
    languages.vitals_with_image?.[
      vitalKey as keyof typeof languages.vitals_with_image
    ];

  return (
    <SafeAreaScrollView>
      <View className="px-4 pt-4">
        <Navbar />
      </View>
      <View className="mt-6 flex-row py-4 px-4 bg-darkCornflowerBlue justify-between items-center">
        <CustomText className="text-white font-isidoraSemiBold">
          {languages?.my_vital_signs}
        </CustomText>
        <CustomText className="text-white text-sm font-isidoraMedium">
          {moment(reading?.created_at).format('DD-MMM-YYYY, h:mm a')}{' '}
        </CustomText>
      </View>

      <LinearGradient
        className="px-6 py-4 flex-row justify-between items-center"
        colors={
          color_value
            ? [
                selectedColor ||
                  color_value?.Default?.[vitalKey]?.[category] ||
                  'gray',

                selectedColor ||
                  color_value?.Default?.[vitalKey]?.[category] ||
                  'gray',
              ]
            : ['gray', 'gray']
        }>
        <View className="flex-row items-center gap-x-4">
          {imageUrl ? (
            <Image source={{uri: imageUrl}} className="h-8 w-8" />
          ) : (
            <Icon name={vitalKey} size={30} color={customColor.white} />
          )}
          <View>
            <CustomText className="text-sm font-isidoraSemiBold">
              {vitalKey === 'systolic'
                ? 'Blood Pressure'
                : config?.[vitalKey]?.display || ''}
            </CustomText>
            <CustomText className="text-2xl font-isidoraSemiBold">
              {vitalKey === 'systolic'
                ? `${reading?.reading_data?.BLOOD_PRESSURE?.systolic?.value}/${reading?.reading_data?.BLOOD_PRESSURE?.diastolic?.value}`
                : reading?.reading_data?.[vitalKey]?.value || ''}{' '}
              <CustomText className="text-base  font-isidoraSemiBold">
                {config?.[vitalKey]?.unit || ''}
              </CustomText>
            </CustomText>
          </View>
        </View>
        <View>
          <CustomText className="text-xs font-isidoraSemiBold">
            {languages?.parameter_status}
          </CustomText>
          <CustomText className="text-base font-isidoraSemiBold text-right">
            {category}
          </CustomText>
        </View>
      </LinearGradient>

      <View className="p-4">
        {vitalKey === 'systolic' ? (
          <>
            <View className="my-4">
              {systolicScaleType === 11 && (
                <ReportBlockScale
                  min={90}
                  max={120}
                  value={bloodPressureReadingData?.['systolic']?.score || 0}
                  total={200}
                  scaleCriteria={{
                    scale: {
                      range: [0, 200],
                      min: 50,
                      max: 150,
                    },
                    measuredValue:
                      bloodPressureReadingData?.['systolic']?.value,
                  }}
                  colorRange={reportData?.config?.systolic?.color_range || []}
                  name="Systolic"
                  readingKey={'BLOOD_PRESSURE'}
                  readingId={reportId}
                />
              )}
            </View>
            <View className="my-8">
              {diastolicScaleType === 11 && (
                <ReportBlockScale
                  min={90}
                  max={120}
                  value={bloodPressureReadingData?.diastolic?.score || 0}
                  total={200}
                  scaleCriteria={{
                    scale: {
                      range: [0, 300],
                      min: 120,
                      max: 250,
                    },
                    measuredValue:
                      bloodPressureReadingData?.['diastolic']?.value,
                  }}
                  colorRange={reportData?.config?.diastolic?.color_range || []}
                  name="Diastolic"
                  readingKey={'BLOOD_PRESSURE'}
                  readingId={reportId}
                />
              )}
            </View>
          </>
        ) : (
          !!reportData &&
          reportData?.config?.[vitalKey]?.scale_type === 11 && (
            <ReportBlockScale
              min={90}
              max={120}
              value={readingData?.score || 0}
              total={200}
              scaleCriteria={{
                scale: reportData?.config?.[vitalKey]?.scale || [],
                measuredValue: readingData?.value,
              }}
              colorRange={reportData?.config?.[vitalKey]?.color_range || []}
              pointerAdjustment={8}
              readingKey={vitalKey}
              readingId={reportId}
            />
          )
        )}
      </View>

      <View className="px-4 py-4 rounded-2xl mx-4 mt-4">
        <BorderGradient
          colors={
            color_value
              ? [
                  selectedColor ||
                    color_value?.Default?.[vitalKey]?.[category] ||
                    'gray',
                  selectedColor ||
                    color_value?.Default?.[vitalKey]?.[category] ||
                    'gray',
                ]
              : ['gray', 'gray']
          }
          innerContainerStyle={styles.borderInnerContainer}
          style={styles.borderOuterContainer}>
          <View className="px-2">
            <CustomText className="text-center text-sm font-isidoraMedium">
              {reportData?.config?.[vitalKey]?.short_intro || ''}
            </CustomText>
          </View>
        </BorderGradient>
      </View>

      <View className="px-8 mt-6">
        <CustomText className="text-sm font-isidoraMedium">
          {parseAndRenderLinks(
            reportData?.config?.[vitalKey]?.long_intro || '',
          )}
        </CustomText>
      </View>
    </SafeAreaScrollView>
  );
};

export default ReportDetails;

const styles = StyleSheet.create({
  borderInnerContainer: {
    margin: 2,
    width: 'auto',
    borderRadius: 20,
    paddingVertical: 10,
  },
  borderOuterContainer: {
    borderRadius: 20,
  },
});
