import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import {ColVal, ColorRangeItem, ReadingData} from '../../../types/jsons';
import {getColorForValue} from '../../../utils/methods';
import customColor from '../../theme/customColor';
import Icon from '../Icon';
import ReportScale from '../ReportScale';
import ReportBlockScale from '../ReportScale/ReportBlockScale';
import CustomText from '../Text';

type BloodPressureReportCardProps = {
  readingId: string;
  healthMetricsTitle: string;
  healthMetricsValue: number;
  healthMetricsIndex: string;
  description: string;
  score: number;
  iconName: string;
  diastolicScaleCriteria: any;
  systolicScaleCriteria: any;
  category: string;
  color_value: ColVal;
  data: Record<'diastolic' | 'systolic', ReadingData>;
  systolicScaleType: number;
  systolicColorRange: ColorRangeItem[];
  diastolicScaleType: number;
  diastolicColorRange: ColorRangeItem[];
  onDetailsPress: () => void;
};

const BloodPressureReportCard = (props: BloodPressureReportCardProps) => {
  const {languages} = useLanguageStore();
  const {
    // healthMetricsTitle,
    // healthMetricsValue,
    readingId,
    healthMetricsIndex,
    description,
    score,
    iconName,
    category,
    color_value,
    onDetailsPress,
    diastolicScaleCriteria,
    systolicScaleCriteria,
    data,
    systolicScaleType,
    systolicColorRange,
    diastolicScaleType,
    diastolicColorRange,
  } = props;

  const {measuredValue} = systolicScaleCriteria;

  const selectedColor = getColorForValue(
    measuredValue,
    systolicColorRange || [],
  );
  const color =
    selectedColor || color_value?.Default?.[iconName]?.[category] || 'gray';

  return (
    <Card
      className="py-4 bg-white shadow-black overflow-hidden"
      elevation={5}
      style={styles({color: color}).card}>
      <View className="px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-x-4 items-center">
            <View
              className=" rounded-2xl w-[50px] h-[50px] justify-center items-center"
              style={{
                backgroundColor: color,
              }}>
              <Icon name={iconName} size={30} color={customColor.white} />
            </View>
            <View>
              <CustomText className="text-sm font-isidoraSemiBold">
                {/* {healthMetricsTitle} */}
                {languages?.blood_pressure}
              </CustomText>
              <CustomText className="text-2xl font-isidoraSemiBold mt-2">
                {Math.round(data?.systolic?.value)}
                {'/'}
                {Math.round(data?.diastolic?.value)}
                <CustomText className="text-base font-isidoraSemiBold">
                  {'  '}
                  {healthMetricsIndex}
                </CustomText>
              </CustomText>
            </View>
          </View>
          <View>
            <View
              className="py-2 px-2 rounded-xl items-center"
              style={{
                backgroundColor: color,
              }}>
              <CustomText className="rounded-2xl text-white text-sm font-isidoraBold">
                {category}
              </CustomText>
            </View>
            {!!onDetailsPress && (
              <TouchableOpacity className="mt-2" onPress={onDetailsPress}>
                <CustomText
                  className="underline text-orange text-xs font-isidoraSemiBold"
                  style={{
                    color: color,
                  }}>
                  {languages?.more_details_link_txt}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <CustomText className="mt-4 text-xs font-isidoraMedium">
          {description}
        </CustomText>
      </View>
      <View className="my-4">
        {systolicScaleType === 11 ? (
          <ReportBlockScale
            min={90}
            max={120}
            value={score}
            total={200}
            scaleCriteria={systolicScaleCriteria}
            colorRange={systolicColorRange}
            name="Systolic"
            readingKey={'BLOOD_PRESSURE'}
            readingId={readingId}
          />
        ) : (
          <ReportScale
            min={90}
            max={120}
            value={score}
            total={200}
            scaleCriteria={systolicScaleCriteria}
          />
        )}
      </View>
      <View className="my-8">
        {diastolicScaleType === 11 ? (
          <ReportBlockScale
            readingId={readingId}
            min={90}
            max={120}
            value={score}
            total={200}
            scaleCriteria={diastolicScaleCriteria}
            colorRange={diastolicColorRange}
            name="Diastolic"
            readingKey={'BLOOD_PRESSURE'}
          />
        ) : (
          <ReportScale
            min={90}
            max={120}
            value={score}
            total={200}
            scaleCriteria={diastolicScaleCriteria}
          />
        )}
      </View>
    </Card>
  );
};

export default BloodPressureReportCard;

type StylesheetProps = {
  color: string;
};

export const styles = ({color}: StylesheetProps) =>
  StyleSheet.create({
    card: {
      // borderWidth: 2,
      // borderColor: color,
      // shadowColor: color,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,

      elevation: 8,
    },
  });
