import {entries, isEmpty, isObject} from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  Reading,
  ReportJson,
  ReportPaginationReadingData,
} from '../../types/jsons';
import {Parameter} from '../../types/reports';
import VitalSignCard from '../screens/Homepage/components/ReportVitalSignCard';
import ReportWellnessScore from '../screens/Homepage/components/ReportWellnessScore';
import customColor from '../theme/customColor';
import Icon from './Icon';
import RenderMultiReport from './RenderMultiReport';
import RenderReport from './RenderReport';
import ReportConfidence from './ReportConfidence';
import {ReportSkeleton} from './Skeleton';
import CustomText from './Text';

const renderSkeleton = () => (
  <View className="p-6">
    <ReportSkeleton />
  </View>
);

const Report = ({
  reading,
  reportData,
  isLoading,
  selectedReading,
}: {
  reading: Reading | undefined;
  reportData: ReportJson | undefined;
  isLoading?: boolean;
  selectedReading: ReportPaginationReadingData | undefined;
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    isObject(reportData) ? Object.keys(reportData.sub_categorisation) : [],
  );

  useEffect(() => {
    setExpandedSections(
      isObject(reportData) ? Object.keys(reportData.sub_categorisation) : [],
    );
  }, [reportData]);

  const {reading_data} = reading || {};

  const readingsConfidence = useMemo(() => {
    return reading_data
      ? Object.entries(reading_data).filter(
          ([_key, value]) => value?.confidence_level,
        )
      : [];
  }, [reading_data]);

  const subCategorisationEntries = useMemo(() => {
    return entries(reportData?.sub_categorisation || {});
  }, [reportData?.sub_categorisation]);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prevState =>
      prevState.includes(key)
        ? prevState.filter(section => section !== key)
        : [...prevState, key],
    );
  }, []);

  const renderCardItem = useCallback(
    (param: Parameter) => (
      <View key={param?.vital_key}>
        {reading_data?.[param?.vital_key] &&
          (param?.vital_key === 'BLOOD_PRESSURE' ? (
            <RenderMultiReport
              readingObj={reading_data.BLOOD_PRESSURE}
              readingKey="BLOOD_PRESSURE"
              reading={reading}
            />
          ) : (
            <RenderReport
              reading={reading}
              readingKey={param.vital_key}
              subParameters={param.subParameters}
              name={param.display}
            />
          ))}
      </View>
    ),
    [reading_data, reading],
  );

  const renderItem = useCallback(
    ({item: [vitalKey, vitalItem]}: {item: [string, Parameter[]]}) => {
      if (isLoading) {
        return (
          <View className="p-6">
            <ReportSkeleton />
          </View>
        );
      }

      if (
        isEmpty(vitalItem) ||
        !vitalItem.some(param => reading_data?.[param.vital_key])
      ) {
        return null;
      }

      const isExpanded = expandedSections.includes(vitalKey);
      return (
        <View>
          <TouchableOpacity
            className="border-b py-4 border-[#868686] px-2 flex-row justify-between items-center"
            onPress={() => toggleSection(vitalKey)}>
            <CustomText className="text-midnight text-base font-isidoraSemiBold">
              {vitalKey}
            </CustomText>
            {reportData?.main_categorisation?.[vitalKey] ? (
              <View className="px-2 rounded-xl items-center flex-row">
                <CustomText className="text-midnight text-base font-isidoraSemiBold">
                  {reportData?.main_categorisation?.[vitalKey]?.category}
                </CustomText>
                <Icon
                  name={isExpanded ? 'collapse' : 'expand'}
                  size={10}
                  color={customColor.black}
                  className="pl-2 self-center"
                />
              </View>
            ) : (
              <Icon
                name={isExpanded ? 'remove' : 'add'}
                size={isExpanded ? 8 : 20}
                color={customColor.black}
                className="px-4 self-center"
              />
            )}
          </TouchableOpacity>
          {isExpanded && vitalItem.map(param => renderCardItem(param))}
        </View>
      );
    },
    [
      expandedSections,
      toggleSection,
      renderCardItem,
      reading_data,
      isLoading,
      reportData,
    ],
  );

  const renderHeaderComponent = useCallback(() => {
    if (!selectedReading) {
      return;
    }
    return (
      <>
        <ReportWellnessScore score={selectedReading?.WELLNESS_INDEX ?? 0} />
        <VitalSignCard timeframe={selectedReading?.created_at ?? ''} />
        <ReportConfidence
          classNameValue="mt-8 mx-4"
          readingsConfidence={readingsConfidence}
          overallConfidence={reading?.confidence_level}
          readingId={selectedReading?.reading_id ?? ''}
        />
      </>
    );
  }, [selectedReading, readingsConfidence, reading]);

  return (
    <FlatList
      data={subCategorisationEntries}
      renderItem={renderItem}
      keyExtractor={(item, idx) => item[0] + idx}
      initialNumToRender={4}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={5000}
      windowSize={2}
      removeClippedSubviews={true}
      ListHeaderComponent={renderHeaderComponent}
      ListEmptyComponent={isLoading ? renderSkeleton : null}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={(data, index) => ({
        length: 50,
        offset: 50 * index,
        index,
      })}
    />
  );
};

export default React.memo(Report);

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 160,
  },
});
