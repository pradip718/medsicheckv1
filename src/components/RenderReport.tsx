import {NavigationProp, useNavigation} from '@react-navigation/native';
import {View} from 'moti';
import React, {useCallback, useMemo} from 'react';
import useLanguageStore from '../../store/languageStore';
import {Reading} from '../../types/jsons';
import {MainStackParamList} from '../../types/navigation';
import {SubParameter} from '../../types/reports';
import {useGetUserReadingDetail} from '../hooks/api/readings';
import ReportCard from './ReportCard';

const RenderReport = React.memo(
  ({
    readingKey,
    subParameters,
    reading,
    name,
  }: {
    readingKey: string;
    subParameters: SubParameter[];
    reading: Reading | undefined;
    name: string;
  }) => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const {languages} = useLanguageStore();
    const {data: reportData} = useGetUserReadingDetail({
      reading_id: reading?.reading_id || '',
      enabled: false,
    });
    const readingData = useMemo(() => reading?.reading_data || {}, [reading]);

    const handleDetailsPress = useCallback(() => {
      navigation.navigate('ReportDetails', {
        vitalKey: readingKey,
        reportId: reading?.reading_id || '',
      });
    }, [navigation, readingKey, reading?.reading_id]);

    const reportConfig = useMemo(() => {
      if (!reportData || !readingData[readingKey]) return null;
      return reportData.config?.[readingKey];
    }, [reportData, readingData, readingKey]);

    if (!reportConfig) {
      return null;
    }

    const colorRange = reportConfig?.color_range || [];
    const scaleType = reportConfig?.scale_type || 1;
    const healthMetricsTitle = name || reportConfig?.display || '';
    const healthMetricsValue = languages?.round_off_vitals?.includes(readingKey)
      ? Math.round(readingData[readingKey]?.value)
      : readingData[readingKey]?.value || 0;
    const healthMetricsIndex = reportConfig?.unit || '';
    const iconName = readingKey || '';
    const description = reportConfig?.short_intro || '';
    const score = Number(readingData[readingKey]?.value) || 0;
    const category = readingData[readingKey]?.category || '';
    const confidenceLevel = readingData[readingKey]?.confidence_level || null;
    const scaleCriteria = {
      scale: reportConfig?.scale || [],
      measuredValue: score,
    };

    console.log('readingKey', readingKey);

    return (
      <View className="p-4">
        <ReportCard
          readingId={reading?.reading_id ?? ''}
          scaleType={scaleType}
          colorRange={colorRange}
          healthMetricsTitle={healthMetricsTitle}
          healthMetricsValue={healthMetricsValue}
          healthMetricsIndex={healthMetricsIndex}
          iconName={iconName}
          description={description}
          score={score}
          category={category}
          color_value={reportData?.col_val || null}
          scaleCriteria={scaleCriteria}
          confidenceLevel={confidenceLevel}
          subParameters={subParameters}
          onDetailsPress={handleDetailsPress}
        />
      </View>
    );
  },
);

export default RenderReport;
