import {NavigationProp, useNavigation} from '@react-navigation/native';
import {isEmpty} from 'lodash';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MainStackParamList} from '../../../types/navigation';
import {SubParameter} from '../../../types/reports';
import {screenWidth} from '../../../utils';
import {getColorForValue} from '../../../utils/methods';
import {useGetUserReadingDetail} from '../../hooks/api/readings';
import Icon from '../Icon';
import ReportBlockScale from '../ReportScale/ReportBlockScale';
import CustomText from '../Text';

interface SubParametersProps {
  parameter: SubParameter;
  readingId: string;
}

const SubParameters = ({parameter, readingId}: SubParametersProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {data: reportData} = useGetUserReadingDetail({
    staleTime: Infinity,
    reading_id: readingId,
    enabled: false,
  });
  const report = reportData?.data?.readings?.find(
    eachReading => eachReading.reading_id === readingId,
  );
  const reading = report?.reading_data?.[parameter?.vital_key];
  const colorRange =
    reportData?.data?.config?.[parameter?.vital_key]?.color_range || [];
  const selectedColor = getColorForValue(reading?.value || 0, colorRange || []);

  if (!report || isEmpty(reading)) {
    return <></>;
  }

  const highlightedColor =
    selectedColor ||
    reportData?.data?.col_val?.Default?.[parameter?.vital_key]?.[
      reading?.category || ''
    ] ||
    'gray';

  const onRowPress = () => {
    navigation.navigate('ReportDetails', {
      vitalKey: parameter?.vital_key,
      reportId: readingId,
    });
  };

  const renderIcon = () => (
    <View
      className=" rounded-2xl w-[50px] h-[50px] justify-center items-center border"
      style={{borderColor: highlightedColor}}>
      <Icon name={parameter?.vital_key} size={24} color={highlightedColor} />
    </View>
  );

  return (
    <Pressable
      android_ripple={{
        color: highlightedColor,
        radius: screenWidth,
      }}
      hitSlop={{
        right: 20,
        left: 20,
      }}
      onPress={onRowPress}
      style={[styles.container, {borderBottomColor: highlightedColor}]}
      className="flex-row items-center space-x-4 py-4 border-b">
      <View className="w-[40%] flex-row space-x-4">
        {renderIcon()}
        <View>
          <CustomText
            className="text-sm text-midnight font-isidoraSemiBold"
            numberOfLines={2}
            ellipsizeMode="middle">
            {reportData?.data?.config?.[parameter?.vital_key]?.display || ''}
          </CustomText>
          <CustomText className="text-lg font-isidoraSemiBold text-midnight">
            {reading?.value || 0}
          </CustomText>
        </View>
      </View>
      <View className="flex-1">
        <ReportBlockScale
          min={90}
          max={120}
          value={Number(reading?.score)}
          total={200}
          scaleCriteria={{
            scale:
              reportData?.data?.config?.[parameter?.vital_key]?.scale ||
              ({} as any),
            measuredValue: reading.value,
          }}
          colorRange={colorRange}
          readingKey={parameter?.vital_key}
          readingId={readingId}
        />
      </View>

      <Icon
        name="chevron-right"
        size={18}
        color={highlightedColor}
        className="mx-2"
      />
    </Pressable>
  );
};

export default SubParameters;

const styles = StyleSheet.create({
  container: {},
});
