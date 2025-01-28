import {entries, isEmpty, isObject} from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Reading, ReportJson} from '../../types/jsons';
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
}: {
  reading: Reading | undefined;
  reportData: ReportJson | undefined;
  isLoading?: boolean;
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

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prevState =>
      prevState.includes(key)
        ? prevState.filter(section => section !== key)
        : [...prevState, key],
    );
  }, []);

  const readingsConfidence = useMemo(() => {
    return reading_data
      ? Object.entries(reading_data).filter(
          ([_key, value]) => value?.confidence_level,
        )
      : [];
  }, [reading_data]);

  const renderCardItem = useCallback(
    (param: Parameter) => (
      <View key={param.vital_key}>
        {reading_data?.[param.vital_key] &&
          (param.vital_key === 'BLOOD_PRESSURE' ? (
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
            className="border-b py-4 border-[#868686] px-2 flex-row justify-between"
            onPress={() => toggleSection(vitalKey)}>
            <CustomText className="text-midnight text-base font-isidoraSemiBold">
              {vitalKey}
            </CustomText>
            <Icon
              name={isExpanded ? 'remove' : 'add'}
              size={isExpanded ? 8 : 20}
              color={customColor.black}
              className="px-4 self-center"
            />
          </TouchableOpacity>
          {isExpanded && vitalItem.map(param => renderCardItem(param))}
        </View>
      );
    },
    [expandedSections, toggleSection, renderCardItem, reading_data, isLoading],
  );

  const renderHeaderComponent = useCallback(() => {
    if (!reading) {
      return;
    }
    return (
      <>
        <ReportWellnessScore score={reading?.WELLNESS_INDEX || 0} />
        <VitalSignCard timeframe={reading?.created_at || ''} />
        <ReportConfidence
          classNameValue="mt-8 mx-4"
          readingsConfidence={readingsConfidence}
          overallConfidence={reading?.confidence_level}
          readingId={reading?.reading_id || ''}
        />
      </>
    );
  }, [reading, readingsConfidence]);

  const subCategorisationEntries = useMemo(() => {
    return entries(reportData?.sub_categorisation || {});
  }, [reportData?.sub_categorisation]);

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
