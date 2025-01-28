import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {Reading, ReadingData} from '../../types/jsons';
import {MainStackParamList} from '../../types/navigation';
import {useGetUserReadingDetail} from '../hooks/api/readings';
import BloodPressureReportCard from './ReportCard/BloodPressureReportCard';

const RenderMultiReport = ({
  readingObj,
  readingKey,
  reading,
}: {
  readingObj: ReadingData[string];
  readingKey: string;
  reading: Reading | undefined;
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {data: reportData} = useGetUserReadingDetail({
    reading_id: reading?.reading_id || '',
    enabled: false,
  });
  if (!reportData) {
    return <></>;
  }
  return (
    <View className="px-4">
      <BloodPressureReportCard
        readingId={reading?.reading_id || ''}
        systolicScaleType={reportData.config?.systolic?.scale_type || 1}
        systolicColorRange={reportData.config?.systolic?.color_range || []}
        diastolicScaleType={reportData.config?.diastolic?.scale_type || 1}
        diastolicColorRange={reportData.config?.diastolic?.color_range || []}
        data={readingObj}
        healthMetricsTitle={reportData.config?.[readingKey]?.display}
        healthMetricsValue={Math.round(readingObj.value)}
        healthMetricsIndex={reportData.config?.systolic?.unit || ''}
        iconName={'systolic'}
        description={reportData?.config?.systolic?.short_intro || ''}
        score={Number(readingObj.score)}
        category={readingObj?.systolic?.category}
        color_value={reportData?.col_val}
        diastolicScaleCriteria={{
          // scale: reportData?.data?.config?.['diastolic']?.scale || [],
          scale: {
            range: [0, 300],
            min: 120,
            max: 250,
          },
          measuredValue: readingObj?.diastolic?.value,
        }}
        systolicScaleCriteria={{
          // scale: reportData?.data?.config?.['systolic']?.scale || [],
          scale: {
            range: [0, 200],
            min: 50,
            max: 150,
          },
          measuredValue: readingObj?.systolic?.value,
        }}
        onDetailsPress={() =>
          navigation.navigate('ReportDetails', {
            vitalKey: 'systolic',
            reportId: reading?.reading_id || '',
          })
        }
      />
    </View>
  );
};

export default React.memo(RenderMultiReport);
